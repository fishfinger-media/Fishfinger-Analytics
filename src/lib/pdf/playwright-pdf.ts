import { chromium } from 'playwright';

export async function renderReportPdfWithPlaywright(params: {
  baseUrl: string;
  siteId: string;
  dateFrom: string;
  dateTo: string;
}): Promise<Buffer> {
  const url =
    `${params.baseUrl.replace(/\/$/, '')}/report-print` +
    `?siteId=${encodeURIComponent(params.siteId)}` +
    `&dateFrom=${encodeURIComponent(params.dateFrom)}` +
    `&dateTo=${encodeURIComponent(params.dateTo)}`;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => (globalThis as any).__FISHFINGER_REPORT_READY__ === true, null, {
      timeout: 120_000,
    });
    const reportError = await page.evaluate(() => (globalThis as any).__FISHFINGER_REPORT_ERROR__ ?? null);
    if (reportError) throw new Error(String(reportError));

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

