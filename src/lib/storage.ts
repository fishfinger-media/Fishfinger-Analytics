import { kv } from '@vercel/kv';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type SlackInstallation = {
  teamId: string;
  accessToken: string;
  installedAt: string;
  scopes?: string;
};

export type SiteTarget = {
  channelId: string;
  enabled: boolean;
  /**
   * “Schedule” is stored as simple fields so we can validate easily on both client + server.
   * Actual execution can be driven by an external scheduler (e.g. Vercel Cron) calling our run endpoint.
   */
  schedule?: {
    /** IANA timezone, e.g. "Europe/London" */
    timeZone: string;
    /** Day of month 1–28 (we cap at 28 to avoid short-month edge cases). */
    dayOfMonth: number;
    /** 0–23 */
    hour: number;
    /** 0–59 */
    minute: number;
  };
};

type SiteTargets = Record<string, SiteTarget>;

type StorageShape = {
  slackInstallation: SlackInstallation | null;
  siteTargets: SiteTargets;
  sent: Record<string, true>;
  sentSlackMessages?: Record<string, { channelId: string; ts: string; storedAt: string }>;
};

const DEFAULT_DEV_STORAGE_FILE = path.join(process.cwd(), '.dev-storage.json');

function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function readDevFile(): Promise<StorageShape> {
  const file = process.env.DEV_STORAGE_PATH || DEFAULT_DEV_STORAGE_FILE;
  try {
    const raw = await fs.readFile(file, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StorageShape>;
    return {
      slackInstallation: parsed.slackInstallation ?? null,
      siteTargets: parsed.siteTargets ?? {},
      sent: parsed.sent ?? {},
      sentSlackMessages: parsed.sentSlackMessages ?? {},
    };
  } catch {
    return { slackInstallation: null, siteTargets: {}, sent: {}, sentSlackMessages: {} };
  }
}

async function writeDevFile(next: StorageShape): Promise<void> {
  const file = process.env.DEV_STORAGE_PATH || DEFAULT_DEV_STORAGE_FILE;
  await fs.writeFile(file, JSON.stringify(next, null, 2), 'utf8');
}

export async function getSlackInstallation(): Promise<SlackInstallation | null> {
  if (isKvConfigured()) return (await kv.get<SlackInstallation>('slack:installation')) ?? null;
  const dev = await readDevFile();
  return dev.slackInstallation;
}

export async function setSlackInstallation(installation: SlackInstallation): Promise<void> {
  if (isKvConfigured()) {
    await kv.set('slack:installation', installation);
    return;
  }
  const dev = await readDevFile();
  dev.slackInstallation = installation;
  await writeDevFile(dev);
}

export async function getSiteTargets(): Promise<SiteTargets> {
  if (isKvConfigured()) return (await kv.get<SiteTargets>('siteTargets')) ?? {};
  const dev = await readDevFile();
  return dev.siteTargets;
}

export async function setSiteTarget(siteId: string, target: SiteTarget): Promise<void> {
  if (isKvConfigured()) {
    const cur = (await kv.get<SiteTargets>('siteTargets')) ?? {};
    cur[siteId] = target;
    await kv.set('siteTargets', cur);
    return;
  }
  const dev = await readDevFile();
  dev.siteTargets[siteId] = target;
  await writeDevFile(dev);
}

function sentKey(siteId: string, yyyyMm: string): string {
  return `sent:${siteId}:${yyyyMm}`;
}

function sentSlackMessageKey(siteId: string, yyyyMm: string): string {
  return `sentSlackMessage:${siteId}:${yyyyMm}`;
}

export async function wasSent(siteId: string, yyyyMm: string): Promise<boolean> {
  const key = sentKey(siteId, yyyyMm);
  if (isKvConfigured()) return Boolean(await kv.get(key));
  const dev = await readDevFile();
  return dev.sent[key] === true;
}

export async function markSent(siteId: string, yyyyMm: string): Promise<void> {
  const key = sentKey(siteId, yyyyMm);
  if (isKvConfigured()) {
    await kv.set(key, true);
    return;
  }
  const dev = await readDevFile();
  dev.sent[key] = true;
  await writeDevFile(dev);
}

export async function getSentSlackMessage(
  siteId: string,
  yyyyMm: string
): Promise<{ channelId: string; ts: string; storedAt: string } | null> {
  const key = sentSlackMessageKey(siteId, yyyyMm);
  if (isKvConfigured())
    return (await kv.get<{ channelId: string; ts: string; storedAt: string }>(key)) ?? null;
  const dev = await readDevFile();
  return dev.sentSlackMessages?.[key] ?? null;
}

export async function setSentSlackMessage(params: {
  siteId: string;
  yyyyMm: string;
  channelId: string;
  ts: string;
}): Promise<void> {
  const key = sentSlackMessageKey(params.siteId, params.yyyyMm);
  const value = { channelId: params.channelId, ts: params.ts, storedAt: new Date().toISOString() };
  if (isKvConfigured()) {
    await kv.set(key, value);
    return;
  }
  const dev = await readDevFile();
  dev.sentSlackMessages = dev.sentSlackMessages ?? {};
  dev.sentSlackMessages[key] = value;
  await writeDevFile(dev);
}

