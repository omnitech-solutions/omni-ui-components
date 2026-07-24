/**
 * Table snippet builder — the equivalent of the rjsf `buildFormSnippet`
 * helper, adapted for the shared Bonsai Table component.
 *
 * Walks the concrete TableProps a story rendered with and emits a
 * runnable TSX snippet that includes every meaningful prop (columns,
 * dataSource / rows, rowSelection, expandable, pagination, appearance,
 * registry, virtual, scroll, editable, etc.). Consumers wire this into
 * `parameters.docs.source.transform` so the Show code panel reflects the
 * actual rendered tree instead of a synthetic args-only stub.
 */
import { formatValue } from './formatValue';

type UnknownRecord = Record<string, unknown>;

export interface BuildTableSnippetOptions {
  /** Optional component-name override for the emitted JSX. Defaults to `Table`. */
  componentName?: string;
  /** Optional type argument (or comma-separated list) rendered as `<Table<TypeArg> ...>`. */
  typeArgs?: string;
  /** Extra `import { ... } from '...'` lines to prepend. */
  imports?: string[];
  /** Optional prop keys the snippet should skip (e.g. internal test-id prefixes). */
  omit?: string[];
  /** Optional per-prop serializer override — return `null` to fall back to the default. */
  serializeProp?: (key: string, value: unknown) => string | null;
}

const DEFAULT_IMPORTS = ["import { Table } from '@oc-tech/omni-ui-components/Table';", "import type { TableColumn, TableDataRow } from '@oc-tech/omni-ui-components/Table';"];

const DEFAULT_OMIT = ['testIdPrefix', 'key', 'ref'];

const isComponent = (v: unknown): boolean => v === null || typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';

const attrLines = (props: UnknownRecord, opts: BuildTableSnippetOptions): string[] => {
  const omit = new Set([...DEFAULT_OMIT, ...(opts.omit ?? [])]);
  return Object.entries(props)
    .filter(([key, value]) => !omit.has(key) && value !== undefined)
    .map(([key, value]) => {
      const override = opts.serializeProp?.(key, value);
      if (override !== null && override !== undefined) return `  ${key}=${override}`;
      if (value === true) return `  ${key}`;
      if (value === false) return `  ${key}={false}`;
      if (typeof value === 'function') return `  ${key}={() => {}}`;
      if (typeof value === 'string') return `  ${key}=${JSON.stringify(value)}`;
      if (isComponent(value)) return `  ${key}={${JSON.stringify(value)}}`;
      return `  ${key}={${formatValue(value, 1)}}`;
    });
};

/** Build a runnable JSX snippet for a Bonsai <Table /> render. */
export const buildTableSnippet = (props: UnknownRecord, opts: BuildTableSnippetOptions = {}): string => {
  const componentName = opts.componentName ?? 'Table';
  const typeArgs = opts.typeArgs ? `<${opts.typeArgs}>` : '';
  const imports = opts.imports ?? DEFAULT_IMPORTS;
  const attrs = attrLines(props, opts).join('\n');
  return [...imports, '', `<${componentName}${typeArgs}`, attrs, '/>'].join('\n');
};
