import type { ReportSlideData } from './report-data';
import type { TimeseriesPoint, BreakdownRow } from '../plausible';

function agg(v: {
  visitors: number;
  pageviews: number;
  visits: number;
  bounce_rate: number;
  visit_duration: number;
}) {
  return {
    visitors: { value: v.visitors },
    pageviews: { value: v.pageviews },
    visits: { value: v.visits },
    bounce_rate: { value: v.bounce_rate },
    visit_duration: { value: v.visit_duration },
  };
}

/** Fixed window for sample charts (28 days). */
export const SAMPLE_SITE_ID = 'preview.example.com';
export const SAMPLE_DATE_FROM = '2026-03-01';
export const SAMPLE_DATE_TO = '2026-03-28';

function sampleTimeseries(): TimeseriesPoint[] {
  const out: TimeseriesPoint[] = [];
  const base = new Date(SAMPLE_DATE_FROM);
  for (let i = 0; i < 28; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const wave = 40 + Math.round(25 * Math.sin(i / 4) + (i % 5) * 8);
    out.push({
      date: iso,
      visitors: wave,
      pageviews: wave + 30 + (i % 7) * 12,
    });
  }
  return out;
}

export const SAMPLE_REPORT_DATA: ReportSlideData = {
  aggregate: agg({
    visitors: 1842,
    pageviews: 6120,
    visits: 2230,
    bounce_rate: 42,
    visit_duration: 186,
  }),
  aggregatePrev: agg({
    visitors: 1520,
    pageviews: 4980,
    visits: 1890,
    bounce_rate: 48,
    visit_duration: 162,
  }),
  timeseries: sampleTimeseries(),
  pages: [
    { page: '/', visitors: 620, pageviews: 1200, bounce_rate: 38, visit_duration: 145 },
    { page: '/pricing', visitors: 310, pageviews: 520, bounce_rate: 44, visit_duration: 98 },
    { page: '/blog/welcome', visitors: 240, pageviews: 380, bounce_rate: 52, visit_duration: 210 },
  ] as BreakdownRow[],
  pagesPrev: [
    { page: '/', visitors: 540, pageviews: 1050, bounce_rate: 40, visit_duration: 138 },
    { page: '/pricing', visitors: 335, pageviews: 510, bounce_rate: 46, visit_duration: 92 },
    { page: '/blog/welcome', visitors: 200, pageviews: 310, bounce_rate: 55, visit_duration: 195 },
    { page: '/about', visitors: 88, pageviews: 120, bounce_rate: 48, visit_duration: 60 },
  ] as BreakdownRow[],
  countries: [
    { country: 'GB', visitors: 890 },
    { country: 'US', visitors: 420 },
    { country: 'DE', visitors: 180 },
    { country: 'FR', visitors: 120 },
    { country: 'NL', visitors: 95 },
  ] as BreakdownRow[],
  sources: [
    { source: 'Google', visitors: 800, bounce_rate: 40, visit_duration: 175 },
    { source: '(direct)', visitors: 520, bounce_rate: 35, visit_duration: 200 },
    { source: 'Twitter', visitors: 180, bounce_rate: 55, visit_duration: 90 },
  ] as BreakdownRow[],
  sourcesPrev: [
    { source: 'Google', visitors: 710, bounce_rate: 42, visit_duration: 168 },
    { source: '(direct)', visitors: 560, bounce_rate: 36, visit_duration: 188 },
    { source: 'Twitter', visitors: 210, bounce_rate: 58, visit_duration: 85 },
    { source: 'LinkedIn', visitors: 45, bounce_rate: 50, visit_duration: 72 },
  ] as BreakdownRow[],
  channels: [
    { channel: 'Organic search', visitors: 720, bounce_rate: 41, visit_duration: 170 },
    { channel: 'Direct', visitors: 510, bounce_rate: 36, visit_duration: 195 },
    { channel: 'Social', visitors: 190, bounce_rate: 54, visit_duration: 88 },
  ] as BreakdownRow[],
  channelsPrev: [
    { channel: 'Organic search', visitors: 650, bounce_rate: 43, visit_duration: 155 },
    { channel: 'Direct', visitors: 540, bounce_rate: 38, visit_duration: 180 },
    { channel: 'Social', visitors: 220, bounce_rate: 56, visit_duration: 80 },
  ] as BreakdownRow[],
  devices: [
    { device: 'Desktop', visitors: 980 },
    { device: 'Mobile', visitors: 720 },
    { device: 'Tablet', visitors: 142 },
  ] as BreakdownRow[],
  devicesPrev: [
    { device: 'Desktop', visitors: 920 },
    { device: 'Mobile', visitors: 780 },
    { device: 'Tablet', visitors: 130 },
  ] as BreakdownRow[],
  browsers: [
    { browser: 'Chrome', visitors: 1100 },
    { browser: 'Safari', visitors: 420 },
    { browser: 'Firefox', visitors: 180 },
    { browser: 'Edge', visitors: 95 },
  ] as BreakdownRow[],
  browsersPrev: [
    { browser: 'Chrome', visitors: 1020 },
    { browser: 'Safari', visitors: 450 },
    { browser: 'Firefox', visitors: 165 },
    { browser: 'Edge', visitors: 88 },
  ] as BreakdownRow[],
  entryPages: [
    { entry_page: '/', visitors: 540, bounce_rate: 36 },
    { entry_page: '/pricing', visitors: 210, bounce_rate: 48 },
  ] as BreakdownRow[],
  entryPagesPrev: [
    { entry_page: '/', visitors: 500, bounce_rate: 38 },
    { entry_page: '/pricing', visitors: 225, bounce_rate: 50 },
    { entry_page: '/blog/welcome', visitors: 95, bounce_rate: 52 },
  ] as BreakdownRow[],
  exitPages: [
    { exit_page: '/pricing', visitors: 190, visit_duration: 88 },
    { exit_page: '/', visitors: 160, visit_duration: 120 },
  ] as BreakdownRow[],
  exitPagesPrev: [
    { exit_page: '/pricing', visitors: 205, visit_duration: 82 },
    { exit_page: '/', visitors: 148, visit_duration: 110 },
    { exit_page: '/contact', visitors: 72, visit_duration: 95 },
  ] as BreakdownRow[],
  conversions: [
    { goal: 'Signup', visitors: 42, events: 58 },
    { goal: 'Contact', visitors: 18, events: 24 },
  ] as BreakdownRow[],
  conversionsPrev: [
    { goal: 'Signup', visitors: 36, events: 48 },
    { goal: 'Contact', visitors: 22, events: 28 },
    { goal: 'Download', visitors: 9, events: 11 },
  ] as BreakdownRow[],
  os: [
    { os: 'macOS', visitors: 720 },
    { os: 'Windows', visitors: 610 },
    { os: 'iOS', visitors: 380 },
    { os: 'Android', visitors: 95 },
  ] as BreakdownRow[],
  osPrev: [
    { os: 'macOS', visitors: 680 },
    { os: 'Windows', visitors: 640 },
    { os: 'iOS', visitors: 350 },
    { os: 'Android', visitors: 102 },
  ] as BreakdownRow[],
  utmMediums: [
    { utm_medium: 'cpc', visitors: 120, bounce_rate: 44, visit_duration: 120 },
    { utm_medium: 'email', visitors: 85, bounce_rate: 32, visit_duration: 200 },
  ] as BreakdownRow[],
  utmMediumsPrev: [
    { utm_medium: 'cpc', visitors: 105, bounce_rate: 46, visit_duration: 112 },
    { utm_medium: 'email', visitors: 92, bounce_rate: 35, visit_duration: 188 },
    { utm_medium: '(none)', visitors: 40, bounce_rate: 50, visit_duration: 90 },
  ] as BreakdownRow[],
};
