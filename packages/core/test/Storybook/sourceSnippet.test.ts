import { parsers } from 'prettier/plugins/typescript';
import { describe, expect, it } from 'vitest';
import { buildSourceSnippet } from '../../../../.storybook/internal/support/sourceSnippet';

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
