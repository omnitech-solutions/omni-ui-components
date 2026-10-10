import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

/**
 * The tripwire behind `componentParts.test.ts`: which mandatory part is each component, and each dynamic-form
 * widget, missing. It reads files only (no component is imported), so it can be pointed at any tree laid out like
 * this repository: the test of the tripwire itself points it at a small tree it writes to a temporary directory.
 *
 * The list of components is not kept by hand. A component is a PascalCase folder that the public entry point
 * (`packages/core/src/index.ts`) re-exports; a widget is a folder under `dynamic-form/widgets` or a widget the
 * registry (`dynamic-form/registries/widgets.ts`, exported as `appWidgets`) imports. The README section
 * "The mandatory parts of every component" states the rules in words.
 */

/** What a component can be missing. */
export type ComponentPart =
  /** No `<Name>/**\/*.stories.tsx`. */
  | 'stories'
  /** Stories exist, but none is the `Default` story. */
  | 'default-story'
  /** Stories exist, but no meta carries `tags: ['autodocs']`, so the component has no Docs page. */
  | 'docs-page'
  /** No `packages/core/test/<Name>/**\/*.test.ts(x)`. */
  | 'test'
  /** Not a row of `Getting Started/Component Overview` and no overview page of its own. */
  | 'overview'
  /** A component folder (it holds component source) that the public entry point does not re-export. */
  | 'export';

/** What a dynamic-form widget can be missing. */
export type WidgetPart =
  /** No `widgets/<Name>/*.stories.tsx` with at least one story. */
  | 'stories'
  /** Stories exist, but no meta carries `tags: ['autodocs']`. */
  | 'docs-page'
  /** No test file under `dynamic-form` names the widget. */
  | 'test'
  /** Its folder is not a value of `appWidgets`, or `appWidgets` imports a widget that has no folder. */
  | 'registered';

export interface Gap<Part extends string = ComponentPart | WidgetPart> {
  /** The component or widget folder name. */
  name: string;
  missing: Part;
}

/** One line of an allow-list: a gap that exists today, written down so the suite is green and the debt is visible. */
export interface KnownGap<Part extends string = ComponentPart | WidgetPart> extends Gap<Part> {
  /** The date the component or widget was first committed (`git log --diff-filter=A`), `YYYY-MM-DD`. */
  since: string;
  /** Anything a reader needs to pay the debt. */
  note?: string;
}

export interface LibraryLayout {
  /** `packages/core/src`. */
  src: string;
  /** `packages/core/test`. */
  test: string;
  /** `.storybook/getting-started`: the overview stories. */
  overviews: string;
}

/** The layout of this repository, from its root. */
export const layoutOf = (root: string): LibraryLayout => ({
  src: path.join(root, 'packages', 'core', 'src'),
  test: path.join(root, 'packages', 'core', 'test'),
  overviews: path.join(root, '.storybook', 'getting-started'),
});

const PASCAL = /^[A-Z][A-Za-z0-9]*$/;
const STORY_FILE = /\.stories\.tsx?$/;
const TEST_FILE = /\.test\.tsx?$/;
/** Files that are examples or tests of a component, not the component. */
const NOT_SOURCE = /\.(stories|factories|fixtures|test)\.tsx?$/;
const AUTODOCS = /tags:\s*\[[^\]]*['"]autodocs['"]/;
const STORY_EXPORT = /^export const ([A-Z][A-Za-z0-9]*)\b/gm;

const read = (file: string): string => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '');

const walk = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((entry) =>
          entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)],
        )
    : [];

const folders = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];

const parse = (file: string): ts.SourceFile =>
  ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

/** Every module the file re-exports (`export * from './X'`, `export { A } from './X'`), as written. */
export function reExportedModules(file: string): string[] {
  return parse(file).statements.flatMap((statement) =>
    ts.isExportDeclaration(statement) &&
    statement.moduleSpecifier &&
    ts.isStringLiteral(statement.moduleSpecifier)
      ? [statement.moduleSpecifier.text]
      : [],
  );
}

/** The components of the library: the PascalCase folders the public entry point re-exports. */
export function exportedComponents(layout: LibraryLayout): string[] {
  return reExportedModules(path.join(layout.src, 'index.ts'))
    .map((specifier) => specifier.replace(/^\.\//, ''))
    .filter((name) => PASCAL.test(name))
    .sort();
}

/** The names the Component Overview lists: every string in its `SECTIONS`, where a row is named. */
export function overviewNames(layout: LibraryLayout): Set<string> {
  const names = new Set<string>();
  const collect = (node: ts.Node): void => {
    if (ts.isStringLiteralLike(node)) names.add(node.text);
    ts.forEachChild(node, collect);
  };
  const find = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && node.name.getText() === 'SECTIONS' && node.initializer)
      collect(node.initializer);
    else ts.forEachChild(node, find);
  };
  find(parse(path.join(layout.overviews, 'ComponentOverview.stories.tsx')));
  return names;
}

const storyNames = (source: string): string[] =>
  [...source.matchAll(STORY_EXPORT)].map((match) => match[1]);

/** Every mandatory part a component of the public entry point is missing, sorted by name. */
export function componentGaps(layout: LibraryLayout): Gap<ComponentPart>[] {
  const listed = overviewNames(layout);
  const exported = exportedComponents(layout);
  const gaps: Gap<ComponentPart>[] = [];

  for (const name of exported) {
    const stories = walk(path.join(layout.src, name))
      .filter((file) => STORY_FILE.test(file))
      .map(read);
    if (stories.every((source) => storyNames(source).length === 0)) {
      gaps.push({ name, missing: 'stories' });
    } else {
      if (!stories.some((source) => storyNames(source).includes('Default')))
        gaps.push({ name, missing: 'default-story' });
      if (!stories.some((source) => AUTODOCS.test(source)))
        gaps.push({ name, missing: 'docs-page' });
    }
    if (!walk(path.join(layout.test, name)).some((file) => TEST_FILE.test(file)))
      gaps.push({ name, missing: 'test' });
    const ownOverview = fs.existsSync(path.join(layout.overviews, `${name}Overview.stories.tsx`));
    if (!listed.has(name) && !ownOverview) gaps.push({ name, missing: 'overview' });
  }

  // A folder that holds component source and is not reachable from the public entry point.
  for (const name of folders(layout.src)) {
    if (!PASCAL.test(name) || exported.includes(name)) continue;
    const hasSource = walk(path.join(layout.src, name)).some(
      (file) => /\.tsx?$/.test(file) && !NOT_SOURCE.test(file),
    );
    if (hasSource) gaps.push({ name, missing: 'export' });
  }

  return gaps.sort(byNameThenPart);
}

/** The widgets `appWidgets` holds: every `../widgets/<Name>` import whose name is used in the registry object. */
export function registeredWidgets(layout: LibraryLayout): string[] {
  const file = path.join(layout.src, 'dynamic-form', 'registries', 'widgets.ts');
  const source = parse(file);
  const imported = new Map<string, string>();
  const used = new Set<string>();
  const collect = (node: ts.Node): void => {
    if (ts.isIdentifier(node)) used.add(node.text);
    ts.forEachChild(node, collect);
  };
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const folder = /^\.\.\/widgets\/([^/]+)$/.exec(statement.moduleSpecifier.text)?.[1];
      const bindings = statement.importClause?.namedBindings;
      if (folder && bindings && ts.isNamedImports(bindings))
        for (const element of bindings.elements) imported.set(element.name.text, folder);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations)
        if (declaration.name.getText() === 'appWidgets' && declaration.initializer)
          collect(declaration.initializer);
    }
  }
  return [...new Set([...imported].filter(([name]) => used.has(name)).map(([, folder]) => folder))];
}

/** Every mandatory part a dynamic-form widget is missing, sorted by name. */
export function widgetGaps(layout: LibraryLayout): Gap<WidgetPart>[] {
  const root = path.join(layout.src, 'dynamic-form');
  const onDisk = folders(path.join(root, 'widgets'));
  const registered = registeredWidgets(layout);
  const tests = walk(root)
    .filter((file) => TEST_FILE.test(file))
    .map(read);
  const gaps: Gap<WidgetPart>[] = [];

  // The registry is only public through the `dynamic-form` entry point.
  const entryExportsRegistry = /\bappWidgets\b/.test(read(path.join(root, 'index.ts')));

  for (const name of [...new Set([...onDisk, ...registered])]) {
    if (!onDisk.includes(name) || !registered.includes(name) || !entryExportsRegistry)
      gaps.push({ name, missing: 'registered' });
    if (!onDisk.includes(name)) continue;
    const stories = walk(path.join(root, 'widgets', name))
      .filter((file) => STORY_FILE.test(file))
      .map(read);
    if (stories.every((source) => storyNames(source).length === 0))
      gaps.push({ name, missing: 'stories' });
    else if (!stories.some((source) => AUTODOCS.test(source)))
      gaps.push({ name, missing: 'docs-page' });
    const named = new RegExp(`\\b${name}\\b`);
    if (!tests.some((source) => named.test(source))) gaps.push({ name, missing: 'test' });
  }

  return gaps.sort(byNameThenPart);
}

// By code unit, so the order is the same on every machine.
const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);
const byNameThenPart = (a: Gap, b: Gap): number =>
  compare(a.name, b.name) || compare(a.missing, b.missing);

const keyOf = (gap: Gap): string => `${gap.name}: ${gap.missing}`;

export interface Reconciliation {
  /** Gaps that exist and are not written down: a component or widget is missing a mandatory part. */
  unlisted: string[];
  /** Allow-list lines for a gap that no longer exists: the debt is paid, delete the line. */
  paid: string[];
  /** Allow-list lines written twice. */
  duplicated: string[];
}

/** Compares what is missing with what the allow-list says is missing. All three lists must be empty. */
export function reconcile(gaps: Gap[], known: KnownGap[]): Reconciliation {
  const actual = new Set(gaps.map(keyOf));
  const listed = known.map(keyOf);
  return {
    unlisted: [...actual].filter((key) => !listed.includes(key)),
    paid: [...new Set(listed)].filter((key) => !actual.has(key)),
    duplicated: [...new Set(listed.filter((key, index) => listed.indexOf(key) !== index))],
  };
}
