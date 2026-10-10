import type { ObjectFieldTemplateProps } from '@rjsf/utils';
import { cn } from 'lib/utils';
import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { DEFAULT_DYNAMIC_FORM_LABELS, type OmniRjsfFormContext } from '../lib/formContext';
import { StatusMark } from './StatusMark';

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
 *
 * Sections: an object below the root draws its `title` and `description` (from the schema, or `ui:title` /
 * `ui:description`) as the `legend` of a `fieldset`, so a long form has headings and the group is announced.
 *   - `ui:options.heading: false` hides it; `true` on the ROOT object draws the form's own title (off by default:
 *     the host usually titles its page or dialog).
 *   - `ui:options.section: 'plain' | 'card'`: the fields bare (default) or inside a bordered card.
 *   - `ui:options.collapsible: true | { title, defaultOpen }`: the heading opens and closes the section.
 */
interface CollapsibleOption {
  title?: string;
  defaultOpen?: boolean;
}

export const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const { properties, schema, uiSchema, registry } = props;
  const formContext = (registry?.formContext ?? {}) as Partial<OmniRjsfFormContext>;
  const labels = { ...DEFAULT_DYNAMIC_FORM_LABELS, ...formContext.labels };
  const rows = (uiSchema as unknown as { 'ui:rows'?: RowSpec[] } | undefined)?.['ui:rows'];
  const uiOptions =
    (uiSchema as unknown as { 'ui:options'?: Record<string, unknown> } | undefined)?.[
      'ui:options'
    ] ?? {};
  const rawCollapsible = uiOptions['collapsible'];
  const collapsible: CollapsibleOption | null =
    rawCollapsible === true
      ? {}
      : rawCollapsible && typeof rawCollapsible === 'object'
        ? (rawCollapsible as CollapsibleOption)
        : null;
  const [open, setOpen] = React.useState<boolean>(collapsible?.defaultOpen ?? true);
  const byName = new Map(properties.map((p) => [p.name, p] as const));

  /* No ui:rows ⇒ pair flat scalars into 2-per-row; stack rows of object
   * subschemas (e.g. contact_info / address) so each section keeps its
   * own ObjectFieldTemplate. */
  const childIsObject = (name: string) =>
    (schema?.properties as Record<string, { type?: string }> | undefined)?.[name]?.type ===
    'object';
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
  const trailing: RowSpec[] = properties
    .filter((p) => !declaredNames.has(p.name))
    .map((p) => [p.name]);
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

  const sectionId =
    (props as { fieldPathId?: { $id?: string } }).fieldPathId?.$id ??
    (props as { idSchema?: { $id?: string } }).idSchema?.$id ??
    'root';
  const isRoot = sectionId === 'root';
  // The section's key as the host writes it (`contact`, `billing.address`); the host's say over it is data.
  const sectionPath = (props as { fieldPathId?: { path?: (string | number)[] } }).fieldPathId?.path;
  const sectionKey = sectionPath?.length ? sectionPath.join('.') : '';
  const hosted = sectionKey ? formContext.sections?.[sectionKey] : undefined;
  const isOpen = hosted?.open ?? open;
  const headerExtras =
    hosted?.status || hosted?.meta ? (
      <span data-slot="form-section-meta" className="ml-auto inline-flex items-center gap-3">
        {hosted.status ? <StatusMark status={hosted.status} /> : null}
        {hosted.meta ? (
          <span className="text-xs font-normal text-[var(--oui-foreground-muted)]">
            {hosted.meta}
          </span>
        ) : null}
      </span>
    ) : null;
  const ownTitle =
    (typeof uiOptions['title'] === 'string' ? (uiOptions['title'] as string) : undefined) ??
    (uiSchema as { 'ui:title'?: string } | undefined)?.['ui:title'] ??
    (schema?.title as string | undefined);
  const ownDescription =
    (typeof uiOptions['description'] === 'string'
      ? (uiOptions['description'] as string)
      : undefined) ??
    (uiSchema as { 'ui:description'?: string } | undefined)?.['ui:description'] ??
    (schema?.description as string | undefined);
  const card = uiOptions['section'] === 'card';
  const descriptionId = `${sectionId}__section-description`;
  const descriptionNode = ownDescription ? (
    <p
      id={descriptionId}
      data-slot="form-section-description"
      className="font-[family-name:var(--oui-font-sans)] text-xs text-[var(--oui-foreground-muted)]"
    >
      {ownDescription}
    </p>
  ) : null;
  const cardClass = card
    ? 'rounded-[var(--oui-radius-field)] border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-4'
    : '';

  if (collapsible) {
    const title = collapsible.title ?? ownTitle ?? labels.section;
    return (
      <div data-testid="oui-collapsible" className={cn('flex w-full flex-col gap-3', cardClass)}>
        <div className="flex w-full items-center gap-3">
          <button
            type="button"
            data-testid="oui-collapsible-toggle"
            aria-expanded={isOpen}
            onClick={() => {
              // A controlled section changes only when the host answers; either way the host is told.
              if (hosted?.open === undefined) setOpen(!isOpen);
              formContext.onSectionOpenChange?.(sectionKey, !isOpen);
            }}
            className="flex w-fit items-center gap-1.5 text-sm font-semibold text-[var(--oui-foreground)] hover:text-[color:var(--oui-foreground-primary)]"
          >
            {title}
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 transition-transform motion-reduce:transition-none',
                !isOpen && '-rotate-90',
              )}
              aria-hidden="true"
            />
          </button>
          {headerExtras}
        </div>
        <div
          data-testid="oui-collapsible-content"
          hidden={!isOpen}
          style={isOpen ? undefined : { display: 'none' }}
          className="flex flex-col gap-3"
        >
          {descriptionNode}
          {grid}
        </div>
      </div>
    );
  }

  const heading = uiOptions['heading'];
  const showHeading = Boolean(ownTitle) && (isRoot ? heading === true : heading !== false);
  if (!showHeading) return card ? <div className={cn('w-full', cardClass)}>{grid}</div> : grid;

  return (
    <fieldset
      data-slot="form-section"
      aria-describedby={ownDescription ? descriptionId : undefined}
      className={cn('m-0 flex w-full min-w-0 flex-col gap-4 border-0 p-0', cardClass)}
    >
      <legend
        data-slot="form-section-title"
        className="float-left w-full p-0 font-[family-name:var(--oui-font-sans)] text-base font-semibold text-[var(--oui-foreground)]"
      >
        <span className="flex w-full items-center gap-3">
          {ownTitle}
          {headerExtras}
        </span>
      </legend>
      {descriptionNode}
      {grid}
    </fieldset>
  );
};
