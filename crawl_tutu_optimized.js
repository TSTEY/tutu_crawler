const fs = require('fs-extra');
const path = require('path');
const { chromium } = require('playwright');
const PQueue = require('p-queue').default;

const OUT = path.resolve(process.argv[2] || './tutu_dump');
const START = process.argv[3] || 'https://www.tutu.ru/avia/';
const MAX_PAGES = parseInt(process.argv[4] || '500', 10);
const CONCURRENCY = parseInt(process.argv[5] || '3', 10);
const WAIT_AFTER_NAV = 3000;

fs.ensureDirSync(OUT);

function sanitizeFilename(url) {
  try {
    const u = new URL(url);
    let p = u.pathname;
    if (p.endsWith('/')) p += 'index.html';
    return path.join(OUT, u.hostname, decodeURIComponent(p));
  } catch {
    return path.join(OUT, 'misc', encodeURIComponent(url));
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.117 Safari/537.36',
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const queue = new PQueue({ concurrency: CONCURRENCY });
  const visited = new Set();

  function enqueue(url) {
    if (!url) return;
    try {
      const u = new URL(url, START);
      if (!u.hostname.endsWith('tutu.ru')) return;
      const normalized = u.toString().split('#')[0];
      if (visited.has(normalized)) return;
      visited.add(normalized);
      queue.add(() => visit(normalized)).catch(console.error);
    } catch {}
  }

  context.on('response', async response => {
    try {
      const url = response.url();
      if (!url.startsWith('http')) return;
      const u = new URL(url);
      if (!u.hostname.endsWith('tutu.ru')) return;

      const file = sanitizeFilename(url);
      await fs.ensureDir(path.dirname(file));

      try {
        const buffer = await response.body();
        if (!buffer || buffer.length === 0) return;

        let outFile = file;
        const ct = (response.headers()['content-type'] || '').toLowerCase();
        if (!path.extname(outFile)) {
          if (ct.includes('application/json')) outFile += '.json';
          else if (ct.includes('javascript')) outFile += '.js';
          else if (ct.includes('text/css')) outFile += '.css';
          else if (ct.includes('image')) {
            const map = { 'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/svg+xml': '.svg' };
            outFile += (map[ct.split(';')[0]] || '.bin');
          } else outFile += '.bin';
        }

        await fs.writeFile(outFile, buffer);
      } catch {}
    } catch {}
  });

  let pagesCrawled = 0;

  async function visit(url) {
    if (pagesCrawled >= MAX_PAGES) return;
    pagesCrawled++;
    console.log(`[${pagesCrawled}] Visiting: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(WAIT_AFTER_NAV);

      const html = await page.content();
      const outFile = sanitizeFilename(url);
      await fs.ensureDir(path.dirname(outFile));
      await fs.writeFile(outFile, html, 'utf8');

      const anchors = await page.$$eval('a[href]', a => a.map(x => x.getAttribute('href')));
      for (const a of anchors) {
        if (!a) continue;
        if (a.startsWith('mailto:') || a.startsWith('tel:') || a.startsWith('javascript:')) continue;
        enqueue(new URL(a, url).toString());
      }
    } catch (e) {
      console.warn('visit failed:', url, e.message?.slice?.(0, 200));
    }
  }

  enqueue(START);
  await queue.onIdle();
  console.log('Crawl finished. Pages crawled:', pagesCrawled);
  await browser.close();
})();
