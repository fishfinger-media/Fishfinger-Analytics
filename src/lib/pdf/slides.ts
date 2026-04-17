// One render function per PDF slide.
// Each function populates a hidden off-screen <div> with HTML + optional Chart.js canvases.
// The div is later captured by html2canvas in generator.ts.

import { createChart, ACCENT, ACCENT2, PALETTE } from './charts';
import type { AggregateResult, TimeseriesPoint, BreakdownRow } from '../plausible';
import type { Chart } from 'chart.js';

// ─── Theme ────────────────────────────────────────────────────────────────────

const BG       = '#ffffff';
const SURFACE  = '#f8fafc';
const SURFACE2 = '#f1f5f9';
const BORDER   = '#e2e8f0';
const BORDER_LT= '#f1f5f9';
const TEXT     = '#0f172a';
const TEXT_SEC = '#334155';
const MUTED    = '#64748b';
const LABEL    = '#94a3b8';

const FONT_BODY = "'Helvetica Neue',Helvetica,Arial,sans-serif";

// Dark chart axis/legend defaults — inline into each chart options object
const darkScaleX = (extra: object = {}) => ({
  grid: { color: BORDER },
  ticks: { color: MUTED, font: { size: 10, family: FONT_BODY } },
  ...extra,
});
const darkScaleY = (extra: object = {}) => ({
  beginAtZero: true,
  grid: { color: BORDER },
  ticks: { color: MUTED, font: { size: 10, family: FONT_BODY } },
  ...extra,
});
const darkLegend = {
  labels: { color: TEXT_SEC, font: { size: 11, family: FONT_BODY }, boxWidth: 12, padding: 16 },
};

// ─── DOM helpers ─────────────────────────────────────────────────────────────

let oklchResetInjected = false;
function injectOklchReset(): void {
  if (oklchResetInjected) return;
  oklchResetInjected = true;
  const style = document.createElement('style');
  style.id = 'pdf-oklch-reset';
  style.textContent = `
    .pdf-slide, .pdf-slide * {
      color: #0f172a;
      border-color: #e2e8f0;
      outline-color: transparent;
      text-decoration-color: #0f172a;
      caret-color: #0f172a;
    }
    .pdf-slide {
      background-color: #ffffff;
    }
  `;
  document.head.appendChild(style);
}

export function createSlideContainer(): HTMLDivElement {
  injectOklchReset();
  const div = document.createElement('div');
  div.className = 'pdf-slide';
  div.style.cssText = [
    'position:fixed',
    'left:-9999px',
    'top:0',
    'width:794px',
    'height:1123px',
    `background-color:${BG}`,
    `color:${TEXT}`,
    `font-family:${FONT_BODY}`,
    'overflow:hidden',
    'box-sizing:border-box',
  ].join(';');
  document.body.appendChild(div);
  return div;
}

/** Store chart instances on the container so generator.ts can destroy them after capture */
function storeCharts(container: HTMLDivElement, charts: Chart[]): void {
  (container as HTMLDivElement & { __charts?: Chart[] }).__charts = [
    ...((container as HTMLDivElement & { __charts?: Chart[] }).__charts ?? []),
    ...charts,
  ];
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

function fmt(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '—';
  return num.toLocaleString('en-GB');
}

function fmtDuration(seconds: number | string): string {
  const s = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  if (isNaN(s) || s < 0) return '—';
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

function pct(n: number | string): string {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (isNaN(num)) return '—';
  return `${Math.round(num)}%`;
}

// ─── Shared layout helpers ────────────────────────────────────────────────────

/** Standard content wrapper with consistent padding */
const WRAP = `padding:48px 56px 44px;height:100%;box-sizing:border-box`;

/** Section heading with amber left-border accent */
function slideHeader(title: string, subtitle: string): string {
  return `
    <div style="border-left:4px solid ${ACCENT};padding-left:18px;margin-bottom:36px;">
      <h1 style="font-family:${FONT_BODY};font-size:28px;font-weight:700;color:${TEXT};margin:0 0 6px 0;letter-spacing:-0.5px;">${title}</h1>
      <p style="font-size:12px;color:${MUTED};margin:0;font-family:${FONT_BODY};">${subtitle}</p>
    </div>
  `;
}

/** Dark-themed table. maxRows controls overflow guard. */
function table(
  headers: Array<{ label: string; right?: boolean }>,
  rows: string[][]
): string {
  const TH = `padding:11px 16px;font-family:${FONT_BODY};font-size:10px;font-weight:700;color:${LABEL};
    text-transform:uppercase;letter-spacing:0.08em;background:${SURFACE};border-bottom:2px solid ${BORDER}`;
  const TD = `padding:11px 16px;font-family:${FONT_BODY};font-size:12px;color:${TEXT_SEC};
    border-bottom:1px solid ${BORDER_LT}`;
  const TDR = TD + ';text-align:right;font-variant-numeric:tabular-nums';
  const THR = TH + ';text-align:right';

  const ths = headers.map((h) => `<th style="${h.right ? THR : TH}">${h.label}</th>`).join('');
  const trs = rows
    .map(
      (row) =>
        `<tr>${row
          .map((cell, i) => `<td style="${headers[i]?.right ? TDR : TD}">${cell}</td>`)
          .join('')}</tr>`
    )
    .join('');

  return `<table style="width:100%;border-collapse:collapse;">
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;
}

/** Truncate long strings with ellipsis */
function trunc(str: string, max = 52): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

// ─── Slide 1: Front cover ─────────────────────────────────────────────────────

export function renderFrontCover(
  container: HTMLDivElement,
  siteId: string,
  dateFrom: string,
  dateTo: string
): void {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  container.innerHTML = `
    <div style="width:794px;height:1123px;background:${BG};display:flex;flex-direction:column;box-sizing:border-box;">

      <!-- Top amber rule -->
      <div style="height:5px;background:${ACCENT};flex-shrink:0;"></div>

      <!-- Main body -->
      <div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;padding:64px 64px 60px;">

        <!-- Brand mark -->
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:${ACCENT};border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="8" width="3" height="7" rx="1" fill="${BG}"/>
              <rect x="6" y="5" width="3" height="10" rx="1" fill="${BG}"/>
              <rect x="11" y="2" width="3" height="13" rx="1" fill="${BG}"/>
            </svg>
          </div>
          <span style="font-family:${FONT_BODY};font-size:13px;font-weight:700;color:${MUTED};letter-spacing:0.12em;text-transform:uppercase;">Fishfinger Analytics</span>
        </div>

        <!-- Hero text -->
        <div>
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};letter-spacing:0.2em;text-transform:uppercase;margin-bottom:24px;">Analytics Report</div>
          <div style="font-family:${FONT_BODY};font-size:48px;font-weight:700;color:${TEXT};letter-spacing:-1.5px;line-height:1.1;margin-bottom:28px;word-break:break-word;">${siteId}</div>
          <div style="width:56px;height:4px;background:${ACCENT};margin-bottom:28px;border-radius:2px;"></div>
          <div style="font-family:${FONT_BODY};font-size:18px;color:${MUTED};font-weight:400;">${dateFrom} &ndash; ${dateTo}</div>
        </div>

        <!-- Footer meta -->
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="font-family:${FONT_BODY};font-size:11px;color:${LABEL};">Generated ${today}</div>
          <div style="font-family:${FONT_BODY};font-size:11px;color:${LABEL};">Powered by Plausible Analytics</div>
        </div>
      </div>

      <!-- Bottom accent -->
      <div style="height:3px;background:${SURFACE2};flex-shrink:0;"></div>
    </div>
  `;
}

// ─── Slide 2: KPI overview ────────────────────────────────────────────────────

export function renderKPIs(
  container: HTMLDivElement,
  data: AggregateResult
): void {
  const topCards = [
    { label: 'Unique Visitors',    value: fmt(data.visitors.value),           sub: 'people reached' },
    { label: 'Total Pageviews',    value: fmt(data.pageviews.value),           sub: 'pages loaded' },
    { label: 'Visits / Sessions',  value: fmt(data.visits.value),              sub: 'sessions recorded' },
  ];
  const bottomCards = [
    { label: 'Bounce Rate',        value: pct(data.bounce_rate.value),         sub: 'single-page sessions' },
    { label: 'Avg. Visit Duration',value: fmtDuration(data.visit_duration.value), sub: 'time on site' },
  ];

  function card(c: { label: string; value: string; sub: string }, wide = false): string {
    return `
      <div style="background:${SURFACE};border:1px solid ${BORDER};border-top:3px solid ${ACCENT};
        border-radius:10px;padding:32px 28px;box-sizing:border-box;${wide ? 'flex:1;' : ''}">
        <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
          text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">${c.label}</div>
        <div style="font-family:${FONT_BODY};font-size:42px;font-weight:700;color:${TEXT};
          letter-spacing:-1px;line-height:1;margin-bottom:10px;">${c.value}</div>
        <div style="font-family:${FONT_BODY};font-size:11px;color:${MUTED};">${c.sub}</div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="${WRAP};display:flex;flex-direction:column;">
      ${slideHeader('Overview', 'Key performance metrics for the selected period')}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-bottom:18px;">
        ${topCards.map((c) => card(c)).join('')}
      </div>
      <div style="display:flex;gap:18px;">
        ${bottomCards.map((c) => card(c, true)).join('')}
      </div>
    </div>
  `;
}

// ─── Slide 3: Traffic over time ───────────────────────────────────────────────

export function renderTimeseries(
  container: HTMLDivElement,
  data: TimeseriesPoint[]
): void {
  container.innerHTML = `
    <div style="${WRAP};display:flex;flex-direction:column;">
      ${slideHeader('Traffic Over Time', 'Daily visitors and pageviews across the report period')}
      <div style="flex:1;position:relative;">
        <canvas id="ts-chart" width="682" height="850" style="display:block;"></canvas>
      </div>
    </div>
  `;

  const canvas = container.querySelector<HTMLCanvasElement>('#ts-chart')!;
  const chart = createChart(canvas, {
    type: 'line',
    data: {
      labels: data.map((d) => d.date),
      datasets: [
        {
          label: 'Visitors',
          data: data.map((d) => d.visitors),
          borderColor: ACCENT,
          backgroundColor: `${ACCENT}18`,
          fill: true,
          tension: 0.35,
          pointRadius: data.length > 30 ? 0 : 4,
          pointBackgroundColor: ACCENT,
          borderWidth: 2.5,
        },
        {
          label: 'Pageviews',
          data: data.map((d) => d.pageviews),
          borderColor: ACCENT2,
          backgroundColor: `${ACCENT2}14`,
          fill: true,
          tension: 0.35,
          pointRadius: data.length > 30 ? 0 : 4,
          pointBackgroundColor: ACCENT2,
          borderWidth: 2.5,
        },
      ],
    },
    options: {
      animation: false,
      responsive: false,
      plugins: { legend: { position: 'bottom', ...darkLegend } },
      scales: {
        x: darkScaleX({ grid: { color: BORDER }, ticks: { color: MUTED, maxRotation: 0, maxTicksLimit: 12, font: { size: 10, family: FONT_BODY } } }),
        y: darkScaleY(),
      },
    },
  });
  storeCharts(container, [chart]);
}

// ─── Slide 4: Top pages ───────────────────────────────────────────────────────

export function renderTopPages(
  container: HTMLDivElement,
  data: BreakdownRow[]
): void {
  const rows = data.slice(0, 14).map((r) => [
    trunc(String(r.page ?? r['event:page'] ?? ''), 48),
    fmt(r.visitors as number),
    fmt(r.pageviews as number),
    pct(r.bounce_rate as number),
    fmtDuration(r.visit_duration as number),
  ]);

  container.innerHTML = `
    <div style="${WRAP};">
      ${slideHeader('Top Pages', 'Most visited pages during the period')}
      ${table(
        [
          { label: 'Page' },
          { label: 'Visitors', right: true },
          { label: 'Pageviews', right: true },
          { label: 'Bounce Rate', right: true },
          { label: 'Avg. Time', right: true },
        ],
        rows
      )}
    </div>
  `;
}

// ─── Slide 5: Visitors by country ────────────────────────────────────────────

export function renderCountries(
  container: HTMLDivElement,
  data: BreakdownRow[]
): void {
  const top = data.slice(0, 14);
  container.innerHTML = `
    <div style="${WRAP};display:flex;flex-direction:column;">
      ${slideHeader('Visitors by Country', 'Top 14 countries by unique visitors')}
      <div style="flex:1;position:relative;">
        <canvas id="country-chart" width="682" height="840" style="display:block;"></canvas>
      </div>
    </div>
  `;

  const canvas = container.querySelector<HTMLCanvasElement>('#country-chart')!;
  const chart = createChart(canvas, {
    type: 'bar',
    data: {
      labels: top.map((r) => String(r.country ?? r['visit:country'] ?? '')),
      datasets: [
        {
          label: 'Visitors',
          data: top.map((r) => Number(r.visitors)),
          backgroundColor: `${ACCENT}cc`,
          hoverBackgroundColor: ACCENT,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: false,
      plugins: { legend: { display: false } },
      scales: {
        x: darkScaleX({ beginAtZero: true }),
        y: darkScaleY({ grid: { display: false }, ticks: { color: TEXT_SEC, font: { size: 11, family: FONT_BODY } } }),
      },
    },
  });
  storeCharts(container, [chart]);
}

// ─── Slide 6: Traffic sources ─────────────────────────────────────────────────

export function renderSources(
  container: HTMLDivElement,
  data: BreakdownRow[]
): void {
  const top = data.slice(0, 10);
  const rows = top.map((r) => [
    trunc(String(r.source ?? r['visit:source'] ?? '(direct)'), 36),
    fmt(r.visitors as number),
    pct(r.bounce_rate as number),
    fmtDuration(r.visit_duration as number),
  ]);

  container.innerHTML = `
    <div style="${WRAP};display:flex;flex-direction:column;">
      ${slideHeader('Traffic Sources', 'Top referrer sources driving visitors to the site')}
      <div style="margin-bottom:28px;">
        <canvas id="source-chart" width="682" height="340" style="display:block;"></canvas>
      </div>
      ${table(
        [
          { label: 'Source' },
          { label: 'Visitors', right: true },
          { label: 'Bounce', right: true },
          { label: 'Avg. Time', right: true },
        ],
        rows
      )}
    </div>
  `;

  const canvas = container.querySelector<HTMLCanvasElement>('#source-chart')!;
  const chart = createChart(canvas, {
    type: 'bar',
    data: {
      labels: top.map((r) => trunc(String(r.source ?? r['visit:source'] ?? '(direct)'), 24)),
      datasets: [
        {
          label: 'Visitors',
          data: top.map((r) => Number(r.visitors)),
          backgroundColor: `${ACCENT}cc`,
          hoverBackgroundColor: ACCENT,
          borderRadius: 5,
          borderSkipped: false,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: false,
      plugins: { legend: { display: false } },
      scales: {
        x: darkScaleX({ beginAtZero: true }),
        y: darkScaleY({ grid: { display: false }, ticks: { color: TEXT_SEC, font: { size: 10, family: FONT_BODY } } }),
      },
    },
  });
  storeCharts(container, [chart]);
}

// ─── Slide 7: Channels ────────────────────────────────────────────────────────

export function renderChannels(
  container: HTMLDivElement,
  data: BreakdownRow[]
): void {
  const rows = data.slice(0, 12).map((r) => [
    String(r.channel ?? r['visit:channel'] ?? ''),
    fmt(r.visitors as number),
    pct(r.bounce_rate as number),
    fmtDuration(r.visit_duration as number),
  ]);

  container.innerHTML = `
    <div style="${WRAP};">
      ${slideHeader('Channels', 'Traffic breakdown by acquisition channel')}
      ${table(
        [
          { label: 'Channel' },
          { label: 'Visitors', right: true },
          { label: 'Bounce Rate', right: true },
          { label: 'Avg. Duration', right: true },
        ],
        rows
      )}
    </div>
  `;
}

// ─── Slide 8: Devices + Browsers ─────────────────────────────────────────────

export function renderDevicesAndBrowsers(
  container: HTMLDivElement,
  devices: BreakdownRow[],
  browsers: BreakdownRow[]
): void {
  container.innerHTML = `
    <div style="${WRAP};display:flex;flex-direction:column;">
      ${slideHeader('Devices &amp; Browsers', 'How visitors are accessing the site')}
      <div style="display:flex;gap:40px;flex:1;">

        <!-- Left: Device pie -->
        <div style="display:flex;flex-direction:column;width:300px;flex-shrink:0;">
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">Devices</div>
          <canvas id="device-chart" width="300" height="300" style="display:block;"></canvas>
        </div>

        <!-- Right: Browser bars -->
        <div style="display:flex;flex-direction:column;flex:1;">
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;letter-spacing:0.1em;margin-bottom:16px;">Browsers</div>
          <canvas id="browser-chart" width="342" height="760" style="display:block;"></canvas>
        </div>
      </div>
    </div>
  `;

  const deviceCanvas  = container.querySelector<HTMLCanvasElement>('#device-chart')!;
  const browserCanvas = container.querySelector<HTMLCanvasElement>('#browser-chart')!;

  const deviceChart = createChart(deviceCanvas, {
    type: 'pie',
    data: {
      labels: devices.map((d) => String(d.device ?? d['visit:device'] ?? '')),
      datasets: [{
        data: devices.map((d) => Number(d.visitors)),
        backgroundColor: PALETTE,
        borderWidth: 3,
        borderColor: BG,
      }],
    },
    options: {
      animation: false,
      responsive: false,
      plugins: {
        legend: {
          position: 'bottom',
          ...darkLegend,
        },
      },
    },
  });

  const top10browsers = browsers.slice(0, 10);
  const browserChart = createChart(browserCanvas, {
    type: 'bar',
    data: {
      labels: top10browsers.map((b) => String(b.browser ?? b['visit:browser'] ?? '')),
      datasets: [{
        label: 'Visitors',
        data: top10browsers.map((b) => Number(b.visitors)),
        backgroundColor: `${ACCENT2}cc`,
        hoverBackgroundColor: ACCENT2,
        borderRadius: 5,
        borderSkipped: false,
      }],
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: false,
      plugins: { legend: { display: false } },
      scales: {
        x: darkScaleX({ beginAtZero: true }),
        y: darkScaleY({ grid: { display: false }, ticks: { color: TEXT_SEC, font: { size: 11, family: FONT_BODY } } }),
      },
    },
  });

  storeCharts(container, [deviceChart, browserChart]);
}

// ─── Slide 9: Operating systems ───────────────────────────────────────────────

export function renderOS(
  container: HTMLDivElement,
  os: BreakdownRow[]
): void {
  const top = os.slice(0, 10);
  const total = top.reduce((sum, r) => sum + Number(r.visitors), 0);

  const rows = top.map((r) => [
    String(r.os ?? r['visit:os'] ?? ''),
    fmt(r.visitors as number),
    total > 0 ? pct((Number(r.visitors) / total) * 100) : '—',
  ]);

  container.innerHTML = `
    <div style="${WRAP};display:flex;flex-direction:column;">
      ${slideHeader('Operating Systems', 'Visitor share by OS platform')}
      <div style="margin-bottom:28px;">
        <canvas id="os-chart" width="682" height="460" style="display:block;"></canvas>
      </div>
      ${table(
        [
          { label: 'OS' },
          { label: 'Visitors', right: true },
          { label: 'Share', right: true },
        ],
        rows
      )}
    </div>
  `;

  const osCanvas = container.querySelector<HTMLCanvasElement>('#os-chart')!;
  const osChart = createChart(osCanvas, {
    type: 'bar',
    data: {
      labels: top.map((o) => String(o.os ?? o['visit:os'] ?? '')),
      datasets: [{
        label: 'Visitors',
        data: top.map((o) => Number(o.visitors)),
        backgroundColor: `${ACCENT2}cc`,
        hoverBackgroundColor: ACCENT2,
        borderRadius: 5,
        borderSkipped: false,
      }],
    },
    options: {
      animation: false,
      responsive: false,
      plugins: { legend: { display: false } },
      scales: {
        x: darkScaleX({ grid: { display: false }, ticks: { color: TEXT_SEC, font: { size: 11, family: FONT_BODY } } }),
        y: darkScaleY(),
      },
    },
  });

  storeCharts(container, [osChart]);
}

// ─── Slide 10: UTM campaigns ──────────────────────────────────────────────────

export function renderUTM(
  container: HTMLDivElement,
  data: BreakdownRow[]
): void {
  const rows = data.slice(0, 14).map((r) => [
    trunc(String(r.utm_medium ?? r['visit:utm_medium'] ?? '(none)'), 40),
    fmt(r.visitors as number),
    pct(r.bounce_rate as number),
    fmtDuration(r.visit_duration as number),
  ]);

  const isEmpty = rows.length === 0;

  container.innerHTML = `
    <div style="${WRAP};">
      ${slideHeader('UTM Campaigns', 'Traffic breakdown by UTM medium — email, cpc, social, etc.')}
      ${
        isEmpty
          ? `<div style="margin-top:40px;padding:40px;background:${SURFACE};border:1px solid ${BORDER};
              border-radius:10px;text-align:center;">
              <div style="font-family:${FONT_BODY};font-size:14px;color:${MUTED};line-height:1.6;">
                No UTM campaign data found for this period.
              </div>
            </div>`
          : table(
              [
                { label: 'UTM Medium' },
                { label: 'Visitors', right: true },
                { label: 'Bounce Rate', right: true },
                { label: 'Avg. Duration', right: true },
              ],
              rows
            )
      }
    </div>
  `;
}

// ─── Slide 11: Entry + Exit pages ─────────────────────────────────────────────

export function renderEntryExitPages(
  container: HTMLDivElement,
  entryPages: BreakdownRow[],
  exitPages: BreakdownRow[]
): void {
  const entryRows = entryPages.slice(0, 10).map((r) => [
    trunc(String(r.entry_page ?? r['visit:entry_page'] ?? ''), 30),
    fmt(r.visitors as number),
    pct(r.bounce_rate as number),
  ]);

  const exitRows = exitPages.slice(0, 10).map((r) => [
    trunc(String(r.exit_page ?? r['visit:exit_page'] ?? ''), 30),
    fmt(r.visitors as number),
    fmtDuration(r.visit_duration as number),
  ]);

  container.innerHTML = `
    <div style="${WRAP};">
      ${slideHeader('Entry &amp; Exit Pages', 'Where visitors land first and where they leave from')}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:36px;">
        <div>
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">Top Entry Pages</div>
          ${table(
            [
              { label: 'Page' },
              { label: 'Visitors', right: true },
              { label: 'Bounce', right: true },
            ],
            entryRows
          )}
        </div>
        <div>
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">Top Exit Pages</div>
          ${table(
            [
              { label: 'Page' },
              { label: 'Visitors', right: true },
              { label: 'Avg. Time', right: true },
            ],
            exitRows
          )}
        </div>
      </div>
    </div>
  `;
}

// ─── Slide 12: Conversions ────────────────────────────────────────────────────

export function renderConversions(
  container: HTMLDivElement,
  data: BreakdownRow[]
): void {
  const rows = data.slice(0, 14).map((r) => [
    trunc(String(r.goal ?? r['event:goal'] ?? ''), 52),
    fmt(r.visitors as number),
    fmt(r.events as number),
  ]);

  const isEmpty = rows.length === 0;

  container.innerHTML = `
    <div style="${WRAP};">
      ${slideHeader('Conversions', 'Goal completions tracked in Plausible')}
      ${
        isEmpty
          ? `<div style="margin-top:40px;padding:40px;background:${SURFACE};border:1px solid ${BORDER};
              border-radius:10px;text-align:center;">
              <div style="font-family:${FONT_BODY};font-size:14px;color:${MUTED};line-height:1.6;">
                No goal conversions found for this period.<br/>
                Set up goals in your Plausible dashboard to track conversions here.
              </div>
            </div>`
          : table(
              [
                { label: 'Goal' },
                { label: 'Unique Conversions', right: true },
                { label: 'Total Conversions', right: true },
              ],
              rows
            )
      }
    </div>
  `;
}

// ─── Slide 13: Back cover ─────────────────────────────────────────────────────

export function renderBackCover(
  container: HTMLDivElement,
  siteId: string,
  dateFrom: string,
  dateTo: string
): void {
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  container.innerHTML = `
    <div style="width:794px;height:1123px;background:${BG};display:flex;flex-direction:column;box-sizing:border-box;">

      <!-- Top accent -->
      <div style="height:3px;background:${SURFACE2};flex-shrink:0;"></div>

      <!-- Main body -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:64px;">

        <!-- Logo mark -->
        <div style="width:56px;height:56px;background:${ACCENT};border-radius:14px;
          display:flex;align-items:center;justify-content:center;margin-bottom:32px;">
          <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="8" width="3" height="7" rx="1" fill="${BG}"/>
            <rect x="6" y="5" width="3" height="10" rx="1" fill="${BG}"/>
            <rect x="11" y="2" width="3" height="13" rx="1" fill="${BG}"/>
          </svg>
        </div>

        <div style="font-family:${FONT_BODY};font-size:12px;font-weight:700;color:${LABEL};
          letter-spacing:0.15em;text-transform:uppercase;margin-bottom:24px;">Fishfinger Analytics</div>

        <div style="font-family:${FONT_BODY};font-size:40px;font-weight:700;color:${TEXT};
          letter-spacing:-1px;text-align:center;margin-bottom:14px;">${siteId}</div>

        <div style="font-family:${FONT_BODY};font-size:14px;color:${MUTED};margin-bottom:48px;">
          ${dateFrom} &ndash; ${dateTo}
        </div>

        <div style="width:56px;height:3px;background:${BORDER};border-radius:2px;margin-bottom:48px;"></div>

        <div style="font-family:${FONT_BODY};font-size:11px;color:${LABEL};text-align:center;line-height:2;">
          Data sourced from Plausible Analytics &middot; plausible.io<br/>
          Generated ${today}
        </div>
      </div>

      <!-- Bottom amber rule -->
      <div style="height:5px;background:${ACCENT};flex-shrink:0;"></div>
    </div>
  `;
}
