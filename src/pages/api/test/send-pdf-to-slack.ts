import type { APIRoute } from 'astro';
import { getSlackInstallation } from '../../../lib/storage';
import { uploadPdfToSlack } from '../../../lib/slack';
import { renderReportPdfWithPlaywright } from '../../../lib/pdf/playwright-pdf';

export const POST: APIRoute = async ({ request, url }) => {
  const installation = await getSlackInstallation();
  if (!installation) {
    return new Response(JSON.stringify({ error: 'Slack is not connected.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // For local testing, avoid depending on the ngrok host (it changes and can go offline),
  // and render via the local server instead. In production, `url.host` will be the deployed host.
  const baseUrl =
    url.hostname.endsWith('ngrok-free.app')
      ? `http://127.0.0.1:${process.env.PORT ?? '4321'}`
      : `${url.protocol}//${url.host}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { siteId, channelId, dateFrom, dateTo } = (body ?? {}) as Record<string, string>;
  if (!siteId || !channelId || !dateFrom || !dateTo) {
    return new Response(JSON.stringify({ error: 'Required: siteId, channelId, dateFrom, dateTo' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const pdf = await renderReportPdfWithPlaywright({ baseUrl, siteId, dateFrom, dateTo });
    const filename = `${siteId.replace(/[^a-z0-9]/gi, '_')}_${dateFrom}_${dateTo}.pdf`;
    await uploadPdfToSlack({
      accessToken: installation.accessToken,
      channelId,
      filename,
      title: `Monthly report — ${siteId}`,
      initialComment: `Test report for ${siteId} (${dateFrom} → ${dateTo})`,
      pdf,
    });
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to generate/send PDF', detail: String(err) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

