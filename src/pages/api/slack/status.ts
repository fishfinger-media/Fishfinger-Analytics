import type { APIRoute } from 'astro';
import { getSlackInstallation } from '../../../lib/storage';

export const GET: APIRoute = async () => {
  const installation = await getSlackInstallation();
  return new Response(
    JSON.stringify({
      connected: Boolean(installation),
      teamId: installation?.teamId ?? null,
      installedAt: installation?.installedAt ?? null,
      scopes: installation?.scopes ?? null,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
};

