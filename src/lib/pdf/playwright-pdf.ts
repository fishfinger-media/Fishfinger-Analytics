export async function renderReportPdfWithPlaywright(params: {
  baseUrl: string;
  siteId: string;
  dateFrom: string;
  dateTo: string;
}): Promise<Buffer> {
  // On Vercel/serverless, bundling Playwright's downloaded browser binaries is brittle.
  // Instead, use a serverless-friendly Chromium binary and Playwright's driver only.
  const { chromium } = await import('playwright-core');

  const url =
    `${params.baseUrl.replace(/\/$/, '')}/report-print` +
    `?siteId=${encodeURIComponent(params.siteId)}` +
    `&dateFrom=${encodeURIComponent(params.dateFrom)}` +
    `&dateTo=${encodeURIComponent(params.dateTo)}`;

  const isVercel = Boolean(process.env.VERCEL);
  const launchOptions: Parameters<typeof chromium.launch>[0] = {
    // Vercel/serverless Linux environments typically require disabling the sandbox.
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };

  if (isVercel) {
    const chromiumLambda = (await import('@sparticuz/chromium')).default;
    launchOptions.executablePath = await chromiumLambda.executablePath();
    launchOptions.args = [...chromiumLambda.args, ...(launchOptions.args ?? [])];
    launchOptions.headless = chromiumLambda.headless;
  }

  const browser = await chromium.launch(launchOptions);
  try {
    const sitePassword = process.env.SITE_PASSWORD?.trim() || '';
    const context = await browser.newContext({
      extraHTTPHeaders: sitePassword ? { 'x-site-password': sitePassword } : undefined,
    });

    // Important for crisp charts in PDFs:
    // Chart.js renders to <canvas> (raster). In headless Chromium the default DPR is ~1,
    // so printing produces visibly pixelated graphs. A higher deviceScaleFactor increases
    // the backing resolution for all canvases and layout.
    const page = await context.newPage({
      viewport: { width: 1400, height: 900 },
      deviceScaleFactor: 2,
    });
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    if (page.url().includes('/login')) {
      throw new Error('PDF render was redirected to /login. Ensure SITE_PASSWORD is set in the runtime env so Playwright can authenticate via x-site-password.');
    }
    if (res && !res.ok()) {
      throw new Error(`Failed to load report-print page: HTTP ${res.status()} ${res.statusText()}`);
    }
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

