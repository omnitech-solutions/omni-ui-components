// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  componentGaps,
  exportedComponents,
  type LibraryLayout,
  layoutOf,
  overviewNames,
  reconcile,
  registeredWidgets,
  widgetGaps,
} from './componentParts';
import { KNOWN_COMPONENT_GAPS, KNOWN_WIDGET_GAPS } from './componentParts.allowlist';

const repository = layoutOf(path.resolve(import.meta.dirname, '../../../..'));

const HOW_TO_FIX =
  'Add the missing part (README, "The mandatory parts of every component"). Do not add a line to componentParts.allowlist.ts for a new component.';
const HOW_TO_PAY = 'This gap no longer exists: delete its line from componentParts.allowlist.ts.';

describe('every component of the public entry point has its mandatory parts', () => {
  it('derives the components from packages/core/src/index.ts, not from a list', () => {
    const components = exportedComponents(repository);
    expect(components.length).toBeGreaterThan(100);
    expect(components).toContain('Button');
    // Shared code (`lib`, `lib/chat`) is exported too, and is not a component.
    expect(components.every((name) => /^[A-Z]/.test(name))).toBe(true);
    expect(overviewNames(repository).size).toBeGreaterThan(100);
  });

  it('stories with a Default story, a Docs page, a play function when interactive, its factories in use, a test file, an overview row and a public export', () => {
    const { unlisted, paid, duplicated } = reconcile(
      componentGaps(repository),
      KNOWN_COMPONENT_GAPS,
    );
    expect({ [HOW_TO_FIX]: unlisted }).toEqual({ [HOW_TO_FIX]: [] });
    expect({ [HOW_TO_PAY]: paid }).toEqual({ [HOW_TO_PAY]: [] });
    expect(duplicated).toEqual([]);
  });
});

describe('every dynamic-form widget has its mandatory parts', () => {
  it('derives the widgets from the widgets folder and the appWidgets registry', () => {
    expect(registeredWidgets(repository).length).toBeGreaterThan(20);
    expect(registeredWidgets(repository)).toContain('TextWidget');
  });

  it('a registry entry, stories built by the shared builder with a Docs page, and a test that names it', () => {
    const { unlisted, paid, duplicated } = reconcile(widgetGaps(repository), KNOWN_WIDGET_GAPS);
    expect({ [HOW_TO_FIX]: unlisted }).toEqual({ [HOW_TO_FIX]: [] });
    expect({ [HOW_TO_PAY]: paid }).toEqual({ [HOW_TO_PAY]: [] });
    expect(duplicated).toEqual([]);
  });
});

describe('the allow-list', () => {
  it('dates every line and never lists a gap twice', () => {
    for (const gap of [...KNOWN_COMPONENT_GAPS, ...KNOWN_WIDGET_GAPS])
      expect(gap.since, `${gap.name}: ${gap.missing}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

/**
 * The tripwire itself, against a small library written to a temporary directory: one complete component, and
 * components and widgets that each lack one part.
 */
describe('the tripwire, on a fixture library', () => {
  let root: string;
  let fixture: LibraryLayout;

  const write = (file: string, content: string): void => {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  };
  const src = (file: string) => `packages/core/src/${file}`;
  const stories = (...names: string[]) =>
    `const meta = { title: 'x', tags: ['autodocs'] };\nexport default meta;\n${names
      .map((name) => `export const ${name} = {};`)
      .join('\n')}\n`;
  const component = (
    name: string,
    parts: { stories?: string; test?: boolean; source?: string; factories?: boolean },
  ) => {
    write(src(`${name}/${name}.tsx`), parts.source ?? `export const ${name} = () => null;\n`);
    write(src(`${name}/index.ts`), `export { ${name} } from './${name}';\n`);
    if (parts.stories) write(src(`${name}/${name}.stories.tsx`), parts.stories);
    if (parts.factories)
      write(src(`${name}/${name}.factories.tsx`), 'export const example = () => null;\n');
    if (parts.test)
      write(`packages/core/test/${name}/${name}.test.tsx`, "it('works', () => {});\n");
  };
  const interactive = (name: string) =>
    `export interface ${name}Props {\n  onSelect?: (item: string) => void;\n}\nexport const ${name} = () => null;\n`;
  const widget = (name: string, parts: { stories?: boolean | string; test?: boolean }) => {
    write(src(`dynamic-form/widgets/${name}/${name}.tsx`), `export const ${name} = () => null;\n`);
    write(src(`dynamic-form/widgets/${name}/index.ts`), `export { ${name} } from './${name}';\n`);
    if (parts.stories)
      write(
        src(`dynamic-form/widgets/${name}/${name}.stories.tsx`),
        typeof parts.stories === 'string'
          ? parts.stories
          : `${stories('Plain')}defineDynamicFormStories({});\n`,
      );
    if (parts.test)
      write(
        src(`dynamic-form/test/DynamicForm.${name}.test.tsx`),
        `describe('DynamicForm: ${name}', () => {});\n`,
      );
  };

  beforeAll(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'oui-tripwire-'));
    fixture = layoutOf(root);

    component('Complete', { stories: stories('Default', 'Small'), test: true });
    component('NoStory', { test: true });
    component('NoDefault', { stories: stories('Live'), test: true });
    component('NoDocsPage', { stories: 'export const Default = {};\n', test: true });
    component('NoTest', { stories: stories('Default') });
    component('NoOverviewRow', { stories: stories('Default'), test: true });
    component('OwnOverviewPage', { stories: stories('Default'), test: true });
    component('NotExported', { stories: stories('Default'), test: true });
    // Interactive (its source declares a callback prop): one with a `play` function, one without.
    component('Played', {
      source: interactive('Played'),
      stories: `${stories('Default')}export const Clicks = { play: async () => {} };\n`,
      test: true,
    });
    component('NoPlay', { source: interactive('NoPlay'), stories: stories('Default'), test: true });
    // A factories file: one whose stories are built from it, one whose stories ignore it.
    component('FromFactories', {
      factories: true,
      stories: `import { example } from './FromFactories.factories';\n${stories('Default')}`,
      test: true,
    });
    component('FactoriesUnused', { factories: true, stories: stories('Default'), test: true });
    // A folder of stories only (as `Theming` is) holds no component source, so it owes no export.
    write(src('StoriesOnly/StoriesOnly.stories.tsx'), stories('Default'));
    write(src('lib/index.ts'), 'export const helper = () => 1;\n');
    write(
      src('index.ts'),
      [
        'Complete',
        'NoStory',
        'NoDefault',
        'NoDocsPage',
        'NoTest',
        'NoOverviewRow',
        'OwnOverviewPage',
        'Played',
        'NoPlay',
        'FromFactories',
        'FactoriesUnused',
        'lib',
      ]
        .map((name) => `export * from './${name}';`)
        .join('\n'),
    );
    write(
      '.storybook/getting-started/ComponentOverview.stories.tsx',
      `const libraryRow = (name: string) => ({ name });
const SECTIONS = [
  { title: 'General', rows: [...['Complete', 'NoStory', 'NoDefault'].map(libraryRow), libraryRow('NoDocsPage')] },
  { title: 'Other', rows: [{ name: 'NoTest', preview: () => <div>NoOverviewRow</div> }, { name: 'NotExported' }] },
  { title: 'Checked', rows: ['Played', 'NoPlay', 'FromFactories', 'FactoriesUnused'].map(libraryRow) },
];
export default { title: 'Getting Started/Component Overview' };
export const ComponentOverview = { render: () => SECTIONS.length };
`,
    );
    write('.storybook/getting-started/OwnOverviewPageOverview.stories.tsx', stories('Overview'));

    widget('CompleteWidget', { stories: true, test: true });
    widget('NoStoryWidget', { test: true });
    widget('NoTestWidget', { stories: true });
    widget('UnregisteredWidget', { stories: true, test: true });
    widget('ImportedOnlyWidget', { stories: true, test: true });
    widget('HandBuiltWidget', { stories: stories('Plain'), test: true });
    write(
      src('dynamic-form/registries/widgets.ts'),
      `import { CompleteWidget } from '../widgets/CompleteWidget';
import { GoneWidget } from '../widgets/GoneWidget';
import { HandBuiltWidget } from '../widgets/HandBuiltWidget';
import { ImportedOnlyWidget } from '../widgets/ImportedOnlyWidget';
import { NoStoryWidget } from '../widgets/NoStoryWidget';
import { NoTestWidget } from '../widgets/NoTestWidget';
export const appWidgets = { complete: CompleteWidget, CompleteWidget, NoStoryWidget, noTest: NoTestWidget, gone: GoneWidget, HandBuiltWidget };
`,
    );
    write(src('dynamic-form/index.ts'), "export { appWidgets } from './registries/widgets';\n");
  });

  afterAll(() => fs.rmSync(root, { recursive: true, force: true }));

  it('lists only PascalCase folders of the public entry point as components', () => {
    expect(exportedComponents(fixture)).toEqual([
      'Complete',
      'FactoriesUnused',
      'FromFactories',
      'NoDefault',
      'NoDocsPage',
      'NoOverviewRow',
      'NoPlay',
      'NoStory',
      'NoTest',
      'OwnOverviewPage',
      'Played',
    ]);
  });

  it('fails a component that is missing a story, and names every other missing part', () => {
    const gaps = componentGaps(fixture);
    expect(gaps).toContainEqual({ name: 'NoStory', missing: 'stories' });
    expect(gaps).toEqual([
      // It has a factories file, and its stories import none.
      { name: 'FactoriesUnused', missing: 'story-factories' },
      { name: 'NoDefault', missing: 'default-story' },
      { name: 'NoDocsPage', missing: 'docs-page' },
      // Its name is only text inside another row's preview, which is not a row.
      { name: 'NoOverviewRow', missing: 'overview' },
      // Its source declares `onSelect`, and no story plays it. `Complete` declares no callback and owes none.
      { name: 'NoPlay', missing: 'play' },
      { name: 'NoStory', missing: 'stories' },
      { name: 'NoTest', missing: 'test' },
      { name: 'NotExported', missing: 'export' },
    ]);
  });

  it('fails a widget that is missing a story, a test or its registry entry', () => {
    expect(registeredWidgets(fixture)).toEqual([
      'CompleteWidget',
      'GoneWidget',
      'HandBuiltWidget',
      'NoStoryWidget',
      'NoTestWidget',
    ]);
    expect(widgetGaps(fixture)).toEqual([
      { name: 'GoneWidget', missing: 'registered' },
      // Its stories are written by hand, not by `defineDynamicFormStories`.
      { name: 'HandBuiltWidget', missing: 'story-builder' },
      { name: 'ImportedOnlyWidget', missing: 'registered' },
      { name: 'NoStoryWidget', missing: 'stories' },
      { name: 'NoTestWidget', missing: 'test' },
      { name: 'UnregisteredWidget', missing: 'registered' },
    ]);
  });

  it('fails every widget when the dynamic-form entry point stops exporting the registry', () => {
    const entry = path.join(fixture.src, 'dynamic-form', 'index.ts');
    const before = fs.readFileSync(entry, 'utf8');
    fs.writeFileSync(entry, 'export {};\n');
    try {
      expect(widgetGaps(fixture)).toContainEqual({ name: 'CompleteWidget', missing: 'registered' });
    } finally {
      fs.writeFileSync(entry, before);
    }
  });

  it('is green only when the allow-list is exactly the gaps: no unlisted gap, no paid line, no duplicate', () => {
    const gaps = componentGaps(fixture);
    const since = '2026-01-01';
    const exact = gaps.map((gap) => ({ ...gap, since }));
    expect(reconcile(gaps, exact)).toEqual({ unlisted: [], paid: [], duplicated: [] });

    // A new component without a story is not on the list: the tripwire fails.
    expect(
      reconcile(
        gaps,
        exact.filter((gap) => gap.name !== 'NoStory'),
      ).unlisted,
    ).toEqual(['NoStory: stories']);
    // A line whose debt is paid must be deleted: the tripwire fails until it is.
    expect(reconcile(gaps, [...exact, { name: 'Complete', missing: 'test', since }]).paid).toEqual([
      'Complete: test',
    ]);
    expect(reconcile(gaps, [...exact, exact[0]]).duplicated).toEqual([
      'FactoriesUnused: story-factories',
    ]);
  });
});
