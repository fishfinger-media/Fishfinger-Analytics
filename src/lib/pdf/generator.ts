// PDF generation orchestrator.
// Fetches all Plausible data in parallel, then renders each slide sequentially
// into a hidden off-screen DOM node, captures it with html2canvas, and
// assembles the pages into a jsPDF A4 landscape document.

import { fetchReportSlideData } from './report-data';
import { getSlideSpecs } from './slide-specs';
import { createSlideContainer, SLIDE_HEIGHT_PX, SLIDE_WIDTH_PX, waitForImages } from './slides';
import { waitForRender } from './charts';
import type { Chart } from 'chart.js';

// A4 landscape in mm
const PAGE_W = 297;
const PAGE_H = 210;

type ProgressCallback = (message: string, percent: number) => void;

async function captureSlide(container: HTMLDivElement): Promise<string> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: SLIDE_WIDTH_PX,
    height: SLIDE_HEIGHT_PX,
    onclone: (clonedDoc) => {
      // html2canvas cannot parse `oklch()` (used by Tailwind v4). The PDF slides
      // use explicit inline hex styles, so we can safely remove global stylesheets
      // (Tailwind, app chrome, etc.) from the cloned document to prevent `oklch()`
      // from ever reaching the parser.
      //
      // Keep only our PDF reset (injected by slides.ts) if present.
      const head = clonedDoc.head;
      for (const node of Array.from(head.querySelectorAll('link[rel="stylesheet"], style'))) {
        const el = node as HTMLElement;
        const id = el.getAttribute('id') ?? '';
        if (id === 'pdf-oklch-reset') continue;
        node.parentNode?.removeChild(node);
      }

      // Defensive: if any inline <style> remained, strip any oklch() fragments.
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
  _dateRange: string,
  dateFrom: string,
  dateTo: string,
  onProgress: ProgressCallback = () => {}
): Promise<void> {
  // ── 1. Fetch all data in parallel ──────────────────────────────────────────
  onProgress('Fetching analytics data…', 5);

  const data = await fetchReportSlideData(siteId, dateFrom, dateTo);

  // Ensure custom faces (TT Norms) are loaded before html2canvas captures slides.
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
    try {
      await document.fonts.load('12px "TT Norms"');
    } catch {
      // ignore
    }
  }

  // ── 2. Initialise jsPDF ────────────────────────────────────────────────────
  onProgress('Preparing document…', 20);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });

  // ── 3. Define slide sequence ───────────────────────────────────────────────
  const slides = getSlideSpecs(siteId, dateFrom, dateTo, data);

  // ── 4. Render each slide sequentially ─────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const percent = 20 + Math.round((i / slides.length) * 70);
    onProgress(`Rendering: ${slide.label}…`, percent);

    if (i > 0) pdf.addPage();

    const container = createSlideContainer();
    try {
      slide.render(container, ...(slide.args as never[]));
      await waitForImages(container);
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
