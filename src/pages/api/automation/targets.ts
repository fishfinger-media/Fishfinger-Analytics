import type { APIRoute } from 'astro';
import { deleteSiteTarget, getSiteTargets, setSiteTarget, type SiteTarget } from '../../../lib/storage';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function isValidTimeZone(tz: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new Intl.DateTimeFormat('en-GB', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function normalizeTarget(raw: Partial<SiteTarget>): SiteTarget {
  const enabled = Boolean(raw.enabled);
  const channelId = typeof raw.channelId === 'string' ? raw.channelId.trim() : '';

  let schedule: SiteTarget['schedule'] | undefined;
  if (raw.schedule && typeof raw.schedule === 'object') {
    const tz = typeof raw.schedule.timeZone === 'string' ? raw.schedule.timeZone.trim() : '';
    const runAt = typeof (raw.schedule as { runAt?: unknown }).runAt === 'string' ? (raw.schedule as { runAt?: string }).runAt!.trim() : '';
    const parsed = runAt ? new Date(runAt) : null;

    if (tz && isValidTimeZone(tz) && runAt && parsed && !Number.isNaN(parsed.getTime())) {
      schedule = { timeZone: tz, runAt };
    } else {
      // Back-compat: previously we stored dayOfMonth/hour/minute. Convert it into a concrete next-run ISO timestamp.
      const legacy = raw.schedule as Partial<{ dayOfMonth: unknown; hour: unknown; minute: unknown }>;
      const dayOfMonth = Number(legacy.dayOfMonth);
      const hour = Number(legacy.hour);
      const minute = Number(legacy.minute);
      if (tz && isValidTimeZone(tz) && dayOfMonth >= 1 && dayOfMonth <= 28 && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        const now = new Date();
        const y = now.getUTCFullYear();
        const m = now.getUTCMonth();
        let candidateMs = Date.UTC(y, m, dayOfMonth, hour, minute, 0, 0);
        if (candidateMs <= now.getTime()) candidateMs = Date.UTC(y, m + 1, dayOfMonth, hour, minute, 0, 0);
        schedule = { timeZone: tz, runAt: new Date(candidateMs).toISOString() };
      }
    }
  }

  return { enabled, channelId, schedule };
}

export const GET: APIRoute = async () => {
  const targets = await getSiteTargets();
  // Normalize for backward compatibility (older schedule shape).
  const normalized: Record<string, SiteTarget> = {};
  for (const [siteId, t] of Object.entries(targets)) {
    normalized[siteId] = normalizeTarget(t);
  }
  return json({ targets: normalized });
};

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { siteId, target } = (body ?? {}) as { siteId?: unknown; target?: unknown };
  if (typeof siteId !== 'string' || !siteId.trim()) return json({ error: 'Required: siteId' }, 400);
  if (!target || typeof target !== 'object') return json({ error: 'Required: target' }, 400);

  const normalized = normalizeTarget(target as Partial<SiteTarget>);
  if (normalized.enabled && !normalized.channelId) {
    return json({ error: 'When enabled=true, channelId is required.' }, 400);
  }

  await setSiteTarget(siteId.trim(), normalized);
  return json({ ok: true, siteId: siteId.trim(), target: normalized });
};

export const DELETE: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const { siteId } = (body ?? {}) as { siteId?: unknown };
  if (typeof siteId !== 'string' || !siteId.trim()) return json({ error: 'Required: siteId' }, 400);

  await deleteSiteTarget(siteId.trim());
  return json({ ok: true, siteId: siteId.trim() });
};

