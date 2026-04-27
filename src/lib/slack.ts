import { WebClient } from '@slack/web-api';

export type SlackChannel = { id: string; name: string };

export function slackClient(accessToken: string): WebClient {
  return new WebClient(accessToken);
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
}): Promise<void> {
  const client = slackClient(params.accessToken);
  const res = await client.chat.postMessage({
    channel: params.channelId,
    text: params.text,
  });
  if (!res.ok) throw new Error(`Slack message failed: ${'error' in res ? res.error : 'unknown_error'}`);
}

