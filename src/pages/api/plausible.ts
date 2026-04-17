import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const apiKey = import.meta.env.PLAUSIBLE_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'PLAUSIBLE_API_KEY is not configured on the server.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const endpoint = url.searchParams.get('endpoint');
  if (!endpoint) {
    return new Response(
      JSON.stringify({ error: 'Missing required query param: endpoint' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Forward all params except our own 'endpoint' param transparently to Plausible
  const forwardParams = new URLSearchParams(url.searchParams);
  forwardParams.delete('endpoint');

  const plausibleUrl = `https://plausible.io/api/v1/stats/${endpoint}?${forwardParams.toString()}`;

  let response: Response;
  try {
    response = await fetch(plausibleUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to reach Plausible API', detail: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
