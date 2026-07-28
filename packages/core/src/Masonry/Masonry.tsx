import * as React from 'react';

import { cn } from 'lib/utils';

export type MasonryColumns = number | Partial<Record<'xs' | 'sm' | 'md', number>>;
export type MasonryGapValue = number | string;
export type MasonryGap =
  | MasonryGapValue
  | [MasonryGapValue, MasonryGapValue]
  | Partial<Record<'xs' | 'sm' | 'md', MasonryGapValue | [MasonryGapValue, MasonryGapValue]>>;
export type MasonrySemantic = 'root' | 'item';
export type MasonrySemanticMap<T> = Partial<Record<MasonrySemantic, T>>;

export interface MasonryItem<T = unknown> {
  key?: React.Key;
  children?: React.ReactNode;
  data?: T;
  column?: number;
  height?: number;
}

export interface MasonryProps<T = unknown> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  columns?: MasonryColumns;
  fresh?: boolean;
  gutter?: MasonryGap;
  items?: Array<MasonryItem<T> | React.ReactNode>;
  itemRender?: (item: MasonryItem<T> & { index: number }) => React.ReactNode;
  onLayoutChange?: (layout: Array<{ key: React.Key; column: number }>) => void;
  classNames?: MasonrySemanticMap<string>;
  styles?: MasonrySemanticMap<React.CSSProperties>;
  prefixCls?: string;
  rootClassName?: string;
  children?: React.ReactNode;
}

const resolveColumns = (columns: MasonryColumns, width: number): number => {
  if (typeof columns === 'number') return columns;
  if (width >= 768 && columns.md) return columns.md;
  if (width >= 640 && columns.sm) return columns.sm;
  return columns.xs ?? columns.sm ?? columns.md ?? 3;
};

const resolveGap = (gutter: MasonryGap, width: number): [MasonryGapValue, MasonryGapValue] => {
  const responsive = !Array.isArray(gutter) && typeof gutter === 'object'
    ? (gutter as Partial<Record<'xs' | 'sm' | 'md', MasonryGapValue | [MasonryGapValue, MasonryGapValue]>>)
    : undefined;
  const value = responsive
    ? width >= 768
      ? responsive.md ?? responsive.sm ?? responsive.xs
      : width >= 640
        ? responsive.sm ?? responsive.xs
        : responsive.xs
    : (gutter as MasonryGapValue | [MasonryGapValue, MasonryGapValue]);
  if (Array.isArray(value)) return value;
  return [value ?? 0, value ?? 0];
};

const isMasonryItem = (value: MasonryItem | React.ReactNode): value is MasonryItem =>
  typeof value === 'object' && value !== null && 'key' in value && ('children' in value || 'data' in value || 'column' in value);

const useViewportWidth = () => {
  const [width, setWidth] = React.useState(() => (typeof window === 'undefined' ? 1024 : window.innerWidth));
  React.useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
};

export const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(function Masonry(
  {
    columns = 3,
    fresh = false,
    gutter = 16,
    items,
    itemRender,
    onLayoutChange,
    classNames,
    styles,
    prefixCls: _prefixCls,
    rootClassName,
    children,
    className,
    style,
    ...props
  },
  ref,
) {
  const width = useViewportWidth();
  const columnCount = Math.max(1, resolveColumns(columns, width));
  const source = (items ?? React.Children.toArray(children)) as Array<MasonryItem | React.ReactNode>;
  const normalized: MasonryItem[] = source.map((item, index) =>
    isMasonryItem(item) ? item : { key: index, children: item },
  );
  const [horizontal, vertical] = resolveGap(gutter, width);

  React.useEffect(() => {
    onLayoutChange?.(normalized.map((item, index) => ({ key: item.key ?? index, column: item.column ?? index % columnCount })));
  }, [columnCount, normalized.length, onLayoutChange]);

  return (
    <div
      ref={ref}
      key={fresh ? normalized.map((item) => String(item.key)).join('|') : undefined}
      className={cn(classNames?.root, rootClassName, className)}
      style={{ columnCount, columnGap: horizontal, ...styles?.root, ...style }}
      {...props}
    >
      {normalized.map((item, index) => (
        <div
          key={item.key ?? index}
          className={cn('mb-4 break-inside-avoid', classNames?.item)}
          style={{ marginBottom: vertical, minHeight: item.height, ...styles?.item }}
        >
          {itemRender ? itemRender({ ...item, index }) : item.children}
        </div>
      ))}
    </div>
  );
});

Masonry.displayName = 'Masonry';
