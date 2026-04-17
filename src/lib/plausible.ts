// Typed client for the Plausible Analytics API.
// Runs client-side — calls our /api/plausible SSR proxy which holds the API key.

export interface AggregateResult {
  visitors: { value: number };
  pageviews: { value: number };
  visits: { value: number };
  bounce_rate: { value: number };
  visit_duration: { value: number };
}

export interface TimeseriesPoint {
  date: string;
  visitors: number;
  pageviews: number;
}

export type BreakdownRow = Record<string, string | number>;

// ─── Internal helpers ───────────────────────────────────────────────────────

async function fetchPlausible<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`/api/plausible?${searchParams.toString()}`);

  if (!res.ok) {
    let message = `Plausible API error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const json = await res.json();
  // Plausible wraps arrays in { results: [...] } and aggregate in { results: {...} }
  return (json.results ?? json) as T;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function fetchAggregate(
  siteId: string,
  dateRange: string
): Promise<AggregateResult> {
  return fetchPlausible<AggregateResult>('aggregate', {
    site_id: siteId,
    period: 'custom',
    date: dateRange,
    metrics: 'visitors,pageviews,visits,bounce_rate,visit_duration',
  });
}

export function fetchTimeseries(
  siteId: string,
  dateRange: string
): Promise<TimeseriesPoint[]> {
  return fetchPlausible<TimeseriesPoint[]>('timeseries', {
    site_id: siteId,
    period: 'custom',
    date: dateRange,
    metrics: 'visitors,pageviews',
  });
}

export function fetchBreakdown(
  siteId: string,
  dateRange: string,
  property: string,
  metrics: string,
  limit = '10'
): Promise<BreakdownRow[]> {
  return fetchPlausible<BreakdownRow[]>('breakdown', {
    site_id: siteId,
    period: 'custom',
    date: dateRange,
    property,
    metrics,
    limit,
  });
}
