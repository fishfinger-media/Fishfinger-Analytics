import type { APIRoute } from 'astro';
import { getSiteTargets, setSiteTarget, type SiteTarget } from '../../../lib/storage';

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
    const day = Number(raw.schedule.dayOfMonth);
    const hour = Number(raw.schedule.hour);
    const minute = Number(raw.schedule.minute);

    if (tz && isValidTimeZone(tz) && day >= 1 && day <= 28 && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      schedule = { timeZone: tz, dayOfMonth: day, hour, minute };
    }
  }

  return { enabled, channelId, schedule };
}

export const GET: APIRoute = async () => {
  const targets = await getSiteTargets();
  return json({ targets });
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

