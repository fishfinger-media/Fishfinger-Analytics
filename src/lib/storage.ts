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
};

type SiteTargets = Record<string, SiteTarget>;

type StorageShape = {
  slackInstallation: SlackInstallation | null;
  siteTargets: SiteTargets;
  sent: Record<string, true>;
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
    };
  } catch {
    return { slackInstallation: null, siteTargets: {}, sent: {} };
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

