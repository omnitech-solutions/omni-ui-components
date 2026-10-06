import * as React from 'react';

import { cn } from 'lib/utils';
import { Divider } from '../Divider';
import { ToolbarSizeContext } from './ToolbarContext';
import type { ToolbarProps } from './Toolbar.types';

/** The 20px control separator: a vertical Divider on the neutral tone border, with 3px side margins (6px gap + 3 = 9px spacing). */
const Separator: React.FC = () => (
  <Divider orientation="vertical" decorative className="mx-[3px] h-[var(--oui-control-separator)] bg-[color:var(--oui-tone-neutral-border)]" />
);

/**
 * Omni Toolbar: a thin `role="toolbar"` row that hands one control size
 * (36px / 52px) to the controls inside it, groups them with 20px separators,
 * and offers `leading` / `trailing` slots for placement. Window chrome stays
 * in the app; the library never interprets the slots.
 *
 * Tab moves between the controls (each one is focusable); there is no roving
 * tabindex, so Segmented keeps its own arrow-key handling.
 *
 * @example
 * <Toolbar label="Session controls" groups={[
 *   { id: 'sensors', label: 'Sensors', children: <><SplitButton … /><SplitButton … /></> },
 *   { id: 'view', label: 'View', children: <Segmented … /> },
 * ]} trailing={<IconButton … />} />
 */
export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  (
    { label, size = 'control', leading, groups = [], children, trailing, separators = true, variant = 'plain', className, 'data-testid': testId },
    ref,
  ) => {
    const sections: Array<{
      key: string;
      label?: string;
      node: React.ReactNode;
    }> = [];
    if (leading) sections.push({ key: 'leading', node: leading });
    groups.forEach((group) =>
      sections.push({
        key: group.id,
        label: group.label,
        node: group.children,
      }),
    );
    if (children) sections.push({ key: 'children', node: children });
    if (trailing) sections.push({ key: 'trailing', node: trailing });

    return (
      <ToolbarSizeContext.Provider value={size}>
        <div
          ref={ref}
          role="toolbar"
          aria-label={label}
          aria-orientation="horizontal"
          data-slot="toolbar"
          data-size={size}
          data-variant={variant}
          data-testid={testId}
          className={cn(
            variant === 'bar'
              ? 'box-border flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2'
              : 'inline-flex items-center gap-[var(--oui-control-gap)]',
            variant === 'floating' &&
              'rounded-2xl border border-[color:var(--oui-tone-dim-border)] bg-[color:var(--oui-badge-ring)] px-2.5 py-[7px] shadow-[0_10px_30px_rgba(0,0,0,0.35)]',
            className,
          )}
        >
          {sections.map((section, index) => (
            <React.Fragment key={section.key}>
              {separators && index > 0 ? <Separator /> : null}
              <div
                role={section.label ? 'group' : undefined}
                aria-label={section.label}
                data-slot="toolbar-group"
                data-group-id={section.key}
                className={cn(
                  'flex items-center gap-[var(--oui-control-gap)]',
                  variant === 'bar' && section.key === 'leading' && 'min-w-0 flex-[1_1_auto]',
                  variant === 'bar' && section.key === 'trailing' && 'ml-auto flex-wrap justify-end',
                )}
              >
                {section.node}
              </div>
            </React.Fragment>
          ))}
        </div>
      </ToolbarSizeContext.Provider>
    );
  },
);
Toolbar.displayName = 'Toolbar';
