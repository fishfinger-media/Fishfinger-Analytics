import type { APIRoute } from 'astro';
import { getSentSlackMessage, getSlackInstallation } from '../../../lib/storage';
import { deleteSlackMessage, slackPermalinkToTs } from '../../../lib/slack';

export const POST: APIRoute = async ({ request }) => {
  const installation = await getSlackInstallation();
  if (!installation) {
    return new Response(JSON.stringify({ error: 'Slack is not connected.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const {
    channelId: rawChannelId,
    ts: rawTs,
    permalink,
    siteId,
    yyyyMm,
  } = (body ?? {}) as Record<string, string | undefined>;

  let channelId = rawChannelId;
  let ts = rawTs;

  if ((!channelId || !ts) && permalink) {
    const parsed = slackPermalinkToTs(permalink);
    channelId = parsed.channelId;
    ts = parsed.ts;
  }

  if ((!channelId || !ts) && siteId && yyyyMm) {
    const stored = await getSentSlackMessage(siteId, yyyyMm);
    if (stored) {
      channelId = stored.channelId;
      ts = stored.ts;
    }
  }

  if (!channelId || !ts) {
    return new Response(
      JSON.stringify({
        error: 'Missing identifiers.',
        required: 'Provide (channelId + ts) OR permalink OR (siteId + yyyyMm with stored message).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await deleteSlackMessage({ accessToken: installation.accessToken, channelId, ts });
    return new Response(JSON.stringify({ ok: true, channelId, ts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to delete Slack message', detail: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

