import { Button } from '@oc-tech/omni-ui-components/Button';
import {
  Splitter,
  SplitterPanel,
  type SplitterProps,
  type SplitterSizes,
} from '@oc-tech/omni-ui-components/Splitter';
import { RotateCcw } from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../internal/support/makeFactory';

/** Build `<Splitter>` props for stories and tests: a resizable row. */
export const splitterPropsFactory = (overrides: Partial<SplitterProps> = {}): SplitterProps => ({
  resizable: true,
  orientation: 'horizontal',
  ...overrides,
});

export interface SplitterDemoProps extends Partial<SplitterProps> {
  /** Give the side panels a floor and a ceiling (list 160 to 360, side 200 to 480; the middle keeps 240). */
  limits?: boolean;
  /** Show a "Reset layout" button that changes `resetKey`. */
  reset?: boolean;
  /** The middle panel paints nothing: a see-through gap between two surfaces. */
  gap?: boolean;
  /** Height of the demo in px. */
  height?: number;
  /** Story-only: reports `sizes`, `resize:start`, `resize:end` and `reset`. */
  onAction?: (name: string, detail?: unknown) => void;
}

const PANE =
  'box-border h-full rounded-lg border border-solid border-[color:var(--oui-panel-border)] bg-[color:var(--oui-panel-bg)] p-3 text-[13px] text-[color:var(--oui-tone-neutral-fg)]';

const Pane: React.FC<{ title: string; size?: number | undefined }> = ({ title, size }) => (
  <div className={PANE}>
    <div className="font-semibold">{title}</div>
    <div className="font-mono text-xs text-[color:var(--oui-panel-meta-fg)]">
      {size === undefined ? 'takes the rest' : `${size}px`}
    </div>
  </div>
);

/**
 * A splitter that keeps its own sizes and shows them: three columns (list, main, side), or a stack (top, rest)
 * when `orientation` is `vertical`. Without `resizable` it is the static layout.
 */
export const SplitterDemo: React.FC<SplitterDemoProps> = ({
  limits = false,
  reset = false,
  gap = false,
  height = 220,
  onAction,
  ...props
}) => {
  const [sizes, setSizes] = React.useState<SplitterSizes>({});
  const [resetKey, setResetKey] = React.useState(0);
  const merged = splitterPropsFactory(props);
  const shared: SplitterProps = {
    ...merged,
    resetKey,
    onSizesChange: (next) => {
      setSizes(next);
      onAction?.('sizes', next);
    },
    onResizeStart: (id) => onAction?.('resize:start', id),
    onResizeEnd: (id, next) => onAction?.('resize:end', { id, sizes: next }),
  };
  return (
    <div className="flex flex-col gap-2">
      {reset ? (
        <div>
          <Button
            buttonSize="sm"
            variant="outline"
            icon={<RotateCcw />}
            onClick={() => {
              setResetKey((current) => current + 1);
              onAction?.('reset');
            }}
          >
            Reset layout
          </Button>
        </div>
      ) : null}
      <div style={{ height }}>
        {merged.orientation === 'vertical' ? (
          <Splitter {...shared} className="h-full">
            <SplitterPanel
              id="top"
              label="top panel"
              defaultSize={90}
              {...(limits ? { minSize: 0, maxSize: 150 } : {})}
            >
              <Pane title="Top" size={sizes.top ?? 90} />
            </SplitterPanel>
            <SplitterPanel id="rest" {...(limits ? { minSize: 60 } : {})}>
              <Pane title="Rest" />
            </SplitterPanel>
          </Splitter>
        ) : (
          <Splitter {...shared} className="h-full">
            <SplitterPanel
              id="list"
              label="list"
              defaultSize={180}
              {...(limits ? { minSize: 160, maxSize: 360 } : {})}
            >
              <Pane title="List" size={sizes.list ?? 180} />
            </SplitterPanel>
            <SplitterPanel
              id="main"
              {...(limits ? { minSize: 240 } : {})}
              {...(gap ? { role: 'img', 'aria-label': 'See-through gap' } : {})}
            >
              {gap ? null : <Pane title="Main" />}
            </SplitterPanel>
            <SplitterPanel
              id="side"
              label="side"
              defaultSize={220}
              {...(limits ? { minSize: 200, maxSize: 480 } : {})}
            >
              <Pane title="Side" size={sizes.side ?? 220} />
            </SplitterPanel>
          </Splitter>
        )}
      </div>
    </div>
  );
};

export const splitterVariants: Variant<SplitterDemoProps>[] = [
  { name: 'Static (not resizable)', args: { resizable: false } },
  { name: 'Draggable, horizontal', args: {} },
  { name: 'Draggable, vertical', args: { orientation: 'vertical' } },
  { name: 'With limits (list 160 to 360, side 200 to 480)', args: { limits: true } },
  { name: 'Reset layout', args: { reset: true } },
  { name: 'See-through gap in the middle', args: { gap: true } },
];
