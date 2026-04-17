// PDF generation orchestrator.
// Fetches all Plausible data in parallel, then renders each slide sequentially
// into a hidden off-screen DOM node, captures it with html2canvas, and
// assembles the pages into a jsPDF landscape A4 document.

import * as Plausible from '../plausible';
import {
  createSlideContainer,
  renderFrontCover,
  renderKPIs,
  renderTimeseries,
  renderTopPages,
  renderCountries,
  renderSources,
  renderChannels,
  renderDevicesAndBrowsers,
  renderOS,
  renderUTM,
  renderEntryExitPages,
  renderConversions,
  renderBackCover,
} from './slides';
import { waitForRender } from './charts';
import type { Chart } from 'chart.js';

// A4 portrait in mm
const PAGE_W = 210;
const PAGE_H = 297;

type ProgressCallback = (message: string, percent: number) => void;

async function captureSlide(container: HTMLDivElement): Promise<string> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 794,
    height: 1123,
    onclone: (clonedDoc) => {
      // html2canvas cannot parse oklch() (used extensively in Tailwind v4's
      // CSS custom property definitions). Replace every occurrence in the
      // cloned document's <style> elements before the canvas is drawn.
      // Slide content uses explicit inline hex styles, so this is safe.
      for (const el of Array.from(clonedDoc.querySelectorAll('style'))) {
        if (el.textContent?.includes('oklch')) {
          el.textContent = el.textContent.replace(/oklch\([^)]+\)/g, 'transparent');
        }
      }
    },
  });
  return canvas.toDataURL('image/png');
}

export async function generatePDF(
  siteId: string,
  dateRange: string,
  dateFrom: string,
  dateTo: string,
  onProgress: ProgressCallback = () => {}
): Promise<void> {
  // ── 1. Fetch all data in parallel ──────────────────────────────────────────
  onProgress('Fetching analytics data…', 5);

  const [
    aggregate,
    timeseries,
    pages,
    countries,
    sources,
    channels,
    devices,
    browsers,
    entryPages,
    exitPages,
    conversions,
    os,
    utmMediums,
  ] = await Promise.all([
    Plausible.fetchAggregate(siteId, dateRange),
    Plausible.fetchTimeseries(siteId, dateRange),
    Plausible.fetchBreakdown(siteId, dateRange, 'event:page', 'visitors,pageviews,bounce_rate,visit_duration', '20'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:country', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:source', 'visitors,bounce_rate,visit_duration', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:channel', 'visitors,bounce_rate,visit_duration', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:device', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:browser', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:entry_page', 'visitors,visits,bounce_rate', '15'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:exit_page', 'visitors,visit_duration,visits', '15'),
    Plausible.fetchBreakdown(siteId, dateRange, 'event:goal', 'visitors,events', '20'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:os', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:utm_medium', 'visitors,bounce_rate,visit_duration', '20'),
  ]);

  // ── 2. Initialise jsPDF ────────────────────────────────────────────────────
  onProgress('Preparing document…', 20);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  // ── 3. Define slide sequence ───────────────────────────────────────────────
  type SlideEntry = {
    label: string;
    render: (container: HTMLDivElement, ...args: never[]) => void;
    args: unknown[];
  };

  const slides: SlideEntry[] = [
    { label: 'Front cover',          render: renderFrontCover as never,         args: [siteId, dateFrom, dateTo] },
    { label: 'Overview KPIs',        render: renderKPIs as never,               args: [aggregate] },
    { label: 'Traffic over time',    render: renderTimeseries as never,         args: [timeseries] },
    { label: 'Top pages',            render: renderTopPages as never,           args: [pages] },
    { label: 'Visitors by country',  render: renderCountries as never,          args: [countries] },
    { label: 'Traffic sources',      render: renderSources as never,            args: [sources] },
    { label: 'Channels',             render: renderChannels as never,           args: [channels] },
    { label: 'Devices & browsers',   render: renderDevicesAndBrowsers as never, args: [devices, browsers] },
    { label: 'Operating systems',    render: renderOS as never,                 args: [os] },
    { label: 'UTM campaigns',        render: renderUTM as never,               args: [utmMediums] },
    { label: 'Entry & exit pages',   render: renderEntryExitPages as never,     args: [entryPages, exitPages] },
    { label: 'Conversions',          render: renderConversions as never,        args: [conversions] },
    { label: 'Back cover',           render: renderBackCover as never,          args: [siteId, dateFrom, dateTo] },
  ];

  // ── 4. Render each slide sequentially ─────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const percent = 20 + Math.round((i / slides.length) * 70);
    onProgress(`Rendering: ${slide.label}…`, percent);

    if (i > 0) pdf.addPage();

    const container = createSlideContainer();
    try {
      slide.render(container, ...(slide.args as never[]));
      await waitForRender();
      const dataUrl = await captureSlide(container);
      pdf.addImage(dataUrl, 'PNG', 0, 0, PAGE_W, PAGE_H, undefined, 'FAST');
    } finally {
      // Destroy any Chart.js instances to free canvas contexts
      const charts = (container as HTMLDivElement & { __charts?: Chart[] }).__charts ?? [];
      charts.forEach((c) => c.destroy());
      document.body.removeChild(container);
    }
  }

  // ── 5. Download ────────────────────────────────────────────────────────────
  onProgress('Saving PDF…', 95);
  const filename = `${siteId.replace(/[^a-z0-9]/gi, '_')}_${dateFrom}_${dateTo}.pdf`;
  pdf.save(filename);
  onProgress('Done!', 100);
}
