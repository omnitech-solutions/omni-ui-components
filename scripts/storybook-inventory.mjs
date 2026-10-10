#!/usr/bin/env node
/**
 * Storybook inventory: loads every entry of a RUNNING Storybook through its iframe URL and records, per entry,
 * the load outcome, timings, console output, failed requests, accessibility violations (as the a11y addon
 * reports them), layout facts and a screenshot. Read-only against the server; it never starts or stops one.
 *
 *   node scripts/storybook-inventory.mjs                       every entry -> storybook-audit/inventory.json
 *   node scripts/storybook-inventory.mjs --only <id>,<id>      a subset, merged into the existing inventory.json
 *   node scripts/storybook-inventory.mjs --filter '^getting'   a subset by regular expression on the id
 *   node scripts/storybook-inventory.mjs --resume              only the entries not yet in inventory.json
 *   node scripts/storybook-inventory.mjs --profile <id>,<id>   cold load with a CPU profile -> profile-<id>.json
 *   node scripts/storybook-inventory.mjs --manager <id>,<id>   the manager UI (/?path=...) -> manager/<id>.png
 *   node scripts/storybook-inventory.mjs --sources             what every docs page shows behind "Show code" -> sources.json
 *   node scripts/storybook-inventory.mjs --a11y --theme light   every story's accessibility result, node by node -> a11y-<theme>.json
 *   node scripts/storybook-inventory.mjs --reclassify          re-derive ok/error/timeout in an existing inventory.json
 *
 * Options: --base http://localhost:6006  --out storybook-audit  --concurrency 4  --timeout 60000
 *          --no-narrow (skip the 400 px pass)  --no-shots (measure only)
 *
 * Output (gitignored): <out>/inventory.json, <out>/desktop/<id>.png, <out>/narrow/<id>.png,
 * <out>/full/<id>.png (overview pages), <out>/manager/<id>.png, <out>/profile-<id>.json.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};
const list = (name) =>
  option(name, '')
    .split(',')
    .map((each) => each.trim())
    .filter(Boolean);

const BASE = option('base', 'http://localhost:6006').replace(/\/$/, '');
const OUT = path.resolve(option('out', 'storybook-audit'));
const CONCURRENCY = Number(option('concurrency', '4'));
const TIMEOUT = Number(option('timeout', '60000'));
const DESKTOP = { width: 1280, height: 900 };
const NARROW = { width: 400, height: 900 };
const OVERVIEW = /^getting-started-/;
const CAP = 40;

/** Runs in the page before any script: long tasks, and the Storybook channel events that say what happened. */
const initScript = () => {
  const audit = { longTasks: [], events: [], a11y: null, errors: [] };
  window.__audit = audit;
  // The default buffer holds 250 entries; a dev preview requests several times that.
  performance.setResourceTimingBufferSize(20000);
  try {
    new PerformanceObserver((entries) => {
      for (const entry of entries.getEntries())
        audit.longTasks.push([Math.round(entry.startTime), Math.round(entry.duration)]);
    }).observe({ type: 'longtask', buffered: true });
  } catch {}
  const short = (value) => String(value ?? '').slice(0, 600);
  const attach = (channel) => {
    const on = (name, handler) => {
      try {
        channel.on(name, handler);
      } catch {}
    };
    for (const name of [
      'storyRendered',
      'docsRendered',
      'storyMissing',
      'storyErrored',
      'storyThrewException',
      'playFunctionThrewException',
      'unhandledErrorsWhilePlaying',
    ])
      on(name, (payload) => {
        audit.events.push([name, Math.round(performance.now())]);
        if (name !== 'storyRendered' && name !== 'docsRendered')
          audit.errors.push(
            `${name}: ${short(payload?.message ?? payload?.description ?? payload?.title ?? JSON.stringify(payload))}`,
          );
      });
    on('storyFinished', (payload) => {
      audit.events.push(['storyFinished', Math.round(performance.now())]);
      audit.status = payload?.status;
      const report = (payload?.reporters ?? []).find((each) => each.type === 'a11y');
      if (!report) return;
      const result = report.result ?? {};
      if (result.error) audit.errors.push(`a11y: ${short(result.error?.message ?? result.error)}`);
      // Every failing node with what the rule measured (the colour pair of a contrast failure): for --a11y.
      audit.a11yNodes = (result.violations ?? []).flatMap((each) =>
        (each.nodes ?? []).map((node) => {
          const check = [...(node.any ?? []), ...(node.all ?? []), ...(node.none ?? [])].find(
            (item) => item.data,
          );
          const data = check?.data ?? {};
          return {
            rule: each.id,
            impact: each.impact,
            target: short(node.target?.join(' ')).slice(0, 200),
            html: short(node.html).slice(0, 240),
            fg: data.fgColor,
            bg: data.bgColor,
            ratio: data.contrastRatio,
            expected: data.expectedContrastRatio,
            fontSize: data.fontSize,
            message: short(check?.message ?? node.failureSummary).slice(0, 200),
          };
        }),
      );
      audit.a11y = {
        status: report.status,
        violations: (result.violations ?? []).map((each) => ({
          id: each.id,
          impact: each.impact,
          nodes: each.nodes?.length ?? 0,
          target: short(each.nodes?.[0]?.target?.join(' ')),
        })),
        incomplete: (result.incomplete ?? []).length,
      };
    });
  };
  let held;
  try {
    Object.defineProperty(window, '__STORYBOOK_ADDONS_CHANNEL__', {
      configurable: true,
      get: () => held,
      set: (value) => {
        held = value;
        if (value) attach(value);
      },
    });
  } catch {}
};

/** Runs in the page once it has settled: what is on screen, as numbers. */
const collect = (viewMode) => {
  const audit = window.__audit ?? { longTasks: [], events: [], errors: [] };
  const root = document.querySelector(viewMode === 'docs' ? '#storybook-docs' : '#storybook-root');
  const rect = (element) => {
    if (!element) return null;
    const box = element.getBoundingClientRect();
    return [Math.round(box.x), Math.round(box.y), Math.round(box.width), Math.round(box.height)];
  };
  const content = root
    ? [...root.children].find((each) => !['STYLE', 'SCRIPT'].includes(each.tagName))
    : null;
  const buttons = [...document.querySelectorAll('button')].map((each) =>
    (each.textContent ?? '').trim(),
  );
  const count = (pattern) => buttons.filter((text) => pattern.test(text)).length;
  const anchors = [...document.querySelectorAll('a[href^="#"]')]
    .map((each) => each.getAttribute('href').slice(1))
    .filter((id) => id && !document.getElementById(decodeURIComponent(id)));
  const resources = performance.getEntriesByType('resource');
  const navigation = performance.getEntriesByType('navigation')[0];
  const sticky = [...document.querySelectorAll('nav[aria-label]')].map((nav) => {
    const blockers = [];
    for (let parent = nav.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX + style.overflowY))
        blockers.push(
          `${parent.tagName.toLowerCase()}${parent.id ? `#${parent.id}` : ''}.${String(parent.className).split(' ')[0]} overflow=${style.overflowX}/${style.overflowY}`,
        );
    }
    return {
      label: nav.getAttribute('aria-label'),
      position: getComputedStyle(nav).position,
      rect: rect(nav),
      parentRect: rect(nav.parentElement),
      blockers,
    };
  });
  return {
    bodyClass: document.body.className,
    errorMessage:
      document.body.classList.contains('sb-show-errordisplay') ||
      document.body.classList.contains('sb-show-nopreview')
        ? `${document.querySelector('#error-message')?.textContent ?? ''} ${document.querySelector('#error-stack')?.textContent ?? ''}`
            .trim()
            .slice(0, 800) || 'no preview'
        : null,
    domNodes: document.getElementsByTagName('*').length,
    textLength: (content?.innerText ?? root?.innerText ?? '').trim().length,
    media: root ? root.querySelectorAll('svg,img,canvas,input,button,textarea').length : 0,
    rootRect: rect(root),
    contentRect: rect(content),
    scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    showCode: {
      // `frame`: the shared ExampleFrame's code bar. `custom` and `docsBlock` are the two bars it replaced.
      frame: document.querySelectorAll('.pb-example-foot').length,
      frames: document.querySelectorAll('.pb-example, .pb-example-host').length,
      custom: document.querySelectorAll('.pb-showcode').length,
      docsBlock: document.querySelectorAll('.docblock-code-toggle').length,
      showButtons: count(/^show code$/i),
      hideButtons: count(/^hide code$/i),
      copyButtons: count(/^copy code$/i) + count(/^copy$/i),
      highlighted: document.querySelectorAll('pre[class*="language-"], pre.prismjs').length,
    },
    docs:
      viewMode === 'docs'
        ? {
            stories: document.querySelectorAll('.docs-story').length,
            iframes: document.querySelectorAll('iframe').length,
            headings: document.querySelectorAll('h1,h2,h3').length,
            argRows: document.querySelectorAll('.docblock-argstable tbody tr').length,
          }
        : undefined,
    brokenAnchors: [...new Set(anchors)].slice(0, 20),
    sticky: sticky.length ? sticky : undefined,
    requests: resources.length,
    transferKb: Math.round(
      resources.reduce((sum, each) => sum + (each.transferSize || 0), 0) / 1024,
    ),
    decodedKb: Math.round(
      resources.reduce((sum, each) => sum + (each.decodedBodySize || 0), 0) / 1024,
    ),
    domContentLoadedMs: navigation ? Math.round(navigation.domContentLoadedEventEnd) : null,
    longTaskCount: audit.longTasks.length,
    longTaskMs: audit.longTasks.reduce((sum, [, duration]) => sum + duration, 0),
    blockingMs: audit.longTasks.reduce((sum, [, duration]) => sum + Math.max(0, duration - 50), 0),
    longestTaskMs: audit.longTasks.reduce((max, [, duration]) => Math.max(max, duration), 0),
    // First and last of each lifecycle event (a docs page fires one pair a story it embeds).
    events: Object.fromEntries(
      [...new Set(audit.events.map(([name]) => name))].map((name) => {
        const times = audit.events.filter((each) => each[0] === name).map((each) => each[1]);
        return [name, { count: times.length, firstMs: times[0], lastMs: times.at(-1) }];
      }),
    ),
    status: audit.status ?? null,
    a11y: audit.a11y ?? null,
    channelErrors: audit.errors,
  };
};

/**
 * ok / error / timeout. An accessibility failure is a finding (`flags: ['a11y']`), not a load error: the a11y
 * addon ends the story with status "error" when `parameters.a11y.test` is "error", so that status alone is not
 * used. An error is the preview's error display, a story or play function that threw, or a missing story.
 */
function classify(record) {
  if (record.outcome === 'timeout') return record;
  const threw = (record.channelErrors ?? []).filter((each) => !each.startsWith('a11y:'));
  const finishedBadly = record.status === 'error' && record.a11y?.status !== 'failed';
  record.outcome = record.errorMessage || threw.length || finishedBadly ? 'error' : 'ok';
  return record;
}

const iframeUrl = (entry) =>
  `${BASE}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=${entry.type === 'docs' ? 'docs' : 'story'}`;

/** True once the preview shows the entry, or an error in its place. */
const shown = (viewMode) => {
  if (!document.body) return false;
  const body = document.body.classList;
  if (body.contains('sb-show-errordisplay') || body.contains('sb-show-nopreview')) return 'error';
  const root = document.querySelector(viewMode === 'docs' ? '#storybook-docs' : '#storybook-root');
  if (!root || root.hidden) return false;
  if (!body.contains('sb-show-main')) return false;
  const content = [...root.children].find((each) => !['STYLE', 'SCRIPT'].includes(each.tagName));
  // A story that draws only into a portal (a dialog, a floating button) leaves the root empty: its
  // storyRendered event is then the sign that it is shown.
  const rendered = window.__audit?.events.some(([name]) => name === 'storyRendered');
  return content || (viewMode === 'story' && rendered) ? 'ok' : false;
};

const listen = (page, record) => {
  const push = (bucket, text) => {
    if (record[bucket].length < CAP) record[bucket].push(String(text).slice(0, 600));
    else record.truncated = true;
  };
  page.on('console', (message) => {
    if (message.type() === 'error') push('consoleErrors', message.text());
    else if (message.type() === 'warning') push('consoleWarnings', message.text());
  });
  page.on('pageerror', (error) => push('pageErrors', error.message));
  page.on('requestfailed', (request) => {
    const reason = request.failure()?.errorText ?? '';
    if (!record.closing && reason !== 'net::ERR_ABORTED')
      push('failedRequests', `${reason} ${request.url().replace(BASE, '')}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400)
      push('failedRequests', `${response.status()} ${response.url().replace(BASE, '')}`);
  });
};

const blank = () => ({
  consoleErrors: [],
  consoleWarnings: [],
  pageErrors: [],
  failedRequests: [],
});

async function settle(page, viewMode, deadline) {
  // The story's own lifecycle ends with storyFinished (after any play function and the a11y run); docs pages
  // have no such end, so they wait for the network and the main thread to go quiet.
  const left = () => Math.max(500, deadline - Date.now());
  if (viewMode === 'story')
    await page
      .waitForFunction(
        () =>
          window.__audit?.events.some(([name]) =>
            ['storyFinished', 'storyErrored', 'storyThrewException', 'storyMissing'].includes(name),
          ),
        null,
        { timeout: Math.min(left(), 30000), polling: 100 },
      )
      .catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: Math.min(left(), 8000) }).catch(() => {});
  await page
    .waitForFunction(
      () => {
        const last = window.__audit?.longTasks.at(-1);
        return !last || performance.now() - (last[0] + last[1]) > 400;
      },
      null,
      { timeout: Math.min(left(), 20000), polling: 200 },
    )
    .catch(() => {});
}

async function visit(context, entry, { sampleNarrow, shots, narrow }) {
  const viewMode = entry.type === 'docs' ? 'docs' : 'story';
  const record = {
    id: entry.id,
    title: entry.title,
    name: entry.name,
    type: entry.type,
    importPath: entry.importPath,
    tags: entry.tags,
    url: iframeUrl(entry),
    ...blank(),
  };
  const page = await context.newPage();
  listen(page, record);
  // One-minute load average of the machine: a timing taken while it is far above the core count is not comparable.
  record.loadAverage = Math.round(os.loadavg()[0] * 10) / 10;
  const started = Date.now();
  const deadline = started + TIMEOUT;
  try {
    await page.goto(record.url, { waitUntil: 'commit', timeout: TIMEOUT });
    const handle = await page.waitForFunction(shown, viewMode, {
      timeout: Math.max(1000, deadline - Date.now()),
      polling: 50,
    });
    record.contentMs = Date.now() - started;
    record.outcome = (await handle.jsonValue()) === 'error' ? 'error' : 'ok';
    await settle(page, viewMode, started + TIMEOUT + 30000);
    record.settledMs = Date.now() - started;
  } catch (error) {
    record.outcome = /Timeout/i.test(error.message) ? 'timeout' : 'error';
    record.failure = error.message.split('\n')[0].slice(0, 300);
    record.contentMs = null;
  }
  try {
    Object.assign(record, await page.evaluate(collect, viewMode));
    classify(record);
    const flags = [];
    if (record.outcome === 'ok' && record.textLength === 0 && record.media === 0)
      flags.push('blank');
    if (record.outcome === 'ok' && record.contentRect && record.contentRect[3] < 4)
      flags.push('zero-height');
    if (record.scroll && record.scroll[0] > DESKTOP.width + 8) flags.push('overflow-desktop');
    if (record.brokenAnchors?.length) flags.push('broken-anchors');
    if (record.a11y?.violations.length) flags.push('a11y');
    if (record.pageErrors.length) flags.push('page-error');
    if (record.consoleErrors.length) flags.push('console-error');
    if (shots) {
      await mkdir(path.join(OUT, 'desktop'), { recursive: true });
      await page.screenshot({ path: path.join(OUT, 'desktop', `${entry.id}.png`) });
      record.screenshot = `desktop/${entry.id}.png`;
      if (OVERVIEW.test(entry.id)) {
        await mkdir(path.join(OUT, 'full'), { recursive: true });
        await page
          .screenshot({ path: path.join(OUT, 'full', `${entry.id}.png`), fullPage: true })
          .then(() => {
            record.fullScreenshot = `full/${entry.id}.png`;
          })
          .catch((error) => {
            record.fullScreenshotError = error.message.slice(0, 200);
          });
      }
    }
    if (narrow && record.outcome !== 'timeout') {
      await page.setViewportSize(NARROW);
      await page.waitForTimeout(300);
      const width = await page.evaluate(() => {
        const page = document.documentElement.scrollWidth;
        const widest = [...document.querySelectorAll('#storybook-root *, #storybook-docs *')]
          .map((each) => [each, each.getBoundingClientRect().right])
          .sort((a, b) => b[1] - a[1])[0];
        return {
          page,
          widest: widest
            ? `${widest[0].tagName.toLowerCase()}.${String(widest[0].className).slice(0, 60)} right=${Math.round(widest[1])}`
            : null,
        };
      });
      record.narrowScrollWidth = width.page;
      record.narrowWidest = width.widest;
      if (width.page > NARROW.width + 8) flags.push('overflow-narrow');
      if (shots && (sampleNarrow || width.page > NARROW.width + 8 || flags.includes('blank'))) {
        await mkdir(path.join(OUT, 'narrow'), { recursive: true });
        await page.screenshot({ path: path.join(OUT, 'narrow', `${entry.id}.png`) });
        record.narrowScreenshot = `narrow/${entry.id}.png`;
      }
    }
    record.flags = flags;
  } catch (error) {
    record.collectError = error.message.split('\n')[0].slice(0, 300);
  }
  record.closing = true;
  await page.close().catch(() => {});
  delete record.closing;
  return record;
}

/** Every tenth-or-so docs page and story, plus both overview pages: the narrow-width sample. */
function narrowSample(entries) {
  const pick = (items, wanted) => {
    const step = Math.max(1, Math.floor(items.length / wanted));
    return items.filter((_, index) => index % step === 0).slice(0, wanted);
  };
  const docs = entries.filter((each) => each.type === 'docs');
  const stories = entries.filter((each) => each.type === 'story' && !OVERVIEW.test(each.id));
  return new Set([
    ...entries.filter((each) => OVERVIEW.test(each.id)).map((each) => each.id),
    ...pick(docs, 10).map((each) => each.id),
    ...pick(stories, 10).map((each) => each.id),
  ]);
}

async function pool(items, size, work) {
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (next < items.length) {
        const index = next++;
        await work(items[index], index);
      }
    }),
  );
}

async function inventory(browser, entries) {
  const only = new Set(list('only'));
  const filter = option('filter', '');
  const pattern = filter ? new RegExp(filter) : null;
  const sample = narrowSample(entries);
  const file = path.join(OUT, 'inventory.json');
  // A subset run, or --resume after an interrupted one, is merged into what is already saved.
  const merge = only.size || pattern || flag('resume');
  const previous = merge ? await readFile(file, 'utf8').then(JSON.parse, () => null) : null;
  const byId = new Map((previous?.entries ?? []).map((each) => [each.id, each]));
  const chosen = entries.filter(
    (each) =>
      (!only.size || only.has(each.id)) &&
      (!pattern || pattern.test(each.id)) &&
      !(flag('resume') && byId.has(each.id)),
  );
  const context = await browser.newContext({
    viewport: DESKTOP,
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(initScript);
  const startedAt = new Date().toISOString();
  let done = 0;
  const save = () =>
    writeFile(
      file,
      `${JSON.stringify(
        {
          base: BASE,
          startedAt,
          finishedAt: new Date().toISOString(),
          concurrency: CONCURRENCY,
          timeoutMs: TIMEOUT,
          viewport: DESKTOP,
          narrowViewport: NARROW,
          total: entries.length,
          entries: entries.map((each) => byId.get(each.id)).filter(Boolean),
        },
        null,
        1,
      )}\n`,
    );
  await pool(chosen, CONCURRENCY, async (entry, index) => {
    const record = await visit(context, entry, {
      sampleNarrow: sample.has(entry.id),
      shots: !flag('no-shots'),
      narrow: !flag('no-narrow'),
    });
    record.order = index;
    byId.set(entry.id, record);
    done += 1;
    if (record.outcome !== 'ok' || done % 25 === 0)
      console.log(
        `[${done}/${chosen.length}] ${record.outcome} ${record.contentMs ?? '-'}ms ${entry.id}`,
      );
    if (done % 50 === 0) await save();
  });
  await save();
  await context.close();
  const all = [...byId.values()];
  const tally = (outcome) => all.filter((each) => each.outcome === outcome).length;
  console.log(
    `entries ${all.length}: ok ${tally('ok')}, error ${tally('error')}, timeout ${tally('timeout')} -> ${file}`,
  );
}

/** A cold load in a fresh browser context with the sampling CPU profiler on: where the time goes. */
async function profile(browser, entries) {
  for (const id of list('profile')) {
    const entry = entries.find((each) => each.id === id);
    if (!entry) {
      console.log(`unknown id ${id}`);
      continue;
    }
    const viewMode = entry.type === 'docs' ? 'docs' : 'story';
    const context = await browser.newContext({ viewport: DESKTOP, colorScheme: 'dark' });
    await context.addInitScript(initScript);
    const page = await context.newPage();
    const record = { id, url: iframeUrl(entry), ...blank() };
    listen(page, record);
    const cdp = await context.newCDPSession(page);
    await cdp.send('Profiler.enable');
    await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
    await cdp.send('Profiler.start');
    const started = Date.now();
    try {
      await page.goto(record.url, { waitUntil: 'commit', timeout: 180000 });
      await page.waitForFunction(shown, viewMode, { timeout: 180000, polling: 50 });
      record.contentMs = Date.now() - started;
      await settle(page, viewMode, started + 240000);
      record.settledMs = Date.now() - started;
    } catch (error) {
      record.failure = error.message.split('\n')[0];
    }
    const { profile: cpu } = await cdp.send('Profiler.stop');
    const self = new Map();
    const byModule = new Map();
    const total = cpu.timeDeltas.reduce((sum, delta) => sum + delta, 0) / 1000;
    const nodes = new Map(cpu.nodes.map((node) => [node.id, node]));
    cpu.samples.forEach((nodeId, index) => {
      const node = nodes.get(nodeId);
      const frame = node.callFrame;
      const module = (frame.url || '(native)')
        .replace(BASE, '')
        .replace(/\?.*$/, '')
        .replace(/^.*node_modules\/\.cache\/storybook\/[^/]+\/sb-vite\/deps\//, 'deps/');
      const key = `${frame.functionName || '(anonymous)'} @ ${module}:${frame.lineNumber}`;
      const ms = (cpu.timeDeltas[index] ?? 0) / 1000;
      self.set(key, (self.get(key) ?? 0) + ms);
      byModule.set(module, (byModule.get(module) ?? 0) + ms);
    });
    const top = (map, size) =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, size)
        .map(([key, ms]) => [Math.round(ms), key]);
    const metrics = await page.evaluate(collect, viewMode).catch(() => null);
    const requests = await page
      .evaluate(() => {
        const all = performance.getEntriesByType('resource');
        const kind = (name) =>
          /\/node_modules\/|sb-vite\/deps|\/deps\//.test(name)
            ? 'dependency'
            : /\.stories\.|\.factories\.|\.storybook\//.test(name)
              ? 'story-or-factory'
              : /\/packages\//.test(name)
                ? 'library-source'
                : 'other';
        const groups = {};
        for (const each of all) {
          const name = kind(each.name);
          groups[name] ??= { count: 0, decodedKb: 0 };
          const group = groups[name];
          group.count += 1;
          group.decodedKb += Math.round((each.decodedBodySize || 0) / 1024);
        }
        const slowest = all
          .map((each) => [Math.round(each.duration), each.name.replace(location.origin, '')])
          .sort((a, b) => b[0] - a[0])
          .slice(0, 15);
        const lastEnd = Math.round(Math.max(0, ...all.map((each) => each.responseEnd)));
        return { groups, slowest, lastResponseEndMs: lastEnd };
      })
      .catch(() => null);
    await mkdir(OUT, { recursive: true });
    const file = path.join(OUT, `profile-${id}.json`);
    await writeFile(
      file,
      `${JSON.stringify(
        {
          ...record,
          cpuSampledMs: Math.round(total),
          idleMs: Math.round(self.get('(idle) @ (native):-1') ?? 0),
          topFunctions: top(self, 45),
          topModules: top(byModule, 30),
          requests,
          metrics,
        },
        null,
        1,
      )}\n`,
    );
    console.log(
      `${id}: content ${record.contentMs}ms, settled ${record.settledMs}ms, requests ${metrics?.requests}, long tasks ${metrics?.longTaskMs}ms -> ${file}`,
    );
    await context.close();
  }
}

/** The manager UI for an entry: sidebar, toolbar and the preview iframe, as the owner sees it. */
async function manager(browser, entries) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });
  await mkdir(path.join(OUT, 'manager'), { recursive: true });
  const results = [];
  for (const id of list('manager')) {
    const entry = entries.find((each) => each.id === id);
    if (!entry) continue;
    const viewMode = entry.type === 'docs' ? 'docs' : 'story';
    const page = await context.newPage();
    const started = Date.now();
    const result = { id, url: `${BASE}/?path=/${viewMode}/${id}` };
    try {
      await page.goto(result.url, { waitUntil: 'commit', timeout: 180000 });
      const frame = page.frameLocator('#storybook-preview-iframe');
      await frame
        .locator(viewMode === 'docs' ? '#storybook-docs > *' : '#storybook-root > :not(style)')
        .first()
        .waitFor({ state: 'attached', timeout: 180000 });
      result.contentMs = Date.now() - started;
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(1500);
      result.spinnerVisible = await page
        .locator('[aria-label="Content is loading..."], [class*="loader"]')
        .first()
        .isVisible()
        .catch(() => false);
    } catch (error) {
      result.failure = error.message.split('\n')[0];
    }
    await page.screenshot({ path: path.join(OUT, 'manager', `${id}.png`) });
    result.screenshot = `manager/${id}.png`;
    results.push(result);
    console.log(JSON.stringify(result));
    await page.close();
  }
  await writeFile(path.join(OUT, 'manager.json'), `${JSON.stringify(results, null, 1)}\n`);
  await context.close();
}

/** What each docs page shows behind "Show code", so shown code can be compared with what is rendered. */
async function sources(browser, entries) {
  const only = new Set(list('only'));
  const docs = entries.filter((each) => each.type === 'docs' && (!only.size || only.has(each.id)));
  const context = await browser.newContext({ viewport: DESKTOP, colorScheme: 'dark' });
  const results = [];
  await pool(docs, CONCURRENCY, async (entry) => {
    const page = await context.newPage();
    const result = { id: entry.id, title: entry.title };
    try {
      await page.goto(iframeUrl(entry), { waitUntil: 'commit', timeout: TIMEOUT });
      await page.waitForFunction(shown, 'docs', { timeout: TIMEOUT, polling: 50 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(500);
      Object.assign(
        result,
        await page.evaluate(async () => {
          // A docs page mounts a story when it comes near the window: walk the page once so every one is there.
          for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
          window.scrollTo(0, 0);
          await new Promise((resolve) => setTimeout(resolve, 600));
          // The shared ExampleFrame: one "Show code" a story. Storybook's own bar is read too, should one remain.
          const own = [
            ...document.querySelectorAll('.pb-example .pb-example-action[aria-expanded="false"]'),
          ];
          const legacy = [...document.querySelectorAll('.docblock-code-toggle')];
          const toggles = [...own, ...legacy];
          const disabled = legacy.filter((each) => each.disabled).length;
          for (const toggle of toggles) if (!toggle.disabled) toggle.click();
          // The first open loads the formatter and the highlighter.
          await new Promise((resolve) => setTimeout(resolve, 2500));
          const blocks = [...document.querySelectorAll('.pb-example, .sbdocs-preview')].map(
            (preview) => {
              const story = preview.querySelector('[data-story-block]');
              const code =
                preview.querySelector('.pb-example-code pre, .docblock-source pre')?.textContent ??
                null;
              const rendered = (story?.innerText ?? '').replace(/\s+/g, ' ').trim();
              return {
                story: story?.id ?? null,
                code: code?.slice(0, 1500) ?? null,
                codeLength: code?.length ?? 0,
                renderedText: rendered.slice(0, 160),
                reactElementJson: /\$\$typeof|"_owner"|"props":/.test(code ?? ''),
                childrenAsAttribute: /\bchildren=/.test(code ?? ''),
                placeholderHandler: /=\{\(\) => \{\}\}/.test(code ?? ''),
                bareTag: /^<[\w.]+\s*\/>$/.test((code ?? '').replace(/\s+/g, ' ').trim()),
                unnamedComponent:
                  /^<(Component|React\.Memo|React\.ForwardRef|No Display Name)\b/.test(code ?? ''),
                storyObject: /^\{\s*(render|args|name|parameters|play|decorators)\b/.test(
                  code ?? '',
                ),
                noBar: !preview.querySelector('.pb-example-foot, .docblock-code-toggle'),
              };
            },
          );
          return { toggles: toggles.length, noCodeAvailable: disabled, blocks };
        }),
      );
    } catch (error) {
      result.failure = error.message.split('\n')[0];
    }
    results.push(result);
    await page.close();
  });
  await context.close();
  results.sort((a, b) => a.id.localeCompare(b.id));
  const file = path.join(OUT, 'sources.json');
  await writeFile(file, `${JSON.stringify(results, null, 1)}\n`);
  const blocks = results.flatMap((each) => each.blocks ?? []);
  const tally = (key) => blocks.filter((each) => each[key]).length;
  console.log(
    `docs pages ${results.length}, blocks ${blocks.length}: unnamedComponent ${tally('unnamedComponent')}, reactElementJson ${tally('reactElementJson')}, childrenAsAttribute ${tally('childrenAsAttribute')}, bareTag ${tally('bareTag')}, storyObject ${tally('storyObject')}, noBar ${tally('noBar')}, noCode ${blocks.filter((each) => !each.code).length}, placeholderHandler ${tally('placeholderHandler')}, failed ${results.filter((each) => each.failure).length} -> ${file}`,
  );
}

/**
 * Every story's accessibility result in one theme, node by node: -> a11y-<theme>.json, with the failing nodes
 * counted a rule and, for colour contrast, a colour pair (foreground on background), most frequent first.
 */
async function a11y(browser, entries) {
  const theme = option('theme', 'dark');
  const only = new Set(list('only'));
  const filter = option('filter', '');
  const pattern = filter ? new RegExp(filter) : null;
  const stories = entries.filter(
    (each) =>
      each.type === 'story' &&
      (!only.size || only.has(each.id)) &&
      (!pattern || pattern.test(each.id)),
  );
  const context = await browser.newContext({
    viewport: DESKTOP,
    colorScheme: theme === 'light' ? 'light' : 'dark',
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await context.addInitScript(initScript);
  const results = [];
  let done = 0;
  await pool(stories, CONCURRENCY, async (entry) => {
    const page = await context.newPage();
    const result = { id: entry.id, title: entry.title, name: entry.name };
    try {
      await page.goto(`${iframeUrl(entry)}&globals=theme:${theme}`, {
        waitUntil: 'commit',
        timeout: TIMEOUT,
      });
      await page.waitForFunction(
        () =>
          window.__audit?.events.some(([name]) =>
            ['storyFinished', 'storyErrored', 'storyThrewException', 'storyMissing'].includes(name),
          ),
        null,
        { timeout: TIMEOUT, polling: 100 },
      );
      const audit = await page.evaluate(() => ({
        status: window.__audit.a11y?.status ?? null,
        nodes: window.__audit.a11yNodes ?? [],
        ran: Boolean(window.__audit.a11y),
      }));
      Object.assign(result, audit);
    } catch (error) {
      result.failure = error.message.split('\n')[0].slice(0, 200);
    }
    results.push(result);
    done += 1;
    if (done % 100 === 0) console.log(`[${done}/${stories.length}]`);
    await page.close().catch(() => {});
  });
  await context.close();
  results.sort((a, b) => a.id.localeCompare(b.id));
  const nodes = results.flatMap((each) =>
    (each.nodes ?? []).map((node) => ({ ...node, id: each.id })),
  );
  const count = (items, key) => {
    const tally = new Map();
    for (const item of items) {
      const name = key(item);
      const entry = tally.get(name) ?? { nodes: 0, stories: new Set() };
      entry.nodes += 1;
      entry.stories.add(item.id);
      tally.set(name, entry);
    }
    return [...tally.entries()]
      .map(([name, entry]) => ({ name, nodes: entry.nodes, stories: entry.stories.size }))
      .sort((a, b) => b.nodes - a.nodes);
  };
  const summary = {
    theme,
    stories: results.length,
    failed: results.filter((each) => each.failure).length,
    notRun: results.filter((each) => !each.failure && !each.ran).length,
    storiesWithViolations: results.filter((each) => each.nodes?.length).length,
    rules: count(nodes, (node) => node.rule),
    contrastPairs: count(
      nodes.filter((node) => node.rule === 'color-contrast'),
      (node) => `${node.fg} on ${node.bg} (${node.ratio}, needs ${node.expected})`,
    ).slice(0, 60),
  };
  const file = path.join(OUT, `a11y-${theme}.json`);
  await writeFile(file, `${JSON.stringify({ summary, results }, null, 1)}\n`);
  console.log(
    `${theme}: stories ${summary.stories}, with violations ${summary.storiesWithViolations}, failed to load ${summary.failed}, not run ${summary.notRun}`,
  );
  for (const rule of summary.rules)
    console.log(`  ${rule.name}: ${rule.stories} stories, ${rule.nodes} nodes`);
  console.log(`-> ${file}`);
}

if (flag('reclassify')) {
  const file = path.join(OUT, 'inventory.json');
  const saved = JSON.parse(await readFile(file, 'utf8'));
  saved.entries.forEach(classify);
  await writeFile(file, `${JSON.stringify(saved, null, 1)}\n`);
  process.exit(0);
}

const index = await fetch(`${BASE}/index.json`).then((response) => response.json());
const entries = Object.values(index.entries);
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
try {
  if (list('profile').length) await profile(browser, entries);
  else if (list('manager').length) await manager(browser, entries);
  else if (flag('sources')) await sources(browser, entries);
  else if (flag('a11y')) await a11y(browser, entries);
  else await inventory(browser, entries);
} finally {
  await browser.close();
}
