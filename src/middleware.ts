import { defineMiddleware } from 'astro/middleware';
import { createHash } from 'node:crypto';

const AUTH_COOKIE = 'ff_auth';

function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function isPublicPath(pathname: string): boolean {
  // Public endpoints required for authentication + Slack OAuth.
  if (pathname === '/login') return true;
  if (pathname === '/api/auth/login') return true;
  if (pathname === '/api/slack/oauth/start') return true;
  if (pathname === '/api/slack/oauth/callback') return true;

  // Search/SEO control files should always be reachable.
  if (pathname === '/robots.txt') return true;

  // Static assets (avoid redirect loops for CSS/images).
  if (pathname.startsWith('/favicon')) return true;
  if (pathname.endsWith('.svg') || pathname.endsWith('.png') || pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || pathname.endsWith('.webp')) {
    return true;
  }
  if (pathname.startsWith('/_astro/')) return true;

  return false;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const password = process.env.SITE_PASSWORD?.trim() || '';

  // Always discourage indexing at the edge (works for HTML + API).
  const res = await (async () => {
    if (!password) return next();

    const { pathname } = context.url;
    if (isPublicPath(pathname)) return next();

    // Allow automation (cron) and API access via header too (useful for curl/cron).
    const headerPassword = context.request.headers.get('x-site-password')?.trim() || '';
    if (headerPassword && headerPassword === password) return next();

    const cookie = context.cookies.get(AUTH_COOKIE)?.value || '';
    const expected = sha256Hex(password);
    if (cookie && cookie === expected) return next();

    return Response.redirect(new URL('/login', context.url), 302);
  })();

  res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
  return res;
});

