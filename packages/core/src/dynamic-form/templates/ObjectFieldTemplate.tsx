import * as React from 'react';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';
import { ChevronDown } from 'lucide-react';

import { cn } from 'lib/utils';

/**
 * Single row cell — bare field name, or an object that opts into layout
 * tweaks. Mirrors RJSF's layoutGrid item but trimmed to the knobs we use.
 *
 * @example
 *   'ui:rows': [
 *     ['label'],                                   // half-width by default
 *     ['address1', 'address2'],                    // two side-by-side cells
 *     [{ value: 'notes', span: 2 }],               // full-width single field
 *   ]
 */
type RowItem = string | { value: string; span?: number };
type RowSpec = RowItem[];

const cellName = (item: RowItem): string => (typeof item === 'string' ? item : item.value);
const cellSpan = (item: RowItem): number => (typeof item === 'string' ? 1 : (item.span ?? 1));

/**
 * Omni object layout. Consumers declare row groupings via a single
 * `ui:rows` prop in the uiSchema — no Tailwind classNames in the
 * authoring surface. The grid is uniform across the form: the column
 * count is the largest row's total span so single-field rows stay at
 * one column unless they explicitly opt into a wider `span`. Use the
 * `{ value, span }` cell form to widen a field beyond its default one
 * column (e.g. a notes textarea spanning the full row).
 */
interface CollapsibleOption {
  title?: string;
  defaultOpen?: boolean;
}

export const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const { properties, schema, uiSchema } = props;
  const rows = (uiSchema as unknown as { 'ui:rows'?: RowSpec[] } | undefined)?.['ui:rows'];
  const uiOptions = (uiSchema as unknown as { 'ui:options'?: Record<string, unknown> } | undefined)?.['ui:options'] ?? {};
  const rawCollapsible = uiOptions['collapsible'];
  const collapsible: CollapsibleOption | null =
    rawCollapsible === true ? {} : rawCollapsible && typeof rawCollapsible === 'object' ? (rawCollapsible as CollapsibleOption) : null;
  const [open, setOpen] = React.useState<boolean>(collapsible?.defaultOpen ?? true);
  const byName = new Map(properties.map((p) => [p.name, p] as const));

  /* No ui:rows ⇒ pair flat scalars into 2-per-row; stack rows of object
   * subschemas (e.g. contact_info / address) so each section keeps its
   * own ObjectFieldTemplate. */
  const childIsObject = (name: string) => (schema?.properties as Record<string, { type?: string }> | undefined)?.[name]?.type === 'object';
  const pairScalars = (names: string[]): RowSpec[] => {
    const out: RowSpec[] = [];
    let pair: string[] = [];
    for (const name of names) {
      if (childIsObject(name)) {
        if (pair.length) {
          out.push(pair);
          pair = [];
        }
        out.push([{ value: name, span: 2 }]);
      } else {
        pair.push(name);
        if (pair.length === 2) {
          out.push(pair);
          pair = [];
        }
      }
    }
    if (pair.length) out.push(pair);
    return out;
  };
  const declared: RowSpec[] = rows ?? pairScalars(properties.map((p) => p.name));
  const declaredNames = new Set(declared.flat().map(cellName));
  const trailing: RowSpec[] = properties.filter((p) => !declaredNames.has(p.name)).map((p) => [p.name]);
  const allRows: RowSpec[] = [...declared, ...trailing];
  const maxCols = allRows.reduce(
    (max, r) =>
      Math.max(
        max,
        r.reduce((acc, item) => acc + cellSpan(item), 0),
      ),
    1,
  );

  const grid = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {allRows.map((row, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxCols}, minmax(0, 1fr))`,
            gap: '2rem',
          }}
        >
          {row.map((item) => {
            const name = cellName(item);
            const span = cellSpan(item);
            const cell = byName.get(name);
            return cell ? (
              <div key={name} style={{ gridColumn: `span ${span}` }}>
                {cell.content}
              </div>
            ) : null;
          })}
        </div>
      ))}
    </div>
  );

  if (!collapsible) return grid;

  const title = collapsible.title ?? (schema?.title as string | undefined) ?? 'Additional Fields';
  return (
    <div data-testid="oui-collapsible" className="flex flex-col gap-3 w-full">
      <button
        type="button"
        data-testid="oui-collapsible-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-fit items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary"
      >
        {title}
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', !open && '-rotate-90')} aria-hidden="true" />
      </button>
      <div data-testid="oui-collapsible-content" hidden={!open} style={open ? undefined : { display: 'none' }}>
        {grid}
      </div>
    </div>
  );
};
