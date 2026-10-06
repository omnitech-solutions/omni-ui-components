import * as React from 'react';
import { ArrowDown } from 'lucide-react';

import { cn } from 'lib/utils';
import { useFollowLatest } from '../lib/use-follow-latest';
import { Button } from '../Button';
import { Empty } from '../Empty';
import type { PanelPadding, PanelProps } from './Panel.types';

/**
 * Surface backgrounds: the opaque base colour mixed with `--oui-panel-see-through` (0-1), on the element itself so the
 * token can be set on any ancestor. Only backgrounds use it; text, icons and borders stay at full opacity.
 * Written out in full so Tailwind's source scan sees each class.
 */
const BG_PANEL = 'bg-[color:color-mix(in_srgb,var(--oui-panel-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]';
const BG_HEADER = 'bg-[color:color-mix(in_srgb,var(--oui-panel-header-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]';
const BG_DOCK = 'bg-[color:color-mix(in_srgb,var(--oui-panel-dock-bg)_calc(var(--oui-panel-see-through,1)_*_100%),transparent)]';

const PADDING: Record<PanelPadding, string> = {
  none: '',
  sm: 'px-3 py-2.5',
  md: 'px-5 py-4',
};

const toCss = (value: number | string | undefined) => (typeof value === 'number' ? `${value}px` : value);

const hasBody = (children: React.ReactNode) => React.Children.toArray(children).length > 0;

/**
 * Omni Panel: a flex-column shell with a 40px header (title, optional subtitle, meta and actions), a body that
 * fills the rest and scrolls inside, and an optional dock pinned at the bottom. Nothing in it is positioned
 * against the window, so a panel never escapes its parent. A parent lays panels out with `width` / `minWidth` /
 * `flex`: for example a 330px (min 300) transcript next to panels that share the rest equally.
 *
 * Callbacks and slots are plain props: `actions` and `dock` take nodes (Buttons with their own `onClick`),
 * `empty` takes the Empty tile config, `scroll` configures the fade, the thin scrollbar and the stick-to-bottom
 * jump pill (`onJumpToLatest`). See-through is a token: set `--oui-panel-see-through` (0-1) and only the panel,
 * header and dock backgrounds become transparent; text and icons stay at full opacity.
 *
 * Slots for host styling: `data-slot="panel" | "panel-header" | "panel-body" | "panel-dock"`.
 *
 * @example
 * <Panel title="Answer" meta="Last capture 08:33 · no question found"
 *   empty={{ icon: <MonitorUp />, title: 'Nothing analysed yet', description: 'Capture to start.' }} />
 * <Panel title="Transcript & chat" width={330} minWidth={300} scroll={{ fade: true, stickToBottom: true }}>{messages}</Panel>
 */
export const Panel = React.forwardRef<HTMLElement, PanelProps>(
  (
    {
      title,
      subtitle,
      meta,
      actions,
      dock,
      children,
      empty,
      scroll,
      bodyPadding = 'none',
      bodyClassName,
      dockClassName,
      width,
      minWidth,
      flex,
      as: Root = 'section',
      className,
      style,
      'aria-labelledby': labelledBy,
      'data-testid': testId,
      ...rest
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const titleId = `${generatedId}-title`;

    const follow = Boolean(scroll?.stickToBottom);
    const log = useFollowLatest<HTMLDivElement>(scroll?.lines ?? React.Children.count(children), scroll?.activity);

    const showEmpty = Boolean(empty) && !hasBody(children);
    const hasActions = actions !== undefined && actions !== null && actions !== false;
    const hasMeta = meta !== undefined && meta !== null && meta !== false;
    const hasDock = dock !== undefined && dock !== null && dock !== false;
    const scrolling = Boolean(scroll);

    const jump = () => {
      log.jump();
      scroll?.onJumpToLatest?.();
    };

    const rootStyle: React.CSSProperties = {
      flex: flex ?? (width !== undefined ? `0 0 ${toCss(width)}` : '1 1 0'),
      minWidth: toCss(minWidth) ?? (width === undefined ? 0 : undefined),
      ...style,
    };

    const missed = log.unseen;
    const missedText = missed > 0 ? (scroll?.missedLabel?.(missed) ?? `${missed} new`) : null;
    const jumpLabel = scroll?.jumpLabel ?? 'Jump to latest';

    return (
      <Root
        ref={ref as React.Ref<HTMLDivElement>}
        role="region"
        aria-labelledby={labelledBy ?? titleId}
        data-slot="panel"
        data-testid={testId}
        style={rootStyle}
        className={cn(
          'box-border flex min-h-0 flex-col overflow-hidden',
          'rounded-[var(--oui-panel-radius)] border border-solid text-[color:var(--oui-tone-neutral-fg)]',
          'border-[color:var(--oui-panel-border)]',
          BG_PANEL,
          className,
        )}
        {...rest}
      >
        <div
          data-slot="panel-header"
          className={cn(
            'box-border flex h-[var(--oui-panel-header-height)] flex-none items-center gap-2 border-b border-solid pl-[var(--oui-panel-pad-x)]',
            'border-[color:var(--oui-panel-divider)]',
            BG_HEADER,
            hasActions ? 'pr-2' : 'pr-[var(--oui-panel-pad-x)]',
          )}
        >
          <span id={titleId} data-slot="panel-title" className="flex-none text-[13px] leading-none font-semibold whitespace-nowrap">
            {title}
          </span>
          {subtitle ? (
            <span data-slot="panel-subtitle" className="min-w-0 truncate text-xs text-[color:var(--oui-panel-meta-fg)]">
              {subtitle}
            </span>
          ) : null}
          {hasMeta || hasActions ? (
            <div data-slot="panel-header-end" className="ml-auto flex min-w-0 items-center gap-2">
              {hasMeta ? (
                <span data-slot="panel-meta" className="min-w-0 truncate text-xs text-[color:var(--oui-panel-meta-fg)] [&>*+*]:ml-1.5">
                  {meta}
                </span>
              ) : null}
              {hasActions ? (
                <div data-slot="panel-actions" className="flex flex-none items-center gap-1.5">
                  {actions}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div
          ref={follow ? log.ref : undefined}
          data-slot="panel-body"
          data-fade={scroll?.fade ? 'true' : undefined}
          data-thin-scrollbar={scroll?.thinScrollbar ? 'true' : undefined}
          data-following={follow ? String(log.following) : undefined}
          role={scrolling ? 'group' : undefined}
          aria-labelledby={scrolling ? (labelledBy ?? titleId) : undefined}
          tabIndex={scrolling ? 0 : undefined}
          onScroll={follow ? log.onScroll : undefined}
          onWheel={follow ? log.onPersonScroll : undefined}
          onTouchMove={follow ? log.onPersonScroll : undefined}
          onPointerDown={follow ? log.onPersonScroll : undefined}
          onKeyDown={follow ? log.onPersonScroll : undefined}
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto',
            PADDING[bodyPadding],
            scroll?.fade &&
              '[mask-image:linear-gradient(to_bottom,transparent_0,#000_var(--oui-panel-fade))] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0,#000_var(--oui-panel-fade))]',
            scroll?.thinScrollbar &&
              '[scrollbar-color:var(--oui-panel-scrollbar-thumb)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[var(--oui-panel-scrollbar-size)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color:var(--oui-panel-scrollbar-thumb)] [&::-webkit-scrollbar-track]:bg-transparent',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
            bodyClassName,
          )}
        >
          {showEmpty && empty ? <Empty variant="tile" {...empty} /> : children}
          {follow && !log.following ? (
            // Sticky and zero-height: the pill rides the bottom-right of the visible body without taking space or leaving the panel.
            <div data-slot="panel-jump" className="sticky bottom-2.5 mt-auto flex h-0 flex-none justify-end overflow-visible pr-2.5">
              <Button
                buttonSize="sm"
                tone="accent"
                icon={<ArrowDown />}
                aria-label={missedText ? `${jumpLabel}, ${missedText}` : jumpLabel}
                className="-translate-y-full rounded-full shadow-md"
                onClick={jump}
              >
                {jumpLabel}
                {missedText ? (
                  <span data-slot="panel-jump-count" className="font-mono text-[11px] opacity-80">
                    {missedText}
                  </span>
                ) : null}
              </Button>
            </div>
          ) : null}
        </div>

        {hasDock ? (
          <div
            data-slot="panel-dock"
            className={cn(
              'flex flex-none flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-solid px-2.5 py-2',
              'border-[color:var(--oui-panel-divider)]',
              BG_DOCK,
              dockClassName,
            )}
          >
            {dock}
          </div>
        ) : null}
      </Root>
    );
  },
);
Panel.displayName = 'Panel';
