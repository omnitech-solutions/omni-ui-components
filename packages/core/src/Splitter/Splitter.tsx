import { cn } from 'lib/utils';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import type {
  SplitterLabels,
  SplitterPanelProps,
  SplitterProps,
  SplitterSizes,
} from './Splitter.types';

/** English strings of {@link Splitter}. */
export const DEFAULT_SPLITTER_LABELS: SplitterLabels = {
  handle: (panel) => `Resize ${panel}`,
  hint: 'Drag to resize. Double-click to reset.',
};

const HANDLE_PX = 8;
const DEFAULT_STEP = 24;

/**
 * One panel of a {@link Splitter}. A panel with a numeric `defaultSize` (px) has a size of its own and, in a
 * `resizable` splitter, a handle; a panel with none takes the room that is left.
 *
 * Slot: `data-slot="splitter-panel"`.
 */
export const SplitterPanel = ({
  defaultSize,
  minSize: _min,
  maxSize: _max,
  label: _label,
  style,
  ...props
}: SplitterPanelProps) => (
  <div
    data-slot="splitter-panel"
    style={{ flexBasis: defaultSize, flexGrow: 1, ...style }}
    {...props}
  />
);
SplitterPanel.displayName = 'SplitterPanel';

type PanelSpec = {
  key: string;
  id: string;
  props: SplitterPanelProps;
  sized: boolean;
  fallback: number;
};

const isPanel = (child: React.ReactNode): child is React.ReactElement<SplitterPanelProps> =>
  React.isValidElement(child) && child.type === SplitterPanel;

/**
 * Omni Splitter: panels side by side (or stacked). Static by default. With `resizable`, a handle sits between
 * panels: drag it, or focus it and use the arrow keys, Home and End; double-click (or Enter) puts that panel back
 * to its default size. Sizes are px by panel `id`, controlled (`sizes`) or kept inside (`defaultSizes`);
 * `onSizesChange` fires either way. A panel is never sized past its `minSize` / `maxSize` or past the room the
 * other panels leave. Change `resetKey` to put every panel back.
 *
 * Slots: `data-slot="splitter" | "splitter-panel" | "splitter-handle"`.
 *
 * @example
 * <Splitter resizable onSizesChange={save}>
 *   <SplitterPanel id="list" label="List" defaultSize={250} maxSize={360} />
 *   <SplitterPanel id="main" />
 *   <SplitterPanel id="side" label="Side" defaultSize={400} />
 * </Splitter>
 */
export const Splitter = ({
  className,
  children,
  resizable = false,
  orientation = 'horizontal',
  sizes: sizesProp,
  defaultSizes,
  onSizesChange,
  onResizeStart,
  onResizeEnd,
  resetKey,
  keyboardStep = DEFAULT_STEP,
  handleProps,
  labels: labelOverrides,
  ...props
}: SplitterProps) => {
  const labels = { ...DEFAULT_SPLITTER_LABELS, ...labelOverrides };
  const horizontal = orientation === 'horizontal';
  const root = React.useRef<HTMLDivElement>(null);

  const panels: PanelSpec[] = [];
  React.Children.forEach(children, (child, index) => {
    if (!isPanel(child)) return;
    const id = child.props.id ?? `panel-${index}`;
    const sized = typeof child.props.defaultSize === 'number';
    panels.push({
      key: String(child.key ?? id),
      id,
      props: child.props,
      sized,
      fallback: sized ? (child.props.defaultSize as number) : 0,
    });
  });

  // The defaults are what the panels were first given; later renders do not move them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: computed once per panel set
  const defaults = React.useMemo(() => {
    const next: SplitterSizes = {};
    for (const panel of panels)
      if (panel.sized) next[panel.id] = defaultSizes?.[panel.id] ?? panel.fallback;
    return next;
  }, [panels.map((panel) => `${panel.id}:${panel.fallback}`).join('|'), defaultSizes]);

  const [sizes, setSizes] = useControllableState<SplitterSizes>(sizesProp, defaults, onSizesChange);

  const firstReset = React.useRef(true);
  // biome-ignore lint/correctness/useExhaustiveDependencies: only a changed resetKey resets
  React.useEffect(() => {
    if (firstReset.current) {
      firstReset.current = false;
      return;
    }
    setSizes(defaults);
  }, [resetKey]);

  // [GUARD] A panel never passes its own limits, nor the room the others (and the handles) leave.
  const bound = (panel: PanelSpec, wanted: number, current: SplitterSizes) => {
    const total = root.current
      ? horizontal
        ? root.current.clientWidth
        : root.current.clientHeight
      : Number.POSITIVE_INFINITY;
    const others = panels.reduce((sum, each) => {
      if (each.id === panel.id) return sum;
      return sum + (each.sized ? (current[each.id] ?? each.fallback) : (each.props.minSize ?? 0));
    }, 0);
    const handles = panels.filter((each) => each.sized).length * HANDLE_PX;
    const room = Math.max(0, total - others - handles);
    const max = Math.min(panel.props.maxSize ?? Number.POSITIVE_INFINITY, room);
    return Math.round(Math.min(Math.max(wanted, panel.props.minSize ?? 0), max));
  };
  const resize = (panel: PanelSpec, wanted: number): SplitterSizes => {
    const next = { ...sizes, [panel.id]: bound(panel, wanted, sizes) };
    if (next[panel.id] !== sizes[panel.id]) setSizes(next);
    return next;
  };

  const drag = React.useRef<{ id: string; at: number; size: number; latest: SplitterSizes } | null>(
    null,
  );

  if (!resizable) {
    return (
      <div
        data-slot="splitter"
        className={cn('flex min-h-0 w-full divide-x overflow-hidden rounded-lg border', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  // A handle belongs to a sized panel and sits on the side that faces the room it trades with: after the panel
  // when a later panel is flexible (or there is none), before it otherwise.
  const flexibleAfter = (index: number) => panels.slice(index + 1).some((each) => !each.sized);
  const handleFor = (panel: PanelSpec, sign: 1 | -1) => {
    const size = sizes[panel.id] ?? panel.fallback;
    const name = panel.props.label ?? panel.id;
    const finish = () => {
      const held = drag.current;
      drag.current = null;
      if (held) onResizeEnd?.(held.id, held.latest);
    };
    return (
      // biome-ignore lint/a11y/useSemanticElements: a focusable, valued separator is the window-splitter pattern; <hr> cannot hold a value
      <div
        key={`${panel.key}:handle`}
        role="separator"
        tabIndex={0}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-label={labels.handle(name)}
        aria-valuemin={panel.props.minSize ?? 0}
        aria-valuemax={bound(panel, Number.POSITIVE_INFINITY, sizes)}
        aria-valuenow={size}
        title={labels.hint}
        data-slot="splitter-handle"
        data-panel={panel.id}
        {...handleProps}
        className={cn(
          'group/handle grid shrink-0 touch-none place-items-center outline-none',
          horizontal ? 'cursor-col-resize' : 'cursor-row-resize',
          handleProps?.className,
        )}
        style={{ flex: `0 0 ${HANDLE_PX}px`, ...handleProps?.style }}
        onPointerDown={(event) => {
          drag.current = {
            id: panel.id,
            at: horizontal ? event.clientX : event.clientY,
            size,
            latest: sizes,
          };
          event.currentTarget.setPointerCapture?.(event.pointerId);
          onResizeStart?.(panel.id);
        }}
        onPointerMove={(event) => {
          const held = drag.current;
          if (!held) return;
          const moved = (horizontal ? event.clientX : event.clientY) - held.at;
          held.latest = resize(panel, held.size + sign * moved);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onDoubleClick={() => resize(panel, defaults[panel.id] ?? panel.fallback)}
        onKeyDown={(event) => {
          const grow = horizontal ? 'ArrowRight' : 'ArrowDown';
          const shrink = horizontal ? 'ArrowLeft' : 'ArrowUp';
          const next =
            event.key === grow
              ? size + sign * keyboardStep
              : event.key === shrink
                ? size - sign * keyboardStep
                : event.key === 'Home'
                  ? (panel.props.minSize ?? 0)
                  : event.key === 'End'
                    ? Number.POSITIVE_INFINITY
                    : event.key === 'Enter'
                      ? (defaults[panel.id] ?? panel.fallback)
                      : null;
          if (next === null) return;
          event.preventDefault();
          resize(panel, next);
        }}
      >
        <span
          aria-hidden="true"
          className={cn(
            'rounded-full bg-[color:var(--oui-panel-divider)] transition-colors group-hover/handle:bg-[color:var(--oui-foreground-muted)] group-focus-visible/handle:bg-[color:var(--oui-tone-accent-fg)] motion-reduce:transition-none',
            horizontal ? 'h-11 w-1' : 'h-1 w-11',
          )}
        />
      </div>
    );
  };

  const rendered: React.ReactNode[] = [];
  let at = 0;
  React.Children.forEach(children, (child) => {
    if (!isPanel(child)) {
      rendered.push(child);
      return;
    }
    const panel = panels[at] as PanelSpec;
    const index = at;
    at += 1;
    const after = flexibleAfter(index) || index === 0;
    const {
      defaultSize: _d,
      minSize: _mn,
      maxSize: _mx,
      label: _l,
      style,
      id: _id,
      ...rest
    } = child.props;
    const size = sizes[panel.id] ?? panel.fallback;
    const body = (
      <div
        key={panel.key}
        data-slot="splitter-panel"
        data-panel={panel.id}
        {...rest}
        style={{
          flex: panel.sized ? `0 0 ${size}px` : '1 1 0',
          [horizontal ? 'minWidth' : 'minHeight']: panel.sized ? 0 : (panel.props.minSize ?? 0),
          overflow: 'hidden',
          ...style,
        }}
      />
    );
    if (!panel.sized) rendered.push(body);
    else if (after) rendered.push(body, handleFor(panel, 1));
    else rendered.push(handleFor(panel, -1), body);
  });

  return (
    <div
      ref={root}
      data-slot="splitter"
      data-orientation={orientation}
      className={cn(
        'flex min-h-0 min-w-0',
        horizontal ? 'w-full flex-row' : 'h-full flex-col',
        className,
      )}
      {...props}
    >
      {rendered}
    </div>
  );
};
Splitter.displayName = 'Splitter';
