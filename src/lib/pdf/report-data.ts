import * as Plausible from '../plausible';
import type { AggregateResult, TimeseriesPoint, BreakdownRow } from '../plausible';

export type ReportSlideData = {
  aggregate: AggregateResult;
  aggregatePrev: AggregateResult;
  timeseries: TimeseriesPoint[];
  pages: BreakdownRow[];
  /** Same breakdown as `pages` for the immediately preceding period (equal length). */
  pagesPrev: BreakdownRow[];
  countries: BreakdownRow[];
  sources: BreakdownRow[];
  sourcesPrev: BreakdownRow[];
  channels: BreakdownRow[];
  channelsPrev: BreakdownRow[];
  devices: BreakdownRow[];
  devicesPrev: BreakdownRow[];
  browsers: BreakdownRow[];
  browsersPrev: BreakdownRow[];
  entryPages: BreakdownRow[];
  entryPagesPrev: BreakdownRow[];
  exitPages: BreakdownRow[];
  exitPagesPrev: BreakdownRow[];
  conversions: BreakdownRow[];
  conversionsPrev: BreakdownRow[];
  os: BreakdownRow[];
  osPrev: BreakdownRow[];
  utmMediums: BreakdownRow[];
  utmMediumsPrev: BreakdownRow[];
};

function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function toYmd(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dt: Date, days: number): Date {
  const copy = new Date(dt);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Custom range string plus the immediately preceding period of equal length. */
export function computeCustomRanges(dateFrom: string, dateTo: string): {
  dateRange: string;
  prevDateRange: string;
} {
  const fromDate = parseYmd(dateFrom);
  const toDate = parseYmd(dateTo);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  const MS_DAY = 24 * 60 * 60 * 1000;
  const spanDays = Math.max(1, Math.round((toDate.getTime() - fromDate.getTime()) / MS_DAY) + 1);

  const prevTo = addDays(fromDate, -1);
  const prevFrom = addDays(prevTo, -(spanDays - 1));

  return {
    dateRange: `${dateFrom},${dateTo}`,
    prevDateRange: `${toYmd(prevFrom)},${toYmd(prevTo)}`,
  };
}

export async function fetchReportSlideData(
  siteId: string,
  dateFrom: string,
  dateTo: string
): Promise<ReportSlideData> {
  const { dateRange, prevDateRange } = computeCustomRanges(dateFrom, dateTo);

  const [
    aggregate,
    aggregatePrev,
    timeseries,
    pages,
    pagesPrev,
    countries,
    sources,
    sourcesPrev,
    channels,
    channelsPrev,
    devices,
    devicesPrev,
    browsers,
    browsersPrev,
    entryPages,
    entryPagesPrev,
    exitPages,
    exitPagesPrev,
    conversions,
    conversionsPrev,
    os,
    osPrev,
    utmMediums,
    utmMediumsPrev,
  ] = await Promise.all([
    Plausible.fetchAggregate(siteId, dateRange),
    Plausible.fetchAggregate(siteId, prevDateRange),
    Plausible.fetchTimeseries(siteId, dateRange),
    Plausible.fetchBreakdown(siteId, dateRange, 'event:page', 'visitors,pageviews,bounce_rate,visit_duration', '20'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'event:page', 'visitors,pageviews,bounce_rate,visit_duration', '20'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:country', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:source', 'visitors,bounce_rate,visit_duration', '20'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:source', 'visitors,bounce_rate,visit_duration', '20'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:channel', 'visitors,bounce_rate,visit_duration', '10'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:channel', 'visitors,bounce_rate,visit_duration', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:device', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:device', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:browser', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:browser', 'visitors', '10'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:entry_page', 'visitors,visits,bounce_rate', '25'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:entry_page', 'visitors,visits,bounce_rate', '25'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:exit_page', 'visitors,visit_duration,visits', '25'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:exit_page', 'visitors,visit_duration,visits', '25'),
    Plausible.fetchBreakdown(siteId, dateRange, 'event:goal', 'visitors,events', '20'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'event:goal', 'visitors,events', '20'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:os', 'visitors', '20'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:os', 'visitors', '20'),
    Plausible.fetchBreakdown(siteId, dateRange, 'visit:utm_medium', 'visitors,bounce_rate,visit_duration', '20'),
    Plausible.fetchBreakdown(siteId, prevDateRange, 'visit:utm_medium', 'visitors,bounce_rate,visit_duration', '20'),
  ]);

  return {
    aggregate,
    aggregatePrev,
    timeseries,
    pages,
    pagesPrev,
    countries,
    sources,
    sourcesPrev,
    channels,
    channelsPrev,
    devices,
    devicesPrev,
    browsers,
    browsersPrev,
    entryPages,
    entryPagesPrev,
    exitPages,
    exitPagesPrev,
    conversions,
    conversionsPrev,
    os,
    osPrev,
    utmMediums,
    utmMediumsPrev,
  };
}
