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
    // Important for crisp charts in PDFs:
    // Chart.js renders to <canvas> (raster). In headless Chromium the default DPR is ~1,
    // so printing produces visibly pixelated graphs. A higher deviceScaleFactor increases
    // the backing resolution for all canvases and layout.
    const page = await browser.newPage({
      viewport: { width: 1400, height: 900 },
      deviceScaleFactor: 2,
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => (globalThis as any).__FISHFINGER_REPORT_READY__ === true, null, {
      timeout: 120_000,
    });
    const reportError = await page.evaluate(() => (globalThis as any).__FISHFINGER_REPORT_ERROR__ ?? null);
    if (reportError) throw new Error(String(reportError));

    // Ensure print-specific CSS (e.g. @page margins) is applied.
    await page.emulateMedia({ media: 'print' });

    const pdf = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      preferCSSPageSize: false,
      // Tiny up-scale to avoid subpixel gutters (Chromium rounding can leave 1–3px white edges).
      scale: 1.01,
      // Add a small "top padding" without shrinking the page box (avoids overflow / page overlap).
      margin: { top: '16px', right: '0', bottom: '0', left: '0' },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

