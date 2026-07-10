import * as React from 'react';
import type { TableAppearance, TableProps, TableSemanticDOM, TableSorterResult } from '../Table.types';

export const px = (value?: number) => (typeof value === 'number' ? `${value}px` : undefined);

export const alignStyle = (align?: string): React.CSSProperties => (align ? { textAlign: align as React.CSSProperties['textAlign'] } : {});

export const resolveClassNames = <TRecord, TRowData>(props: TableProps<TRecord, TRowData>): Partial<Record<TableSemanticDOM, string>> => {
  return typeof props.classNames === 'function' ? props.classNames({ props }) : (props.classNames ?? {});
};

export const resolveStyles = <TRecord, TRowData>(props: TableProps<TRecord, TRowData>): Partial<Record<TableSemanticDOM, React.CSSProperties>> => {
  return typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {});
};

export const appearanceStyle = (appearance: TableAppearance = {}): React.CSSProperties => {
  const style: React.CSSProperties & Record<string, string | number | undefined> = {};
  if (appearance.headerFill) style['--bui-table-header-bg'] = appearance.headerFill;
  if (appearance.borderColor) style['--bui-table-border'] = appearance.borderColor;
  if (appearance.textSize) {
    style['--bui-table-cell-font-size-lg'] = `${appearance.textSize}px`;
    style['--bui-table-cell-font-size-md'] = `${appearance.textSize}px`;
    style['--bui-table-cell-font-size-sm'] = `${appearance.textSize}px`;
  }
  if (appearance.background) {
    // Paint the container AND body-row cells; header cells keep --bui-table-header-bg.
    style['--bui-table-bg'] = appearance.background;
    style['--bui-table-row-bg'] = appearance.background;
    style['--bui-table-row-striped-bg'] = `color-mix(in srgb, ${appearance.background} 92%, black 8%)`;
  }
  if (appearance.blockBorder?.radius != null) style['--bui-table-radius'] = `${appearance.blockBorder.radius}px`;
  if (appearance.padding) {
    style.paddingTop = px(appearance.padding.top);
    style.paddingRight = px(appearance.padding.right);
    style.paddingBottom = px(appearance.padding.bottom);
    style.paddingLeft = px(appearance.padding.left);
  }
  if (appearance.margin) {
    style.marginTop = px(appearance.margin.top);
    style.marginRight = px(appearance.margin.right);
    style.marginBottom = px(appearance.margin.bottom);
    style.marginLeft = px(appearance.margin.left);
  }
  return style;
};

export const defaultRootClass = [
  'bui-table',
  'w-full overflow-hidden rounded-[var(--bui-table-radius)] bg-[var(--bui-table-bg)] text-[var(--bui-table-fg)]',
  'border border-[var(--bui-table-border)] text-sm',
].join(' ');

export const tableClass = 'w-full border-collapse table-auto';
export const ellipsisCellClass = 'bui-table-cell-ellipsis truncate overflow-hidden whitespace-nowrap';
export const headerCellClass = [
  'relative border-[var(--bui-table-header-split-color)] bg-[var(--bui-table-header-bg)]',
  'text-left text-[var(--bui-table-header-fg)] font-medium align-middle',
].join(' ');
export const bodyCellClass = ['relative border-[var(--bui-table-border)]', 'align-middle'].join(' ');

export const DefaultFilterIcon = ({ filtered }: { filtered: boolean }) => (
  <svg className="bui-table-icon" viewBox="0 0 16 16" aria-hidden="true" data-active={filtered ? 'true' : 'false'}>
    <path d="M2.5 3.5h11L9.25 8.35v3.15l-2.5 1.25v-4.4L2.5 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

const SORT_ICON_UP = 'M8 12.75V3.25M8 3.25 4.5 6.75M8 3.25l3.5 3.5';
const SORT_ICON_DOWN = 'M8 3.25v9.5M8 12.75 4.5 9.25M8 12.75l3.5-3.5';
const SORT_ICON_ASCEND_PAIR = 'M5.25 3.25v9.5M5.25 3.25 3 5.5M5.25 3.25 7.5 5.5';
const SORT_ICON_DESCEND_PAIR = 'M10.75 12.75v-9.5M10.75 12.75 8.5 10.5M10.75 12.75 13 10.5';

export const DefaultSortIcon = ({ order }: { order: TableSorterResult<unknown>['order'] }) => {
  const orderKey = order ?? 'none';
  return (
    <svg className="bui-table-icon" viewBox="0 0 16 16" aria-hidden="true" data-sort-order={orderKey}>
      {order === 'ascend' ? (
        <path d={SORT_ICON_UP} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : order === 'descend' ? (
        <path d={SORT_ICON_DOWN} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <path d={SORT_ICON_ASCEND_PAIR} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
          <path d={SORT_ICON_DESCEND_PAIR} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  );
};
