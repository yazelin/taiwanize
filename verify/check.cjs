// 用法: NODE_PATH=$(npm root -g) node verify/check.cjs <url>
const { chromium, devices } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://localhost:8003/';
  const opts = process.env.PW_CHANNEL === 'none' ? {} : { channel: 'chrome' };
  const browser = await chromium.launch(opts);

  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('#status.ok', { timeout: 60000 });

  // twp:字+詞都轉
  await page.fill('#src', '这个软件和视频都很好用,网络也稳定,里面的内容很棒');
  await page.waitForTimeout(500);
  const twp = await page.inputValue('#dst');
  const twpOk = twp.includes('軟體') && twp.includes('影片') && twp.includes('網路') && twp.includes('裡面');

  // tw:只轉字不轉詞
  await page.selectOption('#mode', 'tw');
  await page.waitForTimeout(300);
  const tw = await page.inputValue('#dst');
  const twOk = tw.includes('軟件') && tw.includes('視頻');

  // 自訂取代
  await page.selectOption('#mode', 'twp');
  await page.click('details summary');
  await page.fill('#custom', '軟體=軟體服務');
  await page.waitForTimeout(500);
  const custom = await page.inputValue('#dst');
  const customOk = custom.includes('軟體服務');

  // 繁化姬模式(經代理;本機測試可用 PROXY_URL 指到 stub)
  const proxyQ = process.env.PROXY_URL ? '?proxy=' + encodeURIComponent(process.env.PROXY_URL) : '';
  const p2 = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await p2.goto(url + proxyQ, { waitUntil: 'networkidle' });
  await p2.waitForSelector('#status.ok', { timeout: 60000 });
  await p2.check('#useApi');
  const noteShown = await p2.locator('#apinote').isVisible();
  await p2.fill('#src', '这个软件和视频都很好用');
  await p2.waitForFunction(() => document.getElementById('dst').value.includes('軟體'), null, { timeout: 25000 });
  const api = await p2.inputValue('#dst');
  const engine = await p2.textContent('#status');
  const apiOk = api.includes('軟體') && api.includes('影片') && engine.includes('繁化姬') && noteShown;

  // 手機
  const m = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
  await m.goto(url, { waitUntil: 'networkidle' });
  const hscroll = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

  console.log(JSON.stringify({ twpOk, twOk, customOk, apiOk, engine, hscroll, sample: twp.slice(0, 30) }));
  await browser.close();
  if (!twpOk || !twOk || !customOk || !apiOk || hscroll) process.exit(1);
})().catch((e) => { console.error(e.message); process.exit(1); });
