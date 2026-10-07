// CSS isolation test: does importing the shipped dist/styles.css into a non-Tailwind host change the host?
//   1. Static audit of dist/styles.css: every top-level block is a layer (omni-ui-components or a sublayer), @property or
//      @keyframes; no rule whose subject is an element, `*`, :root, html or body declares anything but custom properties.
//   2. Host page A is screenshotted (a) host only and (b) with the library stylesheet in every order/layering, including unlayered host rules; the PNG bytes
//      and the computed style of every element must be identical (threshold 0).
//   3. Host page B (host + library Panel and Button) renders in light and dark with zero console errors; the library Button does
//      not take the host button's look.
//   5. Subtree theming (d.html): data-theme on any ancestor, nested opposite themes and token overrides compute per subtree.
//   4. Library regression page: ~90 library elements (buttons, inputs, select, segmented, card, alert, panel, table, composer ...)
//      compute identically with no host stylesheet and with the host in `@layer host`, in light and dark.
// Run: pnpm --filter @oc-tech/omni-ui-components test:isolation   (builds the package first)

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { build } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const core = resolve(here, '../..');
const shots = join(here, 'screenshots');
mkdirSync(shots, { recursive: true });

const failures = [];
const fail = (message) => {
  failures.push(message);
  console.error(`FAIL  ${message}`);
};
const pass = (message) => console.log(`ok    ${message}`);

// ---------------------------------------------------------------- 1. static audit

/** Splits CSS into a tree of { prelude, body|children }; comments and strings are skipped. */
function parseBlocks(css) {
  const root = { children: [] };
  const stack = [root];
  let prelude = '';
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      i = css.indexOf('*/', i + 2) + 1;
    } else if (ch === '"' || ch === "'") {
      const end = css.indexOf(ch, i + 1);
      prelude += css.slice(i, end + 1);
      i = end;
    } else if (ch === '{') {
      const node = { prelude: prelude.trim(), children: [], decls: '' };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      prelude = '';
    } else if (ch === '}') {
      const node = stack.pop();
      node.decls = node.decls + prelude;
      prelude = '';
    } else if (ch === ';') {
      const top = stack[stack.length - 1];
      if (stack.length === 1)
        top.children.push({ prelude: prelude.trim(), statement: true, children: [] });
      else top.decls += `${prelude};`;
      prelude = '';
    } else {
      prelude += ch;
    }
  }
  return root;
}

const splitSelectors = (list) => {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of list) {
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
};
const declaresOnlyCustomProps = (decls) =>
  decls
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .every((d) => d.startsWith('--'));

function auditCss(css) {
  const problems = [];
  const root = parseBlocks(css);
  for (const node of root.children) {
    const p = node.prelude;
    if (node.statement) {
      if (
        !/^@layer omni-ui-components(\.[\w-]+)?(\s*,\s*omni-ui-components(\.[\w-]+)?)*$/.test(p) &&
        !p.startsWith('@charset')
      ) {
        problems.push(`top-level statement escapes the library layer: ${p.slice(0, 80)}`);
      }
      continue;
    }
    if (/^@layer omni-ui-components(\.[\w-]+)?$/.test(p)) {
      const visit = (n) => {
        for (const child of n.children) {
          if (/^@(media|supports|container)/.test(child.prelude)) {
            visit(child);
            continue;
          }
          if (child.prelude.startsWith('@')) continue; // @keyframes / @font-face etc. inside a layer
          for (const selector of splitSelectors(child.prelude)) {
            // Scoped = the selector names a class, id or attribute somewhere outside :not(); `:where([data-slot])` counts.
            const scoped = /[.#[]/.test(selector.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, ''));
            if (!scoped && !declaresOnlyCustomProps(child.decls)) {
              problems.push(
                `unscoped element/universal selector with real declarations in ${p}: ${selector.slice(0, 90)}`,
              );
            }
          }
          visit(child);
        }
      };
      visit(node);
      continue;
    }
    if (/^@(property|keyframes)\b/.test(p)) continue;
    problems.push(`top-level block outside the library layer: ${p.slice(0, 80)}`);
  }
  return problems;
}

const cssPath = join(core, 'dist/styles.css');
if (!existsSync(cssPath)) {
  console.error(
    'dist/styles.css is missing: run `pnpm build` first (the test:isolation script does).',
  );
  process.exit(2);
}
const cssText = readFileSync(cssPath, 'utf8');
const auditProblems = auditCss(cssText);
if (
  !/^(?:\/\*[\s\S]*?\*\/)?\s*@layer omni-ui-components\.properties, omni-ui-components\.theme, omni-ui-components\.palette, omni-ui-components\.base, omni-ui-components\.utilities, omni-ui-components\.classes;/.test(
    cssText,
  )
) {
  auditProblems.push(
    'the layer order statement is not the first rule of the stylesheet (the bundler may have reordered the layers)',
  );
}
if (auditProblems.length) auditProblems.slice(0, 20).forEach((p) => fail(`css audit: ${p}`));
else
  pass(
    `css audit: all of dist/styles.css (${Math.round(statSync(cssPath).size / 1024)} KB) sits in layer omni-ui-components; no unscoped element rule`,
  );

// ---------------------------------------------------------------- servers

await build({ configFile: join(here, 'vite.config.ts') });

const types = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
};
const roots = [here, core, join(core, 'tmp/host-app')];
const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const rel = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  const candidates = rel.startsWith('dist/')
    ? [join(core, rel)]
    : [join(core, 'tmp/host-app', rel), join(here, rel)];
  const file = candidates.find(
    (f) => existsSync(f) && statSync(f).isFile() && roots.some((r) => f.startsWith(r)),
  );
  if (!file) {
    res.writeHead(404).end('not found');
    return;
  }
  res
    .writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
    .end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;

const launch = async () => {
  try {
    return await chromium.launch();
  } catch (error) {
    // Sandboxes pin an older Chromium revision than the installed Playwright expects: fall back to any installed one.
    const dir = process.env.PLAYWRIGHT_BROWSERS_PATH;
    const found =
      dir && existsSync(dir) ? readdirSync(dir).find((d) => d.startsWith('chromium-')) : undefined;
    if (!found) throw error;
    return chromium.launch({ executablePath: join(dir, found, 'chrome-linux/chrome') });
  }
};
const browser = await launch();
const settle = async (page) => {
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
};

// ---------------------------------------------------------------- 2. page A, zero-pixel diff

// Every computed property of every host element is compared (threshold 0), custom properties excepted.
const computedDump = () =>
  [...document.querySelectorAll('html, body, #host-content, #host-content *')].map((el) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const name of cs) {
      if (name.startsWith('--')) continue;
      o[name] = cs.getPropertyValue(name);
    }
    return [el.tagName + (el.className ? `.${el.className}` : ''), o];
  });

// Chromium reports the UA default serif as `Times` or `"Times New Roman"` depending on when platform fonts were resolved. The same
// flip happens with the library stylesheet disabled again, so it is a browser artefact, not a rule: pixels are compared exactly.
const sameDefaultSerif = (key, a, b) =>
  key === 'font-family' && [a, b].every((v) => v === 'Times' || v === '"Times New Roman"');

async function capturePage(url, name) {
  const context = await browser.newContext({
    viewport: { width: 1000, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const png = await page.screenshot({ fullPage: true, animations: 'disabled' });
  writeFileSync(join(shots, `${name}.png`), png);
  const computed = await page.evaluate(computedDump);
  await context.close();
  return { png, computed, errors };
}

const baseline = await capturePage(`${base}/a.html`, 'A-host-only');
for (const variant of ['before', 'after', 'layered']) {
  const withLib = await capturePage(`${base}/a.html?lib=${variant}`, `A-with-library-${variant}`);
  const sameBytes = Buffer.compare(baseline.png, withLib.png) === 0;
  let styleDiffs = 0;
  const sample = [];
  baseline.computed.forEach(([id, props], i) => {
    const other = withLib.computed[i]?.[1] ?? {};
    for (const key of Object.keys(props)) {
      if (props[key] !== other[key] && !sameDefaultSerif(key, props[key], other[key])) {
        styleDiffs += 1;
        if (sample.length < Number(process.env.DIFF_SAMPLE ?? 8))
          sample.push(`${id} ${key}: ${props[key]} -> ${other[key]}`);
      }
    }
  });
  if (sameBytes && styleDiffs === 0)
    pass(
      `page A + library (${variant}): screenshot byte-identical, 0 computed-style differences over ${baseline.computed.length} elements`,
    );
  else
    fail(
      `page A + library (${variant}): pixels ${sameBytes ? 'identical' : 'DIFFER'}, ${styleDiffs} computed-style differences ${sample.join(' | ')}`,
    );
  if (withLib.errors.length)
    fail(`page A + library (${variant}): console errors ${withLib.errors.join(' | ')}`);
}

// ---------------------------------------------------------------- 3. page B, library renders in light and dark

for (const theme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 700 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/b.html?theme=${theme}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#library-root [data-testid="panel-body"]', { state: 'attached' });
  await settle(page);
  const facts = await page.evaluate(() => {
    const px = (el, prop) => getComputedStyle(el)[prop];
    const libButton = [...document.querySelectorAll('#library-root button')].find((b) =>
      /Library button/.test(b.textContent ?? ''),
    );
    const hostButton = document.querySelector('#host-content button');
    const region = document.querySelector('#library-root [role="region"]');
    const header = region?.firstElementChild;
    return {
      libButtonShadow: libButton ? px(libButton, 'boxShadow') : null,
      hostButtonShadow: px(hostButton, 'boxShadow'),
      libButtonBorder: libButton ? px(libButton, 'borderTopWidth') : null,
      hostButtonBorder: px(hostButton, 'borderTopWidth'),
      libButtonFont: libButton ? px(libButton, 'fontFamily') : null,
      hostButtonBg: px(hostButton, 'backgroundColor'),
      libButtonBg: libButton ? px(libButton, 'backgroundColor') : null,
      regionBg: region ? px(region, 'backgroundColor') : null,
      regionBorder: region ? px(region, 'borderTopWidth') : null,
      headerHeight: header ? header.getBoundingClientRect().height : null,
      hostBodyBg: px(document.body, 'backgroundColor'),
    };
  });
  await page.screenshot({
    path: join(shots, `B-${theme}.png`),
    fullPage: true,
    animations: 'disabled',
  });
  if (errors.length) fail(`page B ${theme}: console errors ${errors.join(' | ')}`);
  else pass(`page B ${theme}: 0 console errors`);
  if (facts.libButtonShadow === null) fail(`page B ${theme}: library Button not found`);
  else if (
    facts.libButtonShadow === facts.hostButtonShadow ||
    facts.libButtonBorder === facts.hostButtonBorder
  ) {
    fail(
      `page B ${theme}: library Button wears the host button's shadow or border (${facts.libButtonShadow} / ${facts.libButtonBorder})`,
    );
  } else
    pass(
      `page B ${theme}: library Button keeps its own border and shadow (${facts.libButtonBorder}, ${facts.libButtonShadow})`,
    );
  if (facts.libButtonBg === facts.hostButtonBg)
    fail(`page B ${theme}: library Button has the host button background`);
  else
    pass(
      `page B ${theme}: library Button background ${facts.libButtonBg}, host ${facts.hostButtonBg}`,
    );
  if (facts.headerHeight !== 40)
    fail(`page B ${theme}: Panel header is ${facts.headerHeight}px, expected 40`);
  else pass(`page B ${theme}: Panel header 40px, region background ${facts.regionBg}`);
  console.log(`      ${theme}: ${JSON.stringify(facts)}`);
  await context.close();
}

// ---------------------------------------------------------------- 4. host does not leak into the library

// A spread of library components (c.tsx; its own wrapper divs are marked data-fixture and skipped) is rendered with no host stylesheet and with host.css in `@layer host`. Every computed
// property of every library element must be identical: the host's resets, element rules and tokens do not reach them.
const libraryDump = () =>
  [...document.querySelectorAll('#library-root, #library-root *')]
    .filter((el) => !el.closest('.sr-only') && !el.hasAttribute('data-fixture'))
    .map((el) => {
      const cs = getComputedStyle(el);
      const o = {};
      for (const name of cs) if (!name.startsWith('--')) o[name] = cs.getPropertyValue(name);
      return [
        (el.parentElement
          ? el.parentElement.tagName +
            (el.parentElement.getAttribute('data-slot')
              ? '[' + el.parentElement.getAttribute('data-slot') + ']'
              : '') +
            '>'
          : '') +
          el.tagName +
          (el.getAttribute('data-slot') ? `[data-slot=${el.getAttribute('data-slot')}]` : '') +
          (el.getAttribute('class') ? `.${el.getAttribute('class').slice(0, 120)}` : ''),
        o,
      ];
    });

async function captureLibrary(host, theme) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/c.html?host=${host}&theme=${theme}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#library-root button', { state: 'attached' });
  await page.addStyleTag({
    content: '*, ::before, ::after { transition: none !important; animation: none !important; }',
  });
  await settle(page);
  const computed = await page.evaluate(libraryDump);
  await context.close();
  return { computed, errors };
}

for (const theme of ['light', 'dark']) {
  const alone = await captureLibrary('none', theme);
  const hosted = await captureLibrary('layered', theme);
  const errors = [...alone.errors, ...hosted.errors];
  if (errors.length) fail(`library regression page ${theme}: console errors ${errors.join(' | ')}`);
  if (alone.computed.length !== hosted.computed.length) {
    fail(
      `library regression page ${theme}: ${alone.computed.length} elements alone, ${hosted.computed.length} with the host`,
    );
    continue;
  }
  const leaks = [];
  alone.computed.forEach(([id, props], i) => {
    const diffs = Object.keys(props).filter(
      (key) =>
        props[key] !== hosted.computed[i][1][key] &&
        !sameDefaultSerif(key, props[key], hosted.computed[i][1][key]),
    );
    // `box-sizing` on its own changes nothing visible (an empty, unsized div): only report it when size or paint also differ.
    const visible = diffs.length === 1 && diffs[0] === 'box-sizing' ? [] : diffs;
    for (const key of visible)
      leaks.push(`${id} ${key}: ${props[key]} -> ${hosted.computed[i][1][key]}`);
  });
  if (leaks.length)
    fail(
      `library ${theme}: host styles leak into ${alone.computed.length} library elements, ${leaks.length} differences: ${leaks.slice(0, Number(process.env.DIFF_SAMPLE ?? 8)).join(' | ')}`,
    );
  else
    pass(
      `library ${theme}: ${alone.computed.length} library elements compute identically with and without the host stylesheet`,
    );
}

// ---------------------------------------------------------------- 5. subtree theming: two palettes in one document

// d.html renders the same component set in containers with data-theme on an ancestor: nested opposite themes (dark inside light, light
// inside dark) and an override of tokens on the container. Each container is probed by direct children only (its nested set is
// a separate container). A nested subtree must compute exactly like the same theme at the top level, whatever theme its host has.
const themeProbe = (id) => {
  const root = document.getElementById(id);
  const own = (selector) => {
    const el = [...root.querySelectorAll(selector)].find(
      (e) => e.closest('section[data-fixture]') === root,
    );
    if (!el) throw new Error(`theme probe: ${selector} not found in #${id}`);
    return el;
  };
  const read = (el, props) => {
    if (!el) throw new Error(`theme probe: missing element in #${id}`);
    return Object.fromEntries(props.map((p) => [p, getComputedStyle(el).getPropertyValue(p)]));
  };
  const paint = ['background-color', 'color', 'border-top-color', 'box-shadow'];
  const card = own('[data-probe="card"]').firstElementChild;
  const alert = own('[data-probe="alert"]').firstElementChild;
  const facts = {
    section: read(root, ['background-color', 'color']),
    panel: read(own('[data-slot="panel"]'), paint),
    panelHeader: read(own('[data-slot="panel-header"]'), paint),
    panelBody: read(own('[data-probe="panel-body"]'), ['color']),
    panelTitle: read(own('[data-slot="panel-title"]'), ['color']),
    button: read(own('button:not([aria-pressed])'), paint),
    input: read(own('input'), paint),
    segmented: read(own('[data-probe="segmented"]').firstElementChild, paint),
    card: read(card, paint),
    alert: alert ? read(alert, paint) : null,
    tokens: read(root, [
      '--oui-panel-bg',
      '--oui-foreground',
      '--oui-foreground-muted',
      '--oui-surface-field',
      '--oui-border-field',
      '--oui-tone-accent-fg',
      '--oui-segment-active-bg',
      '--oui-code-plain',
      '--oui-panel-meta-fg',
      '--oui-background-current',
      '--oui-primary-6',
    ]),
  };
  return facts;
};

async function captureThemes(host) {
  const context = await browser.newContext({
    viewport: { width: 900, height: 2200 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/d.html?host=${host}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#library-root button', { state: 'attached' });
  await page.addStyleTag({
    content: '*, ::before, ::after { transition: none !important; animation: none !important; }',
  });
  await settle(page);
  const result = { errors, facts: {} };
  for (const id of [
    'plain',
    'light-host',
    'dark-in-light',
    'dark-host',
    'light-in-dark',
    'override',
  ])
    result.facts[id] = await page.evaluate(themeProbe, id);
  result.html = await page.evaluate(() => document.documentElement.outerHTML.length);
  await page.screenshot({ path: join(shots, `subtree-theming-${host}.png`), fullPage: true });
  await context.close();
  return result;
}

const flatten = (facts) =>
  Object.entries(facts).flatMap(([group, props]) =>
    props ? Object.entries(props).map(([k, v]) => [`${group}.${k}`, v]) : [],
  );
const diffFacts = (a, b, skip = () => false) => {
  const right = Object.fromEntries(flatten(b));
  return flatten(a)
    .filter(([k, v]) => right[k] !== v && !skip(k))
    .map(([k, v]) => `${k}: ${v} vs ${right[k]}`);
};

for (const host of ['none', 'layered']) {
  const { errors, facts } = await captureThemes(host);
  const label = `subtree theming (${host === 'none' ? 'library alone' : 'host in @layer host'})`;
  if (errors.length) fail(`${label}: console errors ${errors.join(' | ')}`);
  const problems = [];
  // 1. a dark subtree inside a light host computes like a dark top-level host, and light inside dark like light; the nested ones carry the
  //    host's backdrop-independent values only (the section background is the same token), so everything is compared.
  const darkInLight = diffFacts(facts['dark-in-light'], facts['dark-host']);
  if (darkInLight.length)
    problems.push(
      `dark subtree in a light host differs from a dark host: ${darkInLight.slice(0, 6).join(' | ')}`,
    );
  const lightInDark = diffFacts(facts['light-in-dark'], facts['light-host']);
  if (lightInDark.length)
    problems.push(
      `light subtree in a dark host differs from a light host: ${lightInDark.slice(0, 6).join(' | ')}`,
    );
  // 2. the two palettes really differ in one document, on paint and on the derived tokens
  const same = flatten(facts['light-host']).filter(
    ([k, v]) =>
      k !== 'alert.box-shadow' &&
      v === Object.fromEntries(flatten(facts['dark-host']))[k] &&
      /^(section|panel|input|card)\.(background-color|color)|tokens\.--oui-(foreground|surface-field|panel-bg)$/.test(
        k,
      ),
  );
  if (same.length)
    problems.push(`light and dark containers share values: ${same.map(([k]) => k).join(', ')}`);
  // 3. no theme attribute behaves as light (the default), unchanged
  const plain = diffFacts(facts.plain, facts['light-host'], (k) => k.startsWith('section.'));
  if (plain.length)
    problems.push(
      `a container with no data-theme differs from data-theme="light": ${plain.slice(0, 6).join(' | ')}`,
    );
  // 4. token overrides on any ancestor win for the subtree and stay inside it
  if (facts.override.tokens['--oui-panel-bg'] !== 'rgb(10, 200, 30)')
    problems.push(`override: --oui-panel-bg is ${facts.override.tokens['--oui-panel-bg']}`);
  if (facts.override.panel['background-color'] === facts['dark-host'].panel['background-color'])
    problems.push('override: panel background did not change');
  const overrideLeak = ['plain', 'light-host', 'dark-host'].filter(
    (id) => facts[id].tokens['--oui-panel-bg'] === 'rgb(10, 200, 30)',
  );
  if (overrideLeak.length) problems.push(`override leaked into ${overrideLeak.join(', ')}`);
  if (problems.length) fail(`${label}: ${problems.join(' || ')}`);
  else
    pass(
      `${label}: dark in light and light in dark compute like the top-level themes (${flatten(facts['dark-in-light']).length} values each), overrides stay in their subtree`,
    );
}

await browser.close();
server.close();
if (failures.length) {
  console.error(`\n${failures.length} isolation failure(s).`);
  process.exit(1);
}
console.log('\nCSS isolation: all checks passed.');
