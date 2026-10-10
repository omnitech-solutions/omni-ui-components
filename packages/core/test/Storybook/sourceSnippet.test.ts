import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsers } from 'prettier/plugins/typescript';
import { describe, expect, it } from 'vitest';
import { exampleDocs } from '../../../../.storybook/internal/support/exampleDocs';
import {
  buildExampleCode,
  buildSourceSnippet,
  mergeImports,
} from '../../../../.storybook/internal/support/sourceSnippet';

describe('overview source examples', () => {
  it('includes the actual props, children, callbacks and transitive fixture definitions', () => {
    const source = `import * as React from 'react';
import { Table, type TableColumn } from '@oc-tech/omni-ui-components/Table';
import { records, type RecordRow } from './fixtures';
const columns: TableColumn<RecordRow>[] = [{ key: 'name', dataIndex: 'name', title: 'Name' }];
const Preview = () => {
  const [selected, setSelected] = React.useState<string[]>([]);
  return <Table columns={columns} dataSource={records} showHeader={false} tableLayout="fixed" rowSelection={{ selectedRowKeys: selected, onChange: setSelected }} />;
};`;
    const code = buildSourceSnippet(source, 'Preview', {
      './fixtures': `export interface RecordRow { id: string; name: string }
export const records: RecordRow[] = [{ id: 'one', name: 'Alex' }];`,
    });
    expect(code).toContain("from '@oc-tech/omni-ui-components'");
    expect(code).toContain('interface RecordRow');
    expect(code).toContain('const records: RecordRow[]');
    expect(code).toContain('const columns: TableColumn<RecordRow>[]');
    expect(code).toContain('React.useState<string[]>([])');
    expect(code).toContain('showHeader={false}');
    expect(code).toContain('onChange: setSelected');
    expect(() =>
      parsers.typescript.parse(code, { filepath: 'example.tsx' } as Parameters<
        typeof parsers.typescript.parse
      >[1]),
    ).not.toThrow();
  });

  it('extracts a preview from the component map and keeps JSX children and imports', () => {
    const code = buildSourceSnippet(
      `import { Badge, Space } from '@oc-tech/omni-ui-components';
const previews = { Badge: () => <Space><Badge variant="outline">Draft</Badge></Space> };`,
      'previews.Badge',
    );
    expect(code).toContain('import { Badge }');
    expect(code).toContain('import { Space }');
    expect(code).toContain('<Badge variant="outline">Draft</Badge>');
    expect(code).toContain('export const Example');
  });

  it('does not include unrelated fixtures shadowed by local state', () => {
    const code = buildSourceSnippet(
      `const value = 'unrelated'; const Preview = () => { const value = 'local'; return <input value={value} />; };`,
      'Preview',
    );
    expect(code).not.toContain('unrelated');
    expect(code).toContain("const value = 'local'");
  });

  it('preserves the public dynamic-form entry point and type-only imports', () => {
    const code = buildSourceSnippet(
      `import { DynamicForm } from '@oc-tech/omni-ui-components/dynamic-form';
import type { DynamicFormProps } from '@oc-tech/omni-ui-components/dynamic-form';
const Preview = (props: DynamicFormProps<any, any>) => <DynamicForm {...props} />;`,
      'Preview',
    );
    expect(code).toContain(
      "import type { DynamicFormProps } from '@oc-tech/omni-ui-components/dynamic-form'",
    );
    expect(code).toContain(
      "import { DynamicForm } from '@oc-tech/omni-ui-components/dynamic-form'",
    );
  });

  it('fails when a preview or required fixture was removed from the source it reads', () => {
    expect(() => buildSourceSnippet('const Removed = () => <div />;', 'Preview')).toThrow(
      'Missing preview source: Preview',
    );
    expect(() =>
      buildSourceSnippet(
        `import { rows } from './fixtures'; const Preview = () => <div>{rows.length}</div>;`,
        'Preview',
        {
          './fixtures': 'export const removed = [];',
        },
      ),
    ).toThrow('Missing fixture definition: rows');
  });
});

const factoriesOf = (name: string) =>
  readFileSync(join(import.meta.dirname, `../../src/${name}/${name}.factories.tsx`), 'utf8');
const shown = (name: string, example: string) => buildExampleCode(factoriesOf(name), example);

describe('mergeImports', () => {
  it('folds the named imports of one module into one line, types marked, and leaves the rest alone', () => {
    const code = mergeImports(
      [
        "import { type OutlineItem } from '@oc-tech/omni-ui-components';",
        "import { Panel } from '@oc-tech/omni-ui-components';",
        "import * as React from 'react';",
        "import type { Meta } from '@storybook/react';",
        "import { OutlineList } from '@oc-tech/omni-ui-components';",
        "import type { StoryObj } from '@storybook/react';",
        '',
        "const a = 1; // import { no } from 'x';",
      ].join('\n'),
    );
    expect(code.split('\n')).toEqual([
      "import { type OutlineItem, OutlineList, Panel } from '@oc-tech/omni-ui-components';",
      "import * as React from 'react';",
      "import type { Meta, StoryObj } from '@storybook/react';",
      '',
      "const a = 1; // import { no } from 'x';",
    ]);
    expect(mergeImports("import { a } from 'm';\nimport { a } from 'm';")).toBe(
      "import { a } from 'm';",
    );
  });
});

describe('the code shown for OutlineList, CueCard, HeardLine and Splitter', () => {
  const examples: [string, string][] = [
    ['OutlineList', 'StepsPanel'],
    ['OutlineList', 'StepsLastFirst'],
    ['OutlineList', 'StepsLiveOnShow'],
    ['OutlineList', 'StepsReadOnly'],
    ['OutlineList', 'StepsEmpty'],
    ['OutlineList', 'StepsInGerman'],
    ['OutlineList', 'StepsWithTags'],
    ['OutlineList', 'StepsWithCustomRows'],
    ['OutlineList', 'NextStepPanel'],
    ['CueCard', 'AnswerPanel'],
    ['CueCard', 'ClosingNotePanel'],
    ['CueCard', 'CompactNotePanel'],
    ['CueCard', 'CompactTwoAnchorsPanel'],
    ['CueCard', 'PendingNotePanel'],
    ['CueCard', 'PreparingNotePanel'],
    ['CueCard', 'UnconfirmedNotePanel'],
    ['CueCard', 'GermanNotePanel'],
    ['CueCard', 'HeardPanel'],
    ['CueCard', 'LineOnItsOwn'],
    ['Splitter', 'StaticSplit'],
    ['Splitter', 'StaticThreePanels'],
    ['Splitter', 'ResizableColumns'],
    ['Splitter', 'ResizableStack'],
    ['Splitter', 'ResettableColumns'],
    ['Splitter', 'ColumnsWithGap'],
  ];

  it.each(examples)(
    '%s %s is real consumer code: it parses, imports from the package root in one line, and names no demo',
    async (name, example) => {
      // What a story passes as `parameters`: the code is built when it is first asked for, once.
      const parameters = exampleDocs(factoriesOf(name), example);
      const asked = parameters.example.code();
      expect(parameters.example.code()).toBe(asked);
      const code = await asked;
      expect(code).toBe(shown(name, example));
      expect(() =>
        parsers.typescript.parse(code, { filepath: 'example.tsx' } as Parameters<
          typeof parsers.typescript.parse
        >[1]),
      ).not.toThrow();
      expect(code.match(/from '@oc-tech\/omni-ui-components';/g)).toHaveLength(1);
      expect(code).not.toMatch(/Demo|onAction|PropsFactory|factories|makeFactory/);
      expect(code).toContain('export const Example = ');
    },
  );

  it('OutlineList: the type that extends OutlineItem, the typed data, the state, the typed callback, inside a Panel', () => {
    const code = shown('OutlineList', 'StepsPanel');
    expect(code).toContain(
      "import { type OutlineItem, OutlineList, Panel } from '@oc-tech/omni-ui-components';",
    );
    expect(code).toContain("import { useState } from 'react';");
    expect(code).toContain('interface Step extends OutlineItem {');
    expect(code).toContain('const steps: Step[] = [');
    expect(code).toContain("useState<string | null>('configure')");
    expect(code).toContain('<Panel');
    expect(code).toContain('<OutlineList<Step>');
    expect(code).toContain('setHref(step.href);');
    expect(code.indexOf('interface Step')).toBeLessThan(code.indexOf('const steps'));
    expect(code.indexOf('const steps')).toBeLessThan(code.indexOf('export const Example'));
  });

  it('OutlineList: the row on its own, renderItem returning it, and a Tag as trailing', () => {
    expect(shown('OutlineList', 'NextStepPanel')).toContain('<OutlineListItem<Step>');
    expect(shown('OutlineList', 'NextStepPanel')).not.toContain('<OutlineList<Step>');
    const custom = shown('OutlineList', 'StepsWithCustomRows');
    expect(custom).toContain('renderItem={(step, state, select) => (');
    expect(custom).toContain('<OutlineListItem<Step>');
    const tagged = shown('OutlineList', 'StepsWithTags');
    expect(tagged).toContain('trailing: <Tag>new</Tag>');
    expect(tagged).toContain(
      "import { type OutlineItem, OutlineList, Panel, Tag } from '@oc-tech/omni-ui-components';",
    );
  });

  it('CueCard and HeardLine: the type that extends CueSegment, lines as marked strings, one list with a segment, the typed callback, inside a Panel', () => {
    const code = shown('CueCard', 'AnswerPanel');
    expect(code).toContain('interface Cited extends CueSegment {');
    expect(code).toContain('const technicalNote: CueSection<Cited>[] = [');
    expect(code).toContain(
      "'Payments get an ==outbox== and ==idempotent consumers==; search can lag by seconds.',",
    );
    expect(code).toContain(
      "{ text: 'Changelog', role: 'evidence', source: 'docs/changelog', href: '/docs/changelog' },",
    );
    expect(code).not.toContain('segments');
    expect(code).toContain("const followUp: HeardLineProps['pieces'] = [");
    expect(code).toContain('<Panel');
    expect(code).toContain('<HeardLine ');
    expect(code).toContain('<CueCard<Cited>');
    expect(code).toContain('onSourceSelect={(segment) => setHref(segment.href ?? null)}');
    const heard = shown('CueCard', 'HeardPanel');
    expect(heard).toContain('interface HeardSentence');
    expect(heard).toContain('const heardSentences: HeardSentence[] = [');
    expect(shown('CueCard', 'LineOnItsOwn')).toContain(
      '<CueLineText line="**Start with** the ==result==, !!not the method!!." />',
    );
  });

  it('Splitter: the type that extends the panel limits, typed columns, the state, the callbacks, a Panel in each', () => {
    const code = shown('Splitter', 'ResizableColumns');
    expect(code).toContain('interface Column extends Pick<SplitterPanelProps,');
    expect(code).toContain('const columns: Column[] = [');
    expect(code).toContain('useState<SplitterSizes>({ list: 180, side: 220 })');
    expect(code).toContain('onSizesChange={(next) => setSizes(next)}');
    expect(code).toContain('onResizeStart={(panelId) => setHeld(panelId)}');
    expect(code).toContain('<SplitterPanel ');
    expect(code).toContain('<Panel');
    expect(shown('Splitter', 'ResettableColumns')).toContain('<Button');
  });

  it('none of the shown code or its data carries wording of one application', () => {
    for (const [name, example] of examples)
      expect(shown(name, example)).not.toMatch(
        /interview|candidate|coach|askedAt|noteCount|roleId|\bQuestion|\bClaim\b/,
      );
  });
});
