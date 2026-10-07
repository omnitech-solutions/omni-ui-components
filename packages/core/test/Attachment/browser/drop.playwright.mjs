// Real drag and drop of real files, against a running Storybook (not synthetic events, not happy-dom).
//
//   pnpm exec storybook dev -p 6122 --ci --no-open        # in one shell
//   STORYBOOK_URL=http://localhost:6122 node packages/core/test/Attachment/browser/drop.playwright.mjs
//
// The drop goes through Chromium's own drag pipeline (CDP `Input.dispatchDragEvent` with file paths on disk), so the
// browser builds the `DataTransfer` and fires dragenter / dragover / drop itself. Exits non-zero on any failed check
// or console error. Runs in dark and light.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.env.STORYBOOK_URL ?? 'http://localhost:6122';
const dir = mkdtempSync(path.join(tmpdir(), 'oui-drop-'));
const make = (name, body = 'hello') => {
  const file = path.join(dir, name);
  writeFileSync(file, body);
  return file;
};
const notes = make('notes.txt');
const readme = make('readme.md', '# hi');
const archive = make('archive.zip', 'PK');

let failures = 0;
const check = (ok, message) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${message}`);
  if (!ok) failures += 1;
};

/** Drag files from outside the page onto the point (x, y) with the browser's own drag events. */
async function dropFiles(page, client, files, x, y) {
  const data = { items: [], files, dragOperationsMask: 1 };
  await client.send('Input.dispatchDragEvent', { type: 'dragEnter', x, y, data });
  await client.send('Input.dispatchDragEvent', { type: 'dragOver', x, y, data });
  return data;
}
const release = (client, data, x, y) => client.send('Input.dispatchDragEvent', { type: 'drop', x, y, data });

const browser = await chromium.launch();
for (const theme of ['dark', 'light']) {
  const page = await browser.newPage();
  await page.addInitScript('window.__name=function(f){return f};');
  const errors = [];
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  page.on('pageerror', (error) => errors.push(String(error)));
  const client = await page.context().newCDPSession(page);

  await page.goto(`${base}/iframe.html?id=omni-ui-components-attachment--uploads&viewMode=story&globals=theme:${theme}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#storybook-root > :not(style)', { state: 'attached' });
  const zone = page.locator('[data-slot="attachment-dropzone"]');
  await zone.waitFor();
  const box = await zone.boundingBox();
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  // 1. Dragging a file over shows the overlay; leaving it hides the overlay.
  let data = await dropFiles(page, client, [notes], x, y);
  check(await page.locator('[data-slot="attachment-drop-overlay"]').isVisible(), `[${theme}] overlay shows while a real file is dragged over`);
  await client.send('Input.dispatchDragEvent', { type: 'dragCancel', x, y, data });
  await client.send('Input.dispatchDragEvent', { type: 'dragEnter', x: 2, y: 2, data });
  await client.send('Input.dispatchDragEvent', { type: 'dragCancel', x: 2, y: 2, data });

  // 2. Dropping an allowed file adds a card that is uploading, then ready.
  data = await dropFiles(page, client, [notes], x, y);
  await release(client, data, x, y);
  const card = page.locator('[data-slot="attachment"]', { hasText: 'notes.txt' });
  await card.waitFor({ timeout: 3000 });
  check(true, `[${theme}] a real dropped file became an attachment card`);
  check((await card.getAttribute('data-status')) === 'uploading', `[${theme}] the card starts uploading`);
  await page.waitForFunction(() => document.querySelector('[data-slot="attachment"][data-status="ready"]'), null, { timeout: 4000 });
  check(true, `[${theme}] the card reaches ready`);
  check((await page.locator('[data-slot="attachment-drop-overlay"]').count()) === 0, `[${theme}] overlay is gone after the drop`);

  // 3. Two files in one drop, one of a type outside the allowlist: the whole batch is refused, nothing is added.
  const before = await page.locator('[data-slot="attachment"]').count();
  data = await dropFiles(page, client, [readme, archive], x, y);
  await release(client, data, x, y);
  await page.waitForTimeout(300);
  check((await page.locator('[data-slot="attachment"]').count()) === before, `[${theme}] a batch with a .zip is refused whole`);

  // 4. A markdown file alone is accepted; its card can be removed once ready.
  data = await dropFiles(page, client, [readme], x, y);
  await release(client, data, x, y);
  await page.locator('[data-slot="attachment"]', { hasText: 'readme.md' }).waitFor({ timeout: 3000 });
  check(true, `[${theme}] a real dropped Markdown file is accepted`);
  await page.waitForFunction(() => document.querySelectorAll('[data-slot="attachment"][data-status="ready"]').length === 2, null, { timeout: 4000 });
  await page.getByRole('button', { name: 'Remove readme.md' }).click();
  check((await page.locator('[data-slot="attachment"]', { hasText: 'readme.md' }).count()) === 0, `[${theme}] remove drops the card`);

  check(errors.length === 0, `[${theme}] 0 console errors${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  await page.close();
}
await browser.close();
process.exit(failures === 0 ? 0 : 1);
