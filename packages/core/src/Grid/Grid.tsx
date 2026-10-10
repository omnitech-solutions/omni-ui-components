import { cn } from 'lib/utils';
import type * as React from 'react';

/** Columns per container width: `base` always, then from 640, 768 and 1024 pixels of the row's own width. */
export interface RowColumns {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The gap in pixels, or `[horizontal, vertical]`. */
  gutter?: number | [number, number];
  /**
   * The row is a grid of this many equal tracks and its children need no `Col`. An object sets the count per
   * width of the row itself (container queries), so a grid inside a narrow panel folds.
   */
  columns?: number | RowColumns;
  /** The row is a grid that fits as many tracks of at least this many pixels as there is room for. */
  minItemWidth?: number;
}

export interface ColProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: number;
}

const gapOf = (gutter: number | [number, number]): React.CSSProperties =>
  Array.isArray(gutter) ? { columnGap: gutter[0], rowGap: gutter[1] } : { gap: gutter };

const responsiveTracks =
  'grid-cols-[repeat(var(--oui-row-columns),minmax(0,1fr))] @min-[640px]:grid-cols-[repeat(var(--oui-row-columns-sm),minmax(0,1fr))] @min-[768px]:grid-cols-[repeat(var(--oui-row-columns-md),minmax(0,1fr))] @min-[1024px]:grid-cols-[repeat(var(--oui-row-columns-lg),minmax(0,1fr))]';

/**
 * Omni Row: a wrapping flex row of `Col`s, or with `columns` or `minItemWidth` a CSS grid whose children are the
 * cells (`data-layout="grid"`).
 *
 * @example
 * <Row minItemWidth={260} gutter={16}>{cards}</Row>
 * <Row columns={{ base: 1, sm: 2, lg: 4 }} gutter={[16, 24]}>{cards}</Row>
 */
export const Row = ({
  gutter = 0,
  columns,
  minItemWidth,
  className,
  style,
  ...props
}: RowProps) => {
  if (columns === undefined && minItemWidth === undefined) {
    return (
      <div
        className={cn('flex flex-wrap', className)}
        style={{ ...gapOf(gutter), ...style }}
        {...props}
      />
    );
  }
  if (typeof columns === 'object') {
    const base = columns.base ?? 1;
    const sm = columns.sm ?? base;
    const md = columns.md ?? sm;
    const lg = columns.lg ?? md;
    return (
      <div data-slot="row-container" className="@container w-full">
        <div
          data-layout="grid"
          className={cn('grid', responsiveTracks, className)}
          style={
            {
              '--oui-row-columns': base,
              '--oui-row-columns-sm': sm,
              '--oui-row-columns-md': md,
              '--oui-row-columns-lg': lg,
              ...gapOf(gutter),
              ...style,
            } as React.CSSProperties
          }
          {...props}
        />
      </div>
    );
  }
  return (
    <div
      data-layout="grid"
      className={cn('grid', className)}
      style={{
        gridTemplateColumns:
          columns !== undefined
            ? `repeat(${columns}, minmax(0, 1fr))`
            : `repeat(auto-fill, minmax(min(${minItemWidth}px, 100%), 1fr))`,
        ...gapOf(gutter),
        ...style,
      }}
      {...props}
    />
  );
};

export const Col = ({ span = 24, className, style, ...props }: ColProps) => (
  <div className={cn(className)} style={{ width: `${(span / 24) * 100}%`, ...style }} {...props} />
);
