import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';

const AUTH_COOKIE = 'ff_auth';

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const password = process.env.SITE_PASSWORD?.trim() || '';
  if (!password) return json({ ok: false, error: 'SITE_PASSWORD is not configured.' }, 500);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const provided = typeof (body as any)?.password === 'string' ? String((body as any).password).trim() : '';
  if (!provided) return json({ ok: false, error: 'Missing password.' }, 400);
  if (provided !== password) return json({ ok: false, error: 'Incorrect password.' }, 401);

  cookies.set(AUTH_COOKIE, sha256Hex(password), {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return json({ ok: true });
};

