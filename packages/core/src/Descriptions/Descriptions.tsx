import { cn } from 'lib/utils';
import type * as React from 'react';

export interface DescriptionItem {
  key?: React.Key;
  label: React.ReactNode;
  children: React.ReactNode;
}

export interface DescriptionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  items: DescriptionItem[];
  columns?: number;
  /** `false` draws the rows only, with no box of its own: for use inside a `Card`, a `Collapse` or a `Panel`. Default `true`. */
  bordered?: boolean;
  /** `small` tightens the padding and the gaps for a narrow column. Default `default`. */
  size?: 'default' | 'small';
}

/**
 * Omni Descriptions: labelled values. Each item is a small upper-case `label` over its `children` (text, a
 * `Tag`, a list of lines, a field).
 *
 * Slots: `data-slot="descriptions" | "descriptions-title" | "descriptions-item" | "descriptions-label" |
 * "descriptions-value"`. The root carries `data-size` and `data-bordered`.
 *
 * @example
 * <Descriptions columns={1} size="small" bordered={false} items={[{ label: 'Owner', children: 'Alex Morgan' }]} />
 */

export const Descriptions = ({
  title,
  items,
  columns = 2,
  bordered = true,
  size = 'default',
  className,
  ...props
}: DescriptionsProps) => {
  const small = size === 'small';
  return (
    <div
      data-slot="descriptions"
      data-size={size}
      data-bordered={bordered ? 'true' : 'false'}
      className={cn('min-w-0', bordered && 'rounded-lg border bg-background', className)}
      {...props}
    >
      {title ? (
        <div
          data-slot="descriptions-title"
          className={cn(
            'text-sm font-semibold',
            bordered ? 'border-b' : 'pb-2',
            bordered && (small ? 'px-3 py-2' : 'px-4 py-3'),
          )}
        >
          {title}
        </div>
      ) : null}
      <dl
        className={cn(
          'm-0 grid',
          small ? 'gap-x-4 gap-y-2.5' : 'gap-x-6 gap-y-4',
          bordered && (small ? 'px-3 py-2.5' : 'px-4 py-4'),
        )}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.map((item, index) => (
          <div
            key={item.key ?? index}
            data-slot="descriptions-item"
            className={cn('min-w-0', small ? 'space-y-0.5' : 'space-y-1')}
          >
            <dt
              data-slot="descriptions-label"
              className={cn(
                'font-medium uppercase tracking-wide text-muted-foreground',
                small ? 'text-[11px]' : 'text-xs',
              )}
            >
              {item.label}
            </dt>
            <dd data-slot="descriptions-value" className="m-0 text-sm break-words text-foreground">
              {item.children}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
