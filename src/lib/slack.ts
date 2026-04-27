import { WebClient } from '@slack/web-api';

export type SlackChannel = { id: string; name: string };

export function slackClient(accessToken: string): WebClient {
  return new WebClient(accessToken);
}

export function slackPermalinkToTs(permalink: string): { channelId: string; ts: string } {
  // Example:
  // https://fishfingerhq.slack.com/archives/C0B0YD5LTDW/p1777301551385189
  const url = new URL(permalink);
  const parts = url.pathname.split('/').filter(Boolean);
  const archivesIdx = parts.indexOf('archives');
  const channelId = archivesIdx >= 0 ? parts[archivesIdx + 1] : undefined;
  const p = parts[archivesIdx >= 0 ? archivesIdx + 2 : -1] ?? '';
  if (!channelId || !p.startsWith('p')) throw new Error('Invalid Slack permalink (expected /archives/<channelId>/p...)');

  const digits = p.slice(1);
  if (!/^\d{10,}$/.test(digits)) throw new Error('Invalid Slack permalink message id');
  const seconds = digits.slice(0, 10);
  const micros = digits.slice(10).padStart(6, '0').slice(0, 6);
  return { channelId, ts: `${seconds}.${micros}` };
}

export async function listSlackChannels(accessToken: string): Promise<SlackChannel[]> {
  const client = slackClient(accessToken);
  const channels: SlackChannel[] = [];

  let cursor: string | undefined;
  for (let page = 0; page < 20; page++) {
    const res = await client.conversations.list({
      limit: 1000,
      cursor,
      types: 'public_channel',
      exclude_archived: true,
    });

    for (const c of res.channels ?? []) {
      if (!c?.id || !c?.name) continue;
      channels.push({ id: c.id, name: c.name });
    }

    cursor = res.response_metadata?.next_cursor || undefined;
    if (!cursor) break;
  }

  channels.sort((a, b) => a.name.localeCompare(b.name));
  return channels;
}

export async function uploadPdfToSlack(params: {
  accessToken: string;
  channelId: string;
  filename: string;
  title: string;
  initialComment?: string;
  pdf: Buffer;
}): Promise<void> {
  const client = slackClient(params.accessToken);

  // Slack API expects an actual file upload; `files.uploadV2` supports Buffer.
  const res = await client.files.uploadV2({
    channel_id: params.channelId,
    initial_comment: params.initialComment,
    file: params.pdf,
    filename: params.filename,
    title: params.title,
  });

  if (!res.ok) throw new Error(`Slack upload failed: ${'error' in res ? res.error : 'unknown_error'}`);
}

export async function postSlackMessage(params: {
  accessToken: string;
  channelId: string;
  text: string;
}): Promise<{ channel: string; ts: string }> {
  const client = slackClient(params.accessToken);
  const res = await client.chat.postMessage({
    channel: params.channelId,
    text: params.text,
  });
  if (!res.ok) throw new Error(`Slack message failed: ${'error' in res ? res.error : 'unknown_error'}`);
  if (!res.channel || !res.ts) throw new Error('Slack message succeeded but did not return channel/ts');
  return { channel: res.channel, ts: res.ts };
}

export async function deleteSlackMessage(params: {
  accessToken: string;
  channelId: string;
  ts: string;
}): Promise<void> {
  const client = slackClient(params.accessToken);
  const res = await client.chat.delete({ channel: params.channelId, ts: params.ts });
  if (!res.ok) throw new Error(`Slack delete failed: ${'error' in res ? res.error : 'unknown_error'}`);
}

