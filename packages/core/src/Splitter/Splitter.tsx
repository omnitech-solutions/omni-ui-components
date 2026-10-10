import { cn } from 'lib/utils';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import type {
  SplitterEdge,
  SplitterLabels,
  SplitterPanelProps,
  SplitterProps,
  SplitterSizes,
} from './Splitter.types';

/** English strings of {@link Splitter}. */
export const DEFAULT_SPLITTER_LABELS: SplitterLabels = {
  handle: (panel) => `Resize ${panel}`,
  hint: 'Drag to resize. Double-click to reset.',
  edge: (edge, orientation) =>
    orientation === 'horizontal'
      ? `Resize from the ${edge === 'start' ? 'left' : 'right'} edge`
      : `Resize from the ${edge === 'start' ? 'top' : 'bottom'} edge`,
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
 * Slots: `data-slot="splitter" | "splitter-panel" | "splitter-handle" | "splitter-edge"`.
 *
 * `edges` adds a handle at an outer edge that resizes what holds the splitter (a window, a drawer): it reports
 * the size wanted through `onExtentChange` and the caller applies it.
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
  overflow = 'scroll',
  sizes: sizesProp,
  defaultSizes,
  onSizesChange,
  onResizeStart,
  onResizeEnd,
  resetKey,
  keyboardStep = DEFAULT_STEP,
  handleProps,
  edges,
  extent,
  minExtent = 0,
  maxExtent = Number.POSITIVE_INFINITY,
  edgeAnchor = 'opposite',
  onExtentChange,
  onExtentReset,
  labels: labelOverrides,
  ...props
}: SplitterProps) => {
  const labels = { ...DEFAULT_SPLITTER_LABELS, ...labelOverrides };
  const horizontal = orientation === 'horizontal';
  const root = React.useRef<HTMLDivElement>(null);

  // A row that really scrolls is a tab stop, so the panels past the edge are reached without a mouse.
  const panelCount = React.Children.count(children);
  const [scrolls, setScrolls] = React.useState(false);
  React.useLayoutEffect(() => {
    const element = root.current;
    if (!element || overflow !== 'scroll') {
      setScrolls(false);
      return;
    }
    const measure = () =>
      setScrolls(
        horizontal
          ? element.scrollWidth > element.clientWidth
          : element.scrollHeight > element.clientHeight,
      );
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [overflow, horizontal, panelCount]);

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
    // Not laid out yet (first render, a hidden root): there is no room to measure, so only the panel's own limits hold.
    const measured = root.current
      ? horizontal
        ? root.current.clientWidth
        : root.current.clientHeight
      : 0;
    const total = measured > 0 ? measured : Number.POSITIVE_INFINITY;
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

  // What a handle reports as its most: the bound when there is one, never "Infinity".
  const ceiling = (panel: PanelSpec, size: number) => {
    const most = bound(panel, Number.POSITIVE_INFINITY, sizes);
    return Number.isFinite(most) ? most : Math.max(size, panel.props.maxSize ?? size);
  };
  const drag = React.useRef<{ id: string; at: number; size: number; latest: SplitterSizes } | null>(
    null,
  );

  const edgeDrag = React.useRef<{ at: number; extent: number } | null>(null);

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
        aria-valuemax={ceiling(panel, size)}
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
                    ? ceiling(panel, size)
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

  // A handle at an outer edge: it resizes what holds the splitter, so it only reports the size wanted.
  const grip = (
    <span
      aria-hidden="true"
      className={cn(
        'rounded-full bg-[color:var(--oui-panel-divider)] transition-colors group-hover/handle:bg-[color:var(--oui-foreground-muted)] group-focus-visible/handle:bg-[color:var(--oui-tone-accent-fg)] motion-reduce:transition-none',
        horizontal ? 'h-11 w-1' : 'h-1 w-11',
      )}
    />
  );
  const edgeHandle = (edge: SplitterEdge) => {
    const outward = edge === 'start' ? -1 : 1;
    const factor = edgeAnchor === 'centre' ? 2 : 1;
    const measured = () =>
      extent ??
      (root.current ? (horizontal ? root.current.offsetWidth : root.current.offsetHeight) : 0);
    const want = (from: number, moved: number) =>
      onExtentChange?.(
        Math.round(Math.min(Math.max(from + factor * outward * moved, minExtent), maxExtent)),
        edge,
      );
    const finish = () => {
      if (!edgeDrag.current) return;
      edgeDrag.current = null;
      onResizeEnd?.(`edge:${edge}`, sizes);
    };
    const now = measured();
    return (
      // biome-ignore lint/a11y/useSemanticElements: a focusable, valued separator is the window-splitter pattern; <hr> cannot hold a value
      <div
        key={`edge:${edge}`}
        role="separator"
        tabIndex={0}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        aria-label={labels.edge(edge, orientation)}
        aria-valuemin={minExtent}
        aria-valuemax={Number.isFinite(maxExtent) ? maxExtent : Math.max(now, minExtent)}
        aria-valuenow={now}
        title={labels.hint}
        data-slot="splitter-edge"
        data-edge={edge}
        {...handleProps}
        className={cn(
          'group/handle grid shrink-0 touch-none place-items-center outline-none',
          horizontal ? 'cursor-ew-resize' : 'cursor-ns-resize',
          handleProps?.className,
        )}
        style={{ flex: `0 0 ${HANDLE_PX}px`, ...handleProps?.style }}
        onPointerDown={(event) => {
          // Screen coordinates: the container may move under the pointer as it grows.
          edgeDrag.current = {
            at: horizontal ? event.screenX : event.screenY,
            extent: measured(),
          };
          event.currentTarget.setPointerCapture?.(event.pointerId);
          onResizeStart?.(`edge:${edge}`);
        }}
        onPointerMove={(event) => {
          const held = edgeDrag.current;
          if (!held) return;
          want(held.extent, (horizontal ? event.screenX : event.screenY) - held.at);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onDoubleClick={() => onExtentReset?.(edge)}
        onKeyDown={(event) => {
          const forward = horizontal ? 'ArrowRight' : 'ArrowDown';
          const back = horizontal ? 'ArrowLeft' : 'ArrowUp';
          if (event.key === 'Enter') {
            event.preventDefault();
            onExtentReset?.(edge);
            return;
          }
          const moved =
            event.key === forward ? keyboardStep : event.key === back ? -keyboardStep : null;
          if (moved === null) return;
          event.preventDefault();
          want(measured(), moved);
        }}
      >
        {grip}
      </div>
    );
  };

  const rendered: React.ReactNode[] = [];
  if (edges?.includes('start')) rendered.push(edgeHandle('start'));
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
  if (edges?.includes('end')) rendered.push(edgeHandle('end'));

  return (
    <div
      ref={root}
      tabIndex={scrolls ? 0 : undefined}
      data-slot="splitter"
      data-orientation={orientation}
      data-overflow={overflow}
      className={cn(
        'flex min-h-0 min-w-0',
        horizontal ? 'w-full flex-row' : 'h-full flex-col',
        // Panels that need more room than there is are reached by scrolling, never cut off.
        overflow === 'scroll' && [
          horizontal ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto overflow-x-hidden',
          '[scrollbar-color:var(--oui-panel-scrollbar-thumb)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-[var(--oui-panel-scrollbar-size)] [&::-webkit-scrollbar]:w-[var(--oui-panel-scrollbar-size)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color:var(--oui-panel-scrollbar-thumb)] [&::-webkit-scrollbar-track]:bg-transparent',
        ],
        className,
      )}
      {...props}
    >
      {rendered}
    </div>
  );
};
Splitter.displayName = 'Splitter';
