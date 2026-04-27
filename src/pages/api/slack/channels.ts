import type { APIRoute } from 'astro';
import { getSlackInstallation } from '../../../lib/storage';
import { listSlackChannels } from '../../../lib/slack';

export const GET: APIRoute = async () => {
  const installation = await getSlackInstallation();
  if (!installation) {
    return new Response(JSON.stringify({ error: 'Slack is not connected.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const channels = await listSlackChannels(installation.accessToken);
    return new Response(JSON.stringify({ channels }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to list Slack channels', detail: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

