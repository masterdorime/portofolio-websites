// Local screenshot helper via installed Edge (no browser download).
// Usage: node scripts/shot.mjs <url> <out.png> [waitMs] [scrollY] [clickSelector] [probeJs]
// probeJs is evaluated in-page and printed (use for DOM interrogation).
import puppeteer from 'puppeteer-core';

const [url, out, waitMs = '4000', scrollY = '0', clickSelector = '', probeJs = ''] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node scripts/shot.mjs <url> <out.png> [waitMs] [scrollY]');
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath:
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--window-size=1600,900'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 120)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 120));
});
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
if (clickSelector) {
  try {
    await page.waitForSelector(clickSelector, { timeout: 15000 });
    // Click (with retries): an early click can land before hydration
    // attaches listeners and silently no-op. Verify dismissal instead.
    for (let attempt = 0; attempt < 4; attempt++) {
      await new Promise((r) => setTimeout(r, 2500));
      const gone = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (!el) return true;
        el.click();
        return false;
      }, clickSelector);
      if (gone) break;
      await new Promise((r) => setTimeout(r, 1500));
      if (!(await page.evaluate((sel) => !!document.querySelector(sel), clickSelector))) break;
    }
  } catch (e) {
    console.log('click failed:', String(e).slice(0, 100));
  }
}
if (Number(scrollY) > 0) {
  await page.evaluate((y) => window.scrollTo(0, y), Number(scrollY));
}
if (probeJs === 'AUDIT') {
  try {
    const result = await page.evaluate(() => {
      const audit = { skip: null, canvases: [] };
      const lw = document.querySelector('.lanyard-wrapper canvas');
      if (lw) lw.style.display = 'none';
      document.querySelectorAll('canvas').forEach((c) => {
        const r = c.getBoundingClientRect();
        const path = [];
        let p = c;
        while (p && path.length < 4) {
          const cls = typeof p.className === 'string' ? p.className.split(' ')[0] : '';
          path.push(p.tagName + '.' + cls);
          p = p.parentElement;
        }
        audit.canvases.push({
          w: Math.round(r.width),
          h: Math.round(r.height),
          x: Math.round(r.x),
          y: Math.round(r.y),
          path: path.join('<'),
        });
      });
      return audit;
    });
    console.log('PROBE:', JSON.stringify(result).slice(0, 2000));
  } catch (e) {
    console.log('PROBE-ERR:', String(e).slice(0, 200));
  }
} else if (probeJs) {
  try {
    const result = await page.evaluate((js) => (0, eval)(js), probeJs);
    console.log('PROBE:', JSON.stringify(result).slice(0, 2000));
  } catch (e) {
    console.log('PROBE-ERR:', String(e).slice(0, 200));
  }
}
await new Promise((r) => setTimeout(r, Number(waitMs)));
await page.screenshot({ path: out });
console.log('saved', out, errors.length ? `(${errors.length} errors)` : '(clean)');
for (const e of errors.slice(0, 8)) console.log(' ', e);
await browser.close();
