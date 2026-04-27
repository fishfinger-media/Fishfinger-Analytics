import type { APIRoute } from 'astro';
import { WebClient } from '@slack/web-api';
import { setSlackInstallation } from '../../../../lib/storage';

function decodeState(state: string | null): { returnTo?: string } {
  if (!state) return {};
  try {
    const json = Buffer.from(state, 'base64url').toString('utf8');
    return JSON.parse(json) as { returnTo?: string };
  } catch {
    return {};
  }
}

export const GET: APIRoute = async ({ url }) => {
  const clientId = import.meta.env.SLACK_CLIENT_ID;
  const clientSecret = import.meta.env.SLACK_CLIENT_SECRET;
  const baseUrl = import.meta.env.APP_BASE_URL || `${url.protocol}//${url.host}`;

  if (!clientId || !clientSecret) {
    return new Response(JSON.stringify({ error: 'Slack OAuth is not configured (SLACK_CLIENT_ID/SLACK_CLIENT_SECRET).' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const { returnTo } = decodeState(state);

  if (!code) {
    return new Response(JSON.stringify({ error: 'Missing code from Slack OAuth callback.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/slack/oauth/callback`;

  const client = new WebClient();
  const oauth = await client.oauth.v2.access({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
  });

  if (!oauth.ok) {
    return new Response(JSON.stringify({ error: 'Slack OAuth failed', detail: oauth.error }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const accessToken = oauth.access_token;
  const teamId = oauth.team?.id;
  const scopes = oauth.scope;

  if (!accessToken || !teamId) {
    return new Response(JSON.stringify({ error: 'Slack OAuth response missing access_token/team id.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await setSlackInstallation({
    teamId,
    accessToken,
    installedAt: new Date().toISOString(),
    scopes,
  });

  const destination = new URL(returnTo || '/settings', baseUrl).toString();
  return Response.redirect(destination, 302);
};

