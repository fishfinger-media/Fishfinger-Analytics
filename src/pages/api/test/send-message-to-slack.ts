import type { APIRoute } from 'astro';
import { getSlackInstallation, setSentSlackMessage } from '../../../lib/storage';
import { postSlackMessage } from '../../../lib/slack';

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

  const { channelId, text, siteId, yyyyMm } = (body ?? {}) as Record<string, string>;
  if (!channelId || !text) {
    return new Response(JSON.stringify({ error: 'Required: channelId, text' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const res = await postSlackMessage({ accessToken: installation.accessToken, channelId, text });
    if (siteId && yyyyMm) {
      await setSentSlackMessage({ siteId, yyyyMm, channelId: res.channel, ts: res.ts });
    }
    return new Response(JSON.stringify({ ok: true, channel: res.channel, ts: res.ts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to send Slack message', detail: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

