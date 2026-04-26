// One render function per PDF slide.
// Each function populates a hidden off-screen <div> with HTML + optional Chart.js canvases.
// The div is later captured by html2canvas in generator.ts.

import { createChart, ACCENT, ACCENT2 } from './charts';
import type { AggregateResult, TimeseriesPoint, BreakdownRow } from '../plausible';
import type { Chart } from 'chart.js';

/** A4 landscape at ~96 CSS px/in — must match `generator.ts` capture + jsPDF page size */
export const SLIDE_WIDTH_PX = 1123;
export const SLIDE_HEIGHT_PX = 794;
/** Chart.js backing-store scale for country bar chart (html2canvas + thin bars). */
const PDF_COUNTRY_CHART_DPR = 3;
const PANEL_PAD_Y = 44 * 2; // matches slideFrame() right-panel padding (top+bottom)
const CONTENT_H_PX = SLIDE_HEIGHT_PX - PANEL_PAD_Y;
const SIDEBAR_W_PX = 270; // matches slideFrame()
const PANEL_PAD_X = 48 * 2; // matches slideFrame() right-panel padding (left+right)
const CONTENT_W_PX = SLIDE_WIDTH_PX - SIDEBAR_W_PX - PANEL_PAD_X;

// ─── Theme ────────────────────────────────────────────────────────────────────

const BG       = '#ffffff';
const SURFACE  = '#ffffff';
const SURFACE2 = '#f1f5f9';
const BORDER   = '#e2e8f0';
const BORDER_LT= '#f1f5f9';
const TEXT     = '#0f172a';
const TEXT_SEC = '#334155';
const MUTED    = '#64748b';
const LABEL    = '#94a3b8';

// New PDF chrome
const SIDEBAR_BG = '#4982B8';
const PANEL_BG = '#E9EDF2';
/** Bar chart fill + all PDF table `th` headers */
const ACCENT_BLUE = '#3792ff';

const FONT_BODY = "'TT Norms','Helvetica Neue',Helvetica,Arial,sans-serif";

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
    .pdf-slide th {
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      scale: 1.01;
    }
    .pdf-slide thead + tbody tr:first-child td {
      border-top: 1px solid ${BORDER};
    }
    /* Entry/exit page URLs only: avoid // and path slashes visually merging in html2canvas */
    .pdf-slide .pdf-url-path {
      font-variant-ligatures: none;
    }
  `;
  document.head.appendChild(style);
}

export type CreateSlideContainerOptions = {
  /**
   * When true (default), the slide is parked off-screen on `document.body` for PDF capture.
   * When false, the caller must append the node; use `position:relative` for in-page preview.
   */
  attachToBody?: boolean;
};

export function createSlideContainer(options: CreateSlideContainerOptions = {}): HTMLDivElement {
  const attachToBody = options.attachToBody !== false;
  injectOklchReset();
  const div = document.createElement('div');
  div.className = 'pdf-slide';
  div.style.cssText = [
    attachToBody ? 'position:fixed;left:-9999px;top:0' : 'position:relative',
    `width:${SLIDE_WIDTH_PX}px`,
    `height:${SLIDE_HEIGHT_PX}px`,
    `background-color:${BG}`,
    `color:${TEXT}`,
    `font-family:${FONT_BODY}`,
    'overflow:hidden',
    'box-sizing:border-box',
  ].join(';');
  if (attachToBody) document.body.appendChild(div);
  return div;
}

/** Wait for slide `<img>` assets so capture/preview does not run before decode (e.g. back cover). */
export function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })
    )
  ).then(() => undefined);
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

/** Lazy `Intl.DisplayNames` for ISO 3166-1 alpha-2 → English country name */
let regionDisplayNames: Intl.DisplayNames | undefined;
function countryFullName(codeRaw: string): string {
  const raw = codeRaw.trim();
  if (!raw) return '—';
  const upper = raw.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return raw;
  try {
    regionDisplayNames ??= new Intl.DisplayNames(['en-GB'], { type: 'region' });
    return regionDisplayNames.of(upper) ?? raw;
  } catch {
    return raw;
  }
}

/**
 * Chart.js category labels: each inner string is one line (`string[]` per tick).
 * @see https://www.chartjs.org/docs/latest/axes/cartesian/category.html
 */
function wrapCategoryLines(
  text: string,
  maxCharsPerLine: number,
  maxLines: number
): string | string[] {
  if (text.length <= maxCharsPerLine) return text;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let i = 0;

  while (i < words.length && lines.length < maxLines) {
    let chunk = '';
    while (i < words.length) {
      const w = words[i];
      if (w.length > maxCharsPerLine) {
        if (chunk) break;
        lines.push(w.slice(0, maxCharsPerLine));
        const rest = w.slice(maxCharsPerLine);
        if (rest) words[i] = rest;
        else i++;
        break;
      }
      const candidate = chunk ? `${chunk} ${w}` : w;
      if (candidate.length <= maxCharsPerLine) {
        chunk = candidate;
        i++;
      } else {
        break;
      }
    }
    if (chunk) lines.push(chunk);
  }

  if (i < words.length && lines.length > 0) {
    const li = lines.length - 1;
    const base = lines[li].replace(/…$/, '').trimEnd();
    lines[li] = `${base.slice(0, Math.max(1, maxCharsPerLine - 1)).trimEnd()}…`;
  }

  if (lines.length === 0) return `${text.slice(0, Math.max(1, maxCharsPerLine - 1)).trimEnd()}…`;
  return lines.length === 1 ? lines[0] : lines;
}

// ─── Shared layout helpers ────────────────────────────────────────────────────

/** Standard content wrapper with consistent padding */
const WRAP = `padding:48px 56px 44px;height:100%;box-sizing:border-box`;

/** Section heading with amber left-border accent */
function slideHeader(title: string, subtitle: string): string {
  return `
    <div style="border-left:4px solid ${ACCENT};padding-left:18px;margin-bottom:36px;">
      <h1 style="font-family:${FONT_BODY};font-size:28px;font-weight:700;color:${TEXT};margin:0 0 6px 0;">${title}</h1>
      <p style="font-size:12px;color:${MUTED};margin:0;font-family:${FONT_BODY};">${subtitle}</p>
    </div>
  `;
}

type SlideMeta = {
  siteId: string;
  dateFrom: string;
  dateTo: string;
};

function fmtMonthYear(dateStr: string): string {
  // Expect YYYY-MM-DD (Plausible style). Fallback to raw string if parse fails.
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return dateStr;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

function fmtMonthYearRange(dateFrom: string, dateTo: string): string {
  return `${fmtMonthYear(dateFrom)} \u2013 ${fmtMonthYear(dateTo)}`;
}

function slideFrame(meta: SlideMeta, title: string, description: string, contentHtml: string): string {
  const safeSite = escHtml(meta.siteId);
  const safeTitle = escHtml(title);
  const safeDesc = escHtml(description);
  const range = escHtml(fmtMonthYearRange(meta.dateFrom, meta.dateTo));

  const sidebarW = 270;
  const padTop = 44;
  const padBottom = 42;

  return `
    <div style="width:${SLIDE_WIDTH_PX}px;height:${SLIDE_HEIGHT_PX}px;background:${PANEL_BG};position:relative;overflow:hidden;">
      <div style="position:absolute;left:0;top:0;bottom:0;width:${sidebarW}px;background:${SIDEBAR_BG};">
        <div style="position:absolute;left:34px;right:28px;top:${padTop}px;">
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;text-transform:uppercase;color:#eaf2ff;opacity:0.95;">
            ${safeSite}
          </div>
        </div>

        <div style="position:absolute;left:34px;right:28px;top:140px;">
          <div style="font-family:${FONT_BODY};font-size:34px;font-weight:700;line-height:1.05;color:#ffffff;margin:0 0 12px 0;">
            ${safeTitle}
          </div>
          <div style="font-family:${FONT_BODY};font-size:12px;line-height:1.55;color:#d7e7ff;opacity:0.95;">
            ${safeDesc}
          </div>
        </div>

        <div style="position:absolute;left:34px;right:28px;bottom:${padBottom}px;">
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:600;text-transform:uppercase;color:#eaf2ff;opacity:0.95;">
            ${range}
          </div>
        </div>
      </div>

      <div style="
        position:absolute;
        left:${sidebarW}px; top:0; right:0; bottom:0;
        background:${PANEL_BG};
        box-sizing:border-box;
        padding:44px 48px;
        overflow:hidden;
      ">
        ${contentHtml}
      </div>
    </div>
  `;
}

const TABLE_HEADER_RADIUS_PX = 8;
const TABLE_ROW_DIVIDER = '#d3d7df';

const VIS_CMP_UP = '#15803d';
const VIS_CMP_DOWN = '#b91c1c';
const VIS_CMP_FLAT = '#64748b';

function prevVisitorsMap(prevRows: BreakdownRow[], keyFn: (r: BreakdownRow) => string): Map<string, number> {
  return new Map(prevRows.map((r) => [keyFn(r), Number(r.visitors)]));
}

/** Prior-period visitors and % change vs current on one line (green/red/grey for %). */
function visitorCompareCell(current: number, prev?: number): string {
  const row = `display:flex;flex-direction:row;flex-wrap:nowrap;justify-content:flex-end;align-items:center;gap:6px;
    font-family:${FONT_BODY};text-align:right;`;
  const num = `font-size:12px;color:${TEXT_SEC};font-variant-numeric:tabular-nums;`;
  const pct = (color: string) => `font-size:10px;font-weight:600;color:${color};white-space:nowrap;`;
  if (prev === undefined) {
    return `<div style="${row}"><span style="${num}">—</span></div>`;
  }
  if (prev === 0 && current > 0) {
    return `<div style="${row}"><span style="${num}">0</span><span style="${pct(VIS_CMP_UP)}">New</span></div>`;
  }
  let pctLabel: string;
  let pctColor: string;
  if (prev === 0) {
    pctLabel = '0%';
    pctColor = VIS_CMP_FLAT;
  } else {
    const raw = ((current - prev) / prev) * 100;
    const rounded = Math.round(raw);
    if (rounded > 0) {
      pctLabel = `+${rounded}%`;
      pctColor = VIS_CMP_UP;
    } else if (rounded < 0) {
      pctLabel = `${rounded}%`;
      pctColor = VIS_CMP_DOWN;
    } else {
      pctLabel = '0%';
      pctColor = VIS_CMP_FLAT;
    }
  }
  return `<div style="${row}"><span style="${num}">${fmt(prev)}</span><span style="${pct(pctColor)}">${pctLabel}</span></div>`;
}

type PdfTableHeader = { label: string; right?: boolean };

type PdfTableOpts = {
  /** When length matches headers, sets table-layout:fixed + colgroup (fixes thead/body drift under html2canvas). */
  columnWidths?: readonly string[];
  /** Clip the table from the bottom if it would exceed the slide content area (header row stays visible). */
  maxHeightPx?: number;
  /**
   * First text column (non-right-aligned): one line + ellipsis. Caller should pass plain text (e.g. escHtml).
   * Pairs with `table-layout:fixed` + `columnWidths` so long URLs do not wrap to extra lines.
   */
  firstColumnSingleLine?: boolean;
};

/** First column widest; remaining columns equal (Devices, Browsers, OS, Entry/Exit pages). */
const TABLE_4COL_FIRST_WIDE_WIDTHS: readonly string[] = ['40%', '20%', '20%', '20%'];

/** All columns equal width (Goals table on UTM & Conversions slide). */
const TABLE_4COL_ALL_EQUAL_WIDTHS: readonly string[] = ['25%', '25%', '25%', '25%'];

/** First column widest; remaining four columns equal (Sources — shorter last headers). */
const TABLE_5COL_FIRST_WIDE_WIDTHS: readonly string[] = ['40%', '15%', '15%', '15%', '15%'];

/** Channels: wider last two cols so “Bounce Rate” / “Avg. Duration” stay on one line. */
const TABLE_5COL_CHANNELS_WIDTHS: readonly string[] = ['34%', '14%', '14%', '19%', '19%'];

/** All columns equal width (UTM mediums table). */
const TABLE_5COL_ALL_EQUAL_WIDTHS: readonly string[] = ['20%', '20%', '20%', '20%', '20%'];

/** Top pages: Page col a bit narrower; each metric col wider (~≈20px vs old 12% cols on slide width). */
const TABLE_6COL_TOP_PAGES_WIDTHS: readonly string[] = ['27.5%', '14.5%', '14.5%', '14.5%', '14.5%', '14.5%'];

/** Dark-themed table (PDF). Shared header chrome for every slide table. */
function table(headers: PdfTableHeader[], rows: string[][], opts?: PdfTableOpts): string {
  const headerBg = ACCENT_BLUE;
  const headerFg = '#ffffff';
  const thBase = `padding:11px 16px;font-family:${FONT_BODY};font-size:10px;font-weight:700;color:${headerFg};
    text-transform:uppercase;background:${headerBg};vertical-align:middle`;
  const tdBaseWithRule = `padding:11px 16px;font-family:${FONT_BODY};font-size:12px;color:${TEXT_SEC};
    border-bottom:1px solid ${TABLE_ROW_DIVIDER};vertical-align:middle`;
  const tdBaseLast = `padding:11px 16px;font-family:${FONT_BODY};font-size:12px;color:${TEXT_SEC};
    border-bottom:none;vertical-align:middle`;
  const TD = (last: boolean) => `${last ? tdBaseLast : tdBaseWithRule};text-align:left`;
  const TDR = (last: boolean) =>
    `${last ? tdBaseLast : tdBaseWithRule};text-align:right;font-variant-numeric:tabular-nums`;

  const n = headers.length;
  const ths = headers
    .map((h, i) => {
      const align = h.right ? 'right' : 'left';
      let corners = '';
      if (n === 1) {
        corners = `border-radius:${TABLE_HEADER_RADIUS_PX}px;`;
      } else {
        if (i === 0) {
          corners = `border-top-left-radius:${TABLE_HEADER_RADIUS_PX}px;border-bottom-left-radius:${TABLE_HEADER_RADIUS_PX}px;`;
        }
        if (i === n - 1) {
          corners += `border-top-right-radius:${TABLE_HEADER_RADIUS_PX}px;border-bottom-right-radius:${TABLE_HEADER_RADIUS_PX}px;`;
        }
      }
      return `<th style="${thBase};text-align:${align};${corners}">${h.label}</th>`;
    })
    .join('');

  const lastRi = rows.length - 1;
  const firstColOneLine = opts?.firstColumnSingleLine === true;
  const trs = rows
    .map(
      (row, ri) =>
        `<tr>${row
          .map((cell, i) => {
            const h = headers[i];
            let base = h?.right ? TDR(ri === lastRi) : TD(ri === lastRi);
            if (firstColOneLine && i === 0 && !h?.right) {
              base += `;overflow:hidden;white-space:nowrap;text-overflow:ellipsis`;
            }
            return `<td style="${base}">${cell}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  const widths = opts?.columnWidths;
  const useFixedLayout = widths !== undefined && widths.length === n;
  const colgroup = useFixedLayout
    ? `<colgroup>${widths.map((w) => `<col style="width:${w}" />`).join('')}</colgroup>`
    : '';
  const tableLayout = useFixedLayout ? 'table-layout:fixed;' : '';

  const tbl = `<table style="width:100%;border-collapse:collapse;border-spacing:0;${tableLayout}">
    ${colgroup}
    <thead><tr>${ths}</tr></thead>
    <tbody>${trs}</tbody>
  </table>`;

  const cap = opts?.maxHeightPx;
  if (cap !== undefined && cap > 0) {
    return `<div style="max-height:${cap}px;overflow:hidden">${tbl}</div>`;
  }
  return tbl;
}

/** Truncate long strings with ellipsis */
function trunc(str: string, max = 52): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** U+200A hair spaces before and after each `/` (doubled) so slashes don’t crowd adjacent glyphs in PDF capture. */
const PDF_URL_HAIR = '\u200A';
function loosenUrlSlashesForPdf(s: string): string {
  const h = `${PDF_URL_HAIR}${PDF_URL_HAIR}`;
  return s.replace(/\//g, `${h}/${h}`);
}

function pdfEntryExitPageCell(raw: string, maxChars: number): string {
  const t = loosenUrlSlashesForPdf(trunc(raw, maxChars));
  return `<span class="pdf-url-path">${escHtml(t)}</span>`;
}

const COVER_ORANGE = '#FF9900';
const COVER_FG = '#FFF9EA';

// ─── Slide 1: Front cover ─────────────────────────────────────────────────────

export function renderFrontCover(
  container: HTMLDivElement,
  siteId: string,
  _dateFrom: string,
  _dateTo: string
): void {
  const safeSite = escHtml(siteId);
  container.innerHTML = `
    <div style="width:${SLIDE_WIDTH_PX}px;height:${SLIDE_HEIGHT_PX}px;background:${COVER_ORANGE};display:flex;flex-direction:column;box-sizing:border-box;position:relative;">

      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 56px;">
        <img
          src="/report-logo.svg"
          alt=""
          style="height:80px;width:auto;max-width:510px;display:block;object-fit:contain;"
        />
        <div style="margin-top:16px;font-family:${FONT_BODY};font-size:18px;font-weight:500;color:${COVER_FG};text-align:center;line-height:1.2;max-width:640px;word-break:break-word;">
          ${safeSite}
        </div>
      </div>
    </div>
  `;
}

// ─── Slide 2: KPI overview ────────────────────────────────────────────────────

export function renderKPIs(
  container: HTMLDivElement,
  meta: SlideMeta,
  data: AggregateResult,
  prev?: AggregateResult
): void {
  const deltaText = (
    curr: number,
    prior: number,
    fmtValue: (n: number) => string,
    direction: 'higher_is_better' | 'lower_is_better' = 'higher_is_better'
  ): { text: string; color: string } => {
    const diff = curr - prior;
    const sign = diff > 0 ? '+' : diff < 0 ? '−' : '';
    const abs = Math.abs(diff);

    const pctChange =
      prior === 0 ? null : (diff / prior) * 100;

    const pctPart =
      pctChange === null || !isFinite(pctChange)
        ? '—'
        : `${pctChange > 0 ? '+' : ''}${Math.round(pctChange)}%`;

    const diffPart = `${sign}${fmtValue(abs)}`;
    const text = `${diff === 0 ? '0' : diffPart} (${pctPart})`;

    const rawPositive = diff > 0;
    const good =
      diff === 0 ? null : direction === 'higher_is_better' ? rawPositive : !rawPositive;

    const color = good === null ? MUTED : good ? '#166534' : '#991b1b'; // green/red/slate
    return { text, color };
  };

  const cards = [
    {
      label: 'Unique Visitors',
      value: fmt(data.visitors.value),
      sub: 'people reached',
      delta: prev ? deltaText(data.visitors.value, prev.visitors.value, (n) => n.toLocaleString('en-GB')) : null,
    },
    {
      label: 'Total Pageviews',
      value: fmt(data.pageviews.value),
      sub: 'pages loaded',
      delta: prev ? deltaText(data.pageviews.value, prev.pageviews.value, (n) => n.toLocaleString('en-GB')) : null,
    },
    {
      label: 'Visits / Sessions',
      value: fmt(data.visits.value),
      sub: 'sessions recorded',
      delta: prev ? deltaText(data.visits.value, prev.visits.value, (n) => n.toLocaleString('en-GB')) : null,
    },
    {
      label: 'Bounce Rate',
      value: pct(data.bounce_rate.value),
      sub: 'single-page sessions',
      delta: prev
        ? deltaText(
            data.bounce_rate.value,
            prev.bounce_rate.value,
            (n) => `${Math.round(n)}%`,
            'lower_is_better'
          )
        : null,
    },
    {
      label: 'Avg. Visit Duration',
      value: fmtDuration(data.visit_duration.value),
      sub: 'time on site',
      delta: prev
        ? deltaText(data.visit_duration.value, prev.visit_duration.value, (n) => `${Math.round(n)}s`)
        : null,
    },
  ];

  function card(
    c: {
      label: string;
      value: string;
      sub: string;
      delta: { text: string; color: string } | null;
    }
  ): string {
    return `
      <div style="background:${SURFACE};border:1px solid ${BORDER};
        border-radius:10px;padding:22px;box-sizing:border-box;">
        <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
          text-transform:uppercase;margin-bottom:12px;line-height:1.35;">${c.label}</div>

        <div style="display:flex;flex-direction:row;width:100%;justify-content:${c.delta ? 'space-between' : 'flex-start'};align-items:flex-end;gap:16px;">
          <div style="display:flex;align-items:flex-end;gap:14px;min-width:0;flex:1;">
            <div style="font-family:${FONT_BODY};font-size:34px;font-weight:700;color:${TEXT};
              line-height:1.18;flex-shrink:0;padding:2px 0;">${c.value}</div>
            <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${TEXT_SEC};line-height:1.35;white-space:nowrap;overflow:visible;padding-bottom:4px;">
              ${c.sub}
            </div>
          </div>
          ${
            c.delta
              ? `<div style="font-family:${FONT_BODY};font-size:10px;line-height:1.35;color:${MUTED};white-space:nowrap;font-variant-numeric:tabular-nums;flex-shrink:0;text-align:right;padding-bottom:5px;">
                  <span style="color:${MUTED};">vs previous:</span>
                  <span style="color:${c.delta.color};font-weight:600;"> ${c.delta.text}</span>
                </div>`
              : ''
          }
        </div>
      </div>
    `;
  }

  container.innerHTML = slideFrame(
    meta,
    'Overview',
    'Key performance metrics for the selected period',
    `
      <div style="display:flex;flex-direction:column;gap:14px;height:100%;box-sizing:border-box;">
        ${cards.map((c) => card(c)).join('')}
      </div>
    `
  );
}

// ─── Slide 3: Traffic over time ───────────────────────────────────────────────

export function renderTimeseries(
  container: HTMLDivElement,
  meta: SlideMeta,
  data: TimeseriesPoint[]
): void {
  container.innerHTML = slideFrame(
    meta,
    'Traffic Over Time',
    'Daily visitors and pageviews across the report period',
    `
      <div style="height:100%;position:relative;display:flex;align-items:center;justify-content:center;">
        <canvas data-pdf-chart="timeseries" width="${CONTENT_W_PX}" height="500" style="display:block;"></canvas>
      </div>
    `
  );

  const canvas = container.querySelector<HTMLCanvasElement>('[data-pdf-chart="timeseries"]')!;
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
        x: darkScaleX({
          grid: { color: BORDER },
          ticks: { color: MUTED, maxRotation: 0, maxTicksLimit: 12, font: { size: 10, family: FONT_BODY } },
          title: { display: true, text: 'Date', color: LABEL, font: { size: 10, family: FONT_BODY, weight: '600' } },
        }),
        y: darkScaleY({
          title: { display: true, text: 'Count', color: LABEL, font: { size: 10, family: FONT_BODY, weight: '600' } },
        }),
      },
    },
  });
  storeCharts(container, [chart]);
}

// ─── Slide 4: Top pages ───────────────────────────────────────────────────────

export function renderTopPages(
  container: HTMLDivElement,
  meta: SlideMeta,
  data: BreakdownRow[],
  dataPrev: BreakdownRow[]
): void {
  const keyFn = (r: BreakdownRow) => String(r.page ?? r['event:page'] ?? '');
  const prevMap = prevVisitorsMap(dataPrev, keyFn);
  const rows = data.slice(0, 14).map((r) => {
    const key = keyFn(r);
    const cur = Number(r.visitors);
    return [
      trunc(key, 48),
      fmt(cur),
      visitorCompareCell(cur, prevMap.get(key)),
      fmt(r.pageviews as number),
      pct(r.bounce_rate as number),
      fmtDuration(r.visit_duration as number),
    ];
  });

  container.innerHTML = slideFrame(
    meta,
    'Top Pages',
    'Most visited pages during the period',
    `
      ${table(
        [
          { label: 'Page' },
          { label: 'Visitors', right: true },
          { label: 'vs prior', right: true },
          { label: 'Pageviews', right: true },
          { label: 'Bounce Rate', right: true },
          { label: 'Avg. Time', right: true },
        ],
        rows,
        { columnWidths: TABLE_6COL_TOP_PAGES_WIDTHS }
      )}
    `
  );
}

// ─── Slide 5: Visitors by country ────────────────────────────────────────────

export function renderCountries(
  container: HTMLDivElement,
  meta: SlideMeta,
  data: BreakdownRow[]
): void {
  const top = data.slice(0, 14);
  container.innerHTML = slideFrame(
    meta,
    'Visitors by Country',
    'Top 14 countries by unique visitors',
    `
      <div style="height:100%;position:relative;">
        <canvas data-pdf-chart="country" width="${CONTENT_W_PX}" height="${CONTENT_H_PX}"
          style="display:block;width:${CONTENT_W_PX}px;height:${CONTENT_H_PX}px;"></canvas>
      </div>
    `
  );

  const canvas = container.querySelector<HTMLCanvasElement>('[data-pdf-chart="country"]')!;
  const countryLabelChars = 26;
  const countryLabelMaxLines = 4;
  const chart = createChart(canvas, {
    type: 'bar',
    data: {
      labels: top.map((r) => {
        const code = String(r.country ?? r['visit:country'] ?? '');
        const name = countryFullName(code);
        return wrapCategoryLines(name, countryLabelChars, countryLabelMaxLines);
      }),
      datasets: [
        {
          label: 'Visitors',
          data: top.map((r) => Number(r.visitors)),
          backgroundColor: `${ACCENT_BLUE}cc`,
          hoverBackgroundColor: ACCENT_BLUE,
          borderRadius: 8,
        },
      ],
    },
    options: {
      indexAxis: 'y',
      animation: false,
      responsive: false,
      devicePixelRatio: PDF_COUNTRY_CHART_DPR,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title(items) {
              const i = items[0]?.dataIndex ?? 0;
              const code = String(top[i]?.country ?? top[i]?.['visit:country'] ?? '');
              return countryFullName(code);
            },
          },
        },
      },
      scales: {
        x: darkScaleX({ beginAtZero: true }),
        y: darkScaleY({
          grid: { display: false },
          ticks: {
            color: TEXT_SEC,
            font: { size: 11, family: FONT_BODY, lineHeight: 1.25 },
          },
        }),
      },
    },
  });
  storeCharts(container, [chart]);
}

// ─── Slide 6: Traffic sources ─────────────────────────────────────────────────

export function renderSources(
  container: HTMLDivElement,
  meta: SlideMeta,
  data: BreakdownRow[],
  dataPrev: BreakdownRow[]
): void {
  const top = data.slice(0, 16);
  const keyFn = (r: BreakdownRow) => String(r.source ?? r['visit:source'] ?? '(direct)');
  const prevMap = prevVisitorsMap(dataPrev, keyFn);
  const rows = top.map((r) => {
    const key = keyFn(r);
    const cur = Number(r.visitors);
    return [
      trunc(key, 52),
      fmt(cur),
      visitorCompareCell(cur, prevMap.get(key)),
      pct(r.bounce_rate as number),
      fmtDuration(r.visit_duration as number),
    ];
  });

  container.innerHTML = slideFrame(
    meta,
    'Traffic Sources',
    'Top sources by unique visitors, bounce rate, and average time on site',
    `
      ${table(
        [
          { label: 'Source' },
          { label: 'Visitors', right: true },
          { label: 'vs prior', right: true },
          { label: 'Bounce', right: true },
          { label: 'Avg. Time', right: true },
        ],
        rows,
        { columnWidths: TABLE_5COL_FIRST_WIDE_WIDTHS }
      )}
    `
  );
}

// ─── Slide 7: Channels ────────────────────────────────────────────────────────

export function renderChannels(
  container: HTMLDivElement,
  meta: SlideMeta,
  data: BreakdownRow[],
  dataPrev: BreakdownRow[]
): void {
  const keyFn = (r: BreakdownRow) => String(r.channel ?? r['visit:channel'] ?? '');
  const prevMap = prevVisitorsMap(dataPrev, keyFn);
  const rows = data.slice(0, 12).map((r) => {
    const key = keyFn(r);
    const cur = Number(r.visitors);
    return [
      key,
      fmt(cur),
      visitorCompareCell(cur, prevMap.get(key)),
      pct(r.bounce_rate as number),
      fmtDuration(r.visit_duration as number),
    ];
  });

  container.innerHTML = slideFrame(
    meta,
    'Channels',
    'Traffic breakdown by acquisition channel',
    `
      ${table(
        [
          { label: 'Channel' },
          { label: 'Visitors', right: true },
          { label: 'vs prior', right: true },
          { label: 'Bounce Rate', right: true },
          { label: 'Avg. Duration', right: true },
        ],
        rows,
        { columnWidths: TABLE_5COL_CHANNELS_WIDTHS }
      )}
    `
  );
}

const emptyHalf = (body: string) => `
  <div style="margin-top:12px;padding:28px 20px;background:${SURFACE};border:1px solid ${BORDER};
    border-radius:10px;text-align:center;">
    <div style="font-family:${FONT_BODY};font-size:13px;color:${MUTED};line-height:1.55;">
      ${body}
    </div>
  </div>`;

// ─── Slide 8: Devices + Browsers ─────────────────────────────────────────────

export function renderDevicesAndBrowsers(
  container: HTMLDivElement,
  meta: SlideMeta,
  devices: BreakdownRow[],
  browsers: BreakdownRow[],
  devicesPrev: BreakdownRow[],
  browsersPrev: BreakdownRow[]
): void {
  const rowCap = 7;
  const devTop = devices.slice(0, rowCap);
  const devTotal = devTop.reduce((s, d) => s + Number(d.visitors), 0);
  const devKey = (r: BreakdownRow) => String(r.device ?? r['visit:device'] ?? '');
  const devPrevMap = prevVisitorsMap(devicesPrev, devKey);
  const deviceRows = devTop.map((d) => {
    const key = devKey(d);
    const cur = Number(d.visitors);
    return [
      key,
      fmt(cur),
      visitorCompareCell(cur, devPrevMap.get(key)),
      devTotal > 0 ? pct((cur / devTotal) * 100) : '—',
    ];
  });

  const browsersNonZero = browsers.filter((b) => Number(b.visitors) > 0);
  const browserTop = browsersNonZero.slice(0, rowCap);
  const browserTotal = browserTop.reduce((s, b) => s + Number(b.visitors), 0);
  const brKey = (r: BreakdownRow) => String(r.browser ?? r['visit:browser'] ?? '');
  const brPrevMap = prevVisitorsMap(browsersPrev, brKey);
  const browserRows = browserTop.map((b) => {
    const key = brKey(b);
    const cur = Number(b.visitors);
    return [
      key,
      fmt(cur),
      visitorCompareCell(cur, brPrevMap.get(key)),
      browserTotal > 0 ? pct((cur / browserTotal) * 100) : '—',
    ];
  });
  const browsersEmpty = browserRows.length === 0;

  container.innerHTML = slideFrame(
    meta,
    'Devices & Browsers',
    'How visitors are accessing the site',
    `
      <div style="display:flex;flex-direction:column;gap:28px;height:100%;">
        <div style="display:flex;flex-direction:column;width:100%;">
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;margin-bottom:16px;">Devices</div>
          ${table(
            [
              { label: 'Device' },
              { label: 'Visitors', right: true },
              { label: 'vs prior', right: true },
              { label: 'Share', right: true },
            ],
            deviceRows,
            { columnWidths: TABLE_4COL_FIRST_WIDE_WIDTHS }
          )}
        </div>

        <div style="display:flex;flex-direction:column;width:100%;">
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;margin-bottom:16px;">Browsers</div>
          ${
            browsersEmpty
              ? emptyHalf('No browsers with visitors in this period.')
              : table(
                  [
                    { label: 'Browser' },
                    { label: 'Visitors', right: true },
                    { label: 'vs prior', right: true },
                    { label: 'Share', right: true },
                  ],
                  browserRows,
                  { columnWidths: TABLE_4COL_FIRST_WIDE_WIDTHS }
                )
          }
        </div>
      </div>
    `
  );
}

// ─── Slide 9: Operating systems ───────────────────────────────────────────────

export function renderOS(
  container: HTMLDivElement,
  meta: SlideMeta,
  os: BreakdownRow[],
  osPrev: BreakdownRow[]
): void {
  const top = os.slice(0, 16);
  const total = top.reduce((sum, r) => sum + Number(r.visitors), 0);
  const keyFn = (r: BreakdownRow) => String(r.os ?? r['visit:os'] ?? '');
  const prevMap = prevVisitorsMap(osPrev, keyFn);
  const rows = top.map((r) => {
    const key = keyFn(r);
    const cur = Number(r.visitors);
    return [
      key,
      fmt(cur),
      visitorCompareCell(cur, prevMap.get(key)),
      total > 0 ? pct((cur / total) * 100) : '—',
    ];
  });

  container.innerHTML = slideFrame(
    meta,
    'Operating Systems',
    'Visitor share by OS platform',
    table(
      [
        { label: 'OS' },
        { label: 'Visitors', right: true },
        { label: 'vs prior', right: true },
        { label: 'Share', right: true },
      ],
      rows,
      { columnWidths: TABLE_4COL_FIRST_WIDE_WIDTHS }
    )
  );
}

// ─── Slide 10: UTM mediums + goal conversions (combined) ───────────────────────

export function renderUtmAndConversions(
  container: HTMLDivElement,
  meta: SlideMeta,
  utmMediums: BreakdownRow[],
  conversions: BreakdownRow[],
  utmMediumsPrev: BreakdownRow[],
  conversionsPrev: BreakdownRow[]
): void {
  const utmKey = (r: BreakdownRow) => String(r.utm_medium ?? r['visit:utm_medium'] ?? '(none)');
  const utmPrevMap = prevVisitorsMap(utmMediumsPrev, utmKey);
  const utmRows = utmMediums.slice(0, 7).map((r) => {
    const key = utmKey(r);
    const cur = Number(r.visitors);
    return [
      trunc(key, 28),
      fmt(cur),
      visitorCompareCell(cur, utmPrevMap.get(key)),
      pct(r.bounce_rate as number),
      fmtDuration(r.visit_duration as number),
    ];
  });
  const goalKey = (r: BreakdownRow) => String(r.goal ?? r['event:goal'] ?? '');
  const convPrevMap = prevVisitorsMap(conversionsPrev, goalKey);
  const convRows = conversions.slice(0, 7).map((r) => {
    const key = goalKey(r);
    const cur = Number(r.visitors);
    return [
      trunc(key, 28),
      fmt(cur),
      visitorCompareCell(cur, convPrevMap.get(key)),
      fmt(r.events as number),
    ];
  });
  const utmEmpty = utmRows.length === 0;
  const convEmpty = convRows.length === 0;

  container.innerHTML = slideFrame(
    meta,
    'UTM & Conversions',
    'UTM medium traffic and Plausible goal completions',
    `
      <div style="display:flex;flex-direction:column;gap:28px;">
        <div>
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;margin-bottom:14px;">UTM mediums</div>
          ${
            utmEmpty
              ? emptyHalf('No UTM campaign data for this period.')
              : table(
                  [
                    { label: 'Medium' },
                    { label: 'Visitors', right: true },
                    { label: 'vs prior', right: true },
                    { label: 'Bounce', right: true },
                    { label: 'Avg. Time', right: true },
                  ],
                  utmRows,
                  { columnWidths: TABLE_5COL_ALL_EQUAL_WIDTHS }
                )
          }
        </div>
        <div>
          <div style="font-family:${FONT_BODY};font-size:11px;font-weight:700;color:${LABEL};
            text-transform:uppercase;margin-bottom:14px;">Goals</div>
          ${
            convEmpty
              ? emptyHalf(
                  'No goal conversions for this period. Set up goals in Plausible to track them here.'
                )
              : table(
                  [
                    { label: 'Goal' },
                    { label: 'Unique', right: true },
                    { label: 'vs prior', right: true },
                    { label: 'Total', right: true },
                  ],
                  convRows,
                  { columnWidths: TABLE_4COL_ALL_EQUAL_WIDTHS }
                )
          }
        </div>
      </div>
    `
  );
}

// ─── Slide 11–12: Entry pages, then exit pages (separate slides) ───────────────

/** Cap DOM size; visual truncation is CSS ellipsis on the first column. */
const ENTRY_EXIT_PAGE_MAX_CHARS = 400;

/**
 * Vertical budget for the table inside the right panel after the slide title block.
 * Overflow is hidden so extra rows are clipped from the bottom instead of spilling off the slide.
 */
const ENTRY_EXIT_TABLE_MAX_H = CONTENT_H_PX - 132;

export function renderEntryPages(
  container: HTMLDivElement,
  meta: SlideMeta,
  entryPages: BreakdownRow[],
  entryPagesPrev: BreakdownRow[]
): void {
  const keyFn = (r: BreakdownRow) => String(r.entry_page ?? r['visit:entry_page'] ?? '');
  const prevMap = prevVisitorsMap(entryPagesPrev, keyFn);
  const entryRows = entryPages.slice(0, 18).map((r) => {
    const key = keyFn(r);
    const cur = Number(r.visitors);
    return [
      pdfEntryExitPageCell(key, ENTRY_EXIT_PAGE_MAX_CHARS),
      fmt(cur),
      visitorCompareCell(cur, prevMap.get(key)),
      pct(r.bounce_rate as number),
    ];
  });

  container.innerHTML = slideFrame(
    meta,
    'Entry Pages',
    'Where visitors land first',
    table(
      [
        { label: 'Page' },
        { label: 'Visitors', right: true },
        { label: 'vs prior', right: true },
        { label: 'Bounce', right: true },
      ],
      entryRows,
      {
        columnWidths: TABLE_4COL_FIRST_WIDE_WIDTHS,
        maxHeightPx: ENTRY_EXIT_TABLE_MAX_H,
        firstColumnSingleLine: true,
      }
    )
  );
}

export function renderExitPages(
  container: HTMLDivElement,
  meta: SlideMeta,
  exitPages: BreakdownRow[],
  exitPagesPrev: BreakdownRow[]
): void {
  const keyFn = (r: BreakdownRow) => String(r.exit_page ?? r['visit:exit_page'] ?? '');
  const prevMap = prevVisitorsMap(exitPagesPrev, keyFn);
  const exitRows = exitPages.slice(0, 18).map((r) => {
    const key = keyFn(r);
    const cur = Number(r.visitors);
    return [
      pdfEntryExitPageCell(key, ENTRY_EXIT_PAGE_MAX_CHARS),
      fmt(cur),
      visitorCompareCell(cur, prevMap.get(key)),
      fmtDuration(r.visit_duration as number),
    ];
  });

  container.innerHTML = slideFrame(
    meta,
    'Exit Pages',
    'Where visitors leave from',
    table(
      [
        { label: 'Page' },
        { label: 'Visitors', right: true },
        { label: 'vs prior', right: true },
        { label: 'Avg. Time', right: true },
      ],
      exitRows,
      {
        columnWidths: TABLE_4COL_FIRST_WIDE_WIDTHS,
        maxHeightPx: ENTRY_EXIT_TABLE_MAX_H,
        firstColumnSingleLine: true,
      }
    )
  );
}

// ─── Slide 12: Back cover ─────────────────────────────────────────────────────

export function renderBackCover(
  container: HTMLDivElement,
  _siteId: string,
  _dateFrom: string,
  _dateTo: string
): void {
  container.innerHTML = `
    <div style="width:${SLIDE_WIDTH_PX}px;height:${SLIDE_HEIGHT_PX}px;background:${COVER_ORANGE};
      display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
      <img src="/full-logo.svg" alt="" width="158" height="200"
        style="height:200px;width:auto;display:block;object-fit:contain;" />
    </div>
  `;
}
