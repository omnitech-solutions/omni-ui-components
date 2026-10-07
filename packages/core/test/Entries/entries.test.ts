// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';
import type { OutputChunk, RollupOutput } from 'rollup';

// Builds a scratch consumer (packages/core/fixtures/consumer) against the *published shape* of the package: the
// fixture imports `@oc-tech/omni-ui-components/<entry>`, which resolves through `exports` and `dist/`, not through a vitest alias.
const core = resolve(import.meta.dirname, '../..');
const fixtures = resolve(core, 'fixtures/consumer');
const link = resolve(fixtures, 'node_modules/@oc-tech/omni-ui-components');

interface Weight {
  modules: string[];
  bytes: number;
  gzip: number;
}

async function bundle(entry: string): Promise<Weight> {
  const result = (await build({
    configFile: false,
    root: fixtures,
    logLevel: 'silent',
    build: { write: false, minify: true, sourcemap: false, rollupOptions: { input: resolve(fixtures, entry) } },
  })) as RollupOutput | RollupOutput[];
  const chunks = (Array.isArray(result) ? result.flatMap((r) => r.output) : result.output).filter((o): o is OutputChunk => o.type === 'chunk');
  const modules = chunks.flatMap((chunk) => Object.keys(chunk.modules));
  const code = chunks.map((chunk) => chunk.code).join('\n');
  const weight = { modules, bytes: Buffer.byteLength(code), gzip: gzipSync(code).length };
  // `BUNDLE_WEIGHT=1 pnpm exec vitest run ... test/Entries` prints the numbers recorded in bionic/research/references/bundle-weight.md.
  if (process.env.BUNDLE_WEIGHT) console.info(`bundle-weight ${entry}: ${weight.bytes} B minified, ${weight.gzip} B gzip, ${modules.length} modules`);
  return weight;
}

const includes = (weight: Weight, pkg: string) => weight.modules.some((id) => id.includes(`/node_modules/${pkg}/`));

describe('consumer entry points', () => {
  beforeAll(() => {
    if (!existsSync(resolve(core, 'dist/native.js')) || !existsSync(resolve(core, 'dist-types/entries/native.d.ts'))) {
      execFileSync('pnpm', ['build'], { cwd: core, stdio: 'ignore' });
    }
    rmSync(resolve(fixtures, 'node_modules'), { recursive: true, force: true });
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(core, link, 'dir');
  }, 300_000);

  afterAll(() => {
    rmSync(resolve(fixtures, 'node_modules'), { recursive: true, force: true });
  });

  it('./native bundles neither lowlight nor react-markdown', async () => {
    const weight = await bundle('native.tsx');
    expect(weight.modules.length).toBeGreaterThan(0);
    for (const pkg of ['lowlight', 'highlight.js', 'react-markdown', 'remark-gfm', 'diff']) expect(includes(weight, pkg), pkg).toBe(false);
  }, 120_000);

  it('./chat bundles the markdown renderer, and lowlight only when ./highlight is imported too', async () => {
    const plain = await bundle('chat-plain.tsx');
    expect(includes(plain, 'react-markdown')).toBe(true);
    expect(includes(plain, 'lowlight')).toBe(false);
    const full = await bundle('chat.tsx');
    expect(includes(full, 'react-markdown')).toBe(true);
    expect(includes(full, 'lowlight')).toBe(true);
  }, 120_000);

  it('./highlight bundles lowlight but not react-markdown', async () => {
    const weight = await bundle('highlight.ts');
    expect(includes(weight, 'lowlight')).toBe(true);
    expect(includes(weight, 'react-markdown')).toBe(false);
  }, 120_000);

  it('the native bundle is lighter than the chat bundle', async () => {
    const [native, chat] = await Promise.all([bundle('native.tsx'), bundle('chat.tsx')]);
    expect(native.gzip).toBeLessThan(chat.gzip);
  }, 120_000);

  it('every entry type-checks from a consumer', () => {
    const tsc = resolve(core, '../../node_modules/typescript/bin/tsc');
    let output = '';
    try {
      execFileSync('node', [tsc, '-p', resolve(fixtures, 'tsconfig.json')], { cwd: fixtures, stdio: 'pipe' });
    } catch (error) {
      output = String((error as { stdout?: Buffer }).stdout ?? error);
    }
    expect(output).toBe('');
  }, 120_000);
});
