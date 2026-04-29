import type { APIRoute } from 'astro';
import { getSiteTargets, getSlackInstallation, setSiteTarget } from '../../../lib/storage';
import { uploadPdfToSlack } from '../../../lib/slack';
import { renderReportPdfWithPlaywright } from '../../../lib/pdf/playwright-pdf';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function defaultRangeUtc(now = new Date()): { dateFrom: string; dateTo: string; label: string } {
  // Default: last day of previous month → today (UTC).
  //
  // This avoids confusing ranges like “Mar 2026 – Mar 2026” when using rolling windows,
  // since the PDF header displays month-year granularity.
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11 for *current* month
  const start = new Date(Date.UTC(y, m, 0)); // day 0 => last day of previous month
  const dateFrom = start.toISOString().slice(0, 10);
  const dateTo = now.toISOString().slice(0, 10);
  const label = `${dateFrom}_${dateTo}`;
  return { dateFrom, dateTo, label };
}

export const POST: APIRoute = async ({ request, url }) => {
  const installation = await getSlackInstallation();
  if (!installation) return json({ error: 'Slack is not connected.' }, 400);

  // Same baseUrl logic as the test endpoint.
  const baseUrl =
    url.hostname.endsWith('ngrok-free.app')
      ? `http://127.0.0.1:${process.env.PORT ?? '4321'}`
      : `${url.protocol}//${url.host}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { siteId, dateFrom, dateTo } = (body ?? {}) as Partial<{
    siteId: string;
    dateFrom: string;
    dateTo: string;
  }>;

  const targets = await getSiteTargets();
  const now = new Date();
  const entries = Object.entries(targets).filter(([, t]) => t.enabled && t.channelId);
  const filtered = siteId
    ? entries.filter(([id]) => id === siteId)
    : entries.filter(([, t]) => {
        const runAt = t.schedule?.runAt;
        if (!runAt) return false;
        const when = new Date(runAt);
        return !Number.isNaN(when.getTime()) && when.getTime() <= now.getTime();
      });
  if (filtered.length === 0) return json({ error: 'No enabled automation targets found.' }, 400);

  const range = dateFrom && dateTo ? { dateFrom, dateTo, label: `${dateFrom}_${dateTo}` } : defaultRangeUtc();

  const results: Array<{ siteId: string; channelId: string; ok: boolean; detail?: string }> = [];

  for (const [id, t] of filtered) {
    try {
      const pdf = await renderReportPdfWithPlaywright({
        baseUrl,
        siteId: id,
        dateFrom: range.dateFrom,
        dateTo: range.dateTo,
      });
      const filename = `${id.replace(/[^a-z0-9]/gi, '_')}_${range.label}.pdf`;
      await uploadPdfToSlack({
        accessToken: installation.accessToken,
        channelId: t.channelId,
        filename,
        title: `Monthly Report — ${id}`,
        initialComment: `Website Analytics report for ${id} (${range.dateFrom} → ${range.dateTo})`,
        pdf,
      });

      // Roll schedule forward ~1 month so it won't re-send immediately.
      if (!siteId && t.schedule?.runAt) {
        const prev = new Date(t.schedule.runAt);
        if (!Number.isNaN(prev.getTime())) {
          const next = new Date(prev);
          next.setUTCMonth(next.getUTCMonth() + 1);
          await setSiteTarget(id, { ...t, schedule: { timeZone: t.schedule.timeZone, runAt: next.toISOString() } });
        }
      }

      results.push({ siteId: id, channelId: t.channelId, ok: true });
    } catch (err) {
      results.push({ siteId: id, channelId: t.channelId, ok: false, detail: String(err) });
    }
  }

  const ok = results.every((r) => r.ok);
  return json({ ok, range, results }, ok ? 200 : 207);
};

