import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const clientId = import.meta.env.SLACK_CLIENT_ID;
  const baseUrl = import.meta.env.APP_BASE_URL || `${url.protocol}//${url.host}`;

  if (!clientId) {
    return new Response(JSON.stringify({ error: 'SLACK_CLIENT_ID is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/slack/oauth/callback`;

  const scopes = [
    'channels:read',
    'chat:write',
    'files:write',
  ].join(',');

  const authUrl = new URL('https://slack.com/oauth/v2/authorize');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('redirect_uri', redirectUri);

  // Optional: bring user back to Settings after install.
  const returnTo = url.searchParams.get('returnTo') || '/settings';
  authUrl.searchParams.set('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64url'));

  return Response.redirect(authUrl.toString(), 302);
};

