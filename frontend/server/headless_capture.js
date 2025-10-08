const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  const outDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const results = [];
  page.on('console', msg => {
    results.push({ type: 'console', text: msg.text() });
  });
  page.on('pageerror', err => {
    results.push({ type: 'pageerror', text: err.message });
  });
  page.on('requestfailed', req => {
    results.push({ type: 'requestfailed', url: req.url(), method: req.method(), failure: req.failure() && req.failure().errorText });
  });

  // Pages to test
  const pages = [
    { url: 'http://localhost:4200/events', name: 'events' },
    { url: 'http://localhost:4200/', name: 'root' },
    { url: 'http://localhost:4200/dashboard', name: 'dashboard' }
  ];

  for (const p of pages) {
    try {
      await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 15000 });
      await page.screenshot({ path: path.join(outDir, `${p.name}.png`), fullPage: true });
      results.push({ type: 'visited', url: p.url, ok: true });
    } catch (err) {
      results.push({ type: 'visited', url: p.url, ok: false, error: err.message });
    }
  }

  await browser.close();

  const reportPath = path.join(outDir, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('Report written to', reportPath);
})();
