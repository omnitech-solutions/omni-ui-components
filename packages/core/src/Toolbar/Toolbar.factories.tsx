import * as React from 'react';
import { ChevronDown, GraduationCap, Keyboard } from 'lucide-react';

import { ActionMenu } from '@oc-tech/omni-ui-components/ActionMenu';
import { Button } from '@oc-tech/omni-ui-components/Button';
import { IconButton } from '@oc-tech/omni-ui-components/IconButton';
import { SegmentedPrimitive } from '@oc-tech/omni-ui-components/Segmented';
import { Toolbar, type ToolbarProps, type ToolbarSize } from '@oc-tech/omni-ui-components/Toolbar';
import { answerStyleMenuSpec, answerStyleOptions, shortcutsMenu } from '../ActionMenu/ActionMenu.factories';
import { SAMPLE_PANELS } from '../Segmented/Segmented.factories';
import { CaptureSplitButtonDemo, MicSplitButtonDemo, type CaptureState, type MicState, type OnAction } from '../SplitButton/SplitButton.factories';
import type { Variant } from '../../internal/support/makeFactory';

/** The three window dots of the Native App window: story-only chrome, passed through the `leading` slot. */
export const WindowDotsSample: React.FC = () => (
  <span className="flex gap-[7px] pr-1.5 pl-0.5" aria-hidden="true">
    {['#ff5f57', '#febc2e', '#28c840'].map((color) => (
      <span key={color} className="size-3 rounded-full" style={{ background: color }} />
    ))}
  </span>
);

/** Filled half-circle "contrast" glyph (the board's see-through icon): outline circle with the right half solid. */
export const ContrastFilledIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
  </svg>
);

/** The default foreground for the ghost controls at the end of the toolbar (brighter than the muted ghost colour). */
const BRIGHT_GHOST = 'text-[color:var(--oui-tone-neutral-fg)]';

export interface NativeToolbarDemoProps {
  capture: CaptureState;
  mic: MicState;
  /** Visible panels (Segmented values). */
  panels?: string[];
  /** Initial answer style id. */
  style?: string;
  size?: ToolbarSize;
  variant?: ToolbarProps['variant'];
  separators?: boolean;
  /** Reports every interaction as `(name, detail)`. Storybook wires it to the Actions panel. */
  onAction?: OnAction;
}

/**
 * The Native App toolbar (board 1a) from library parts only, with working state: capture and mic are
 * the SplitButton demos, the answer-style trigger shows the chosen style, the panel toggles keep the last one on.
 */
export const NativeToolbarDemo: React.FC<NativeToolbarDemoProps> = ({
  capture,
  mic,
  panels = ['chat', 'answer', 'code'],
  style = 'dsa',
  size = 'control',
  variant = 'floating',
  separators = true,
  onAction,
}) => {
  const [styleId, setStyleId] = React.useState(style);
  React.useEffect(() => setStyleId(style), [style]);
  const [panelValues, setPanelValues] = React.useState(panels);
  React.useEffect(() => setPanelValues(panels), [panels.join(',')]);
  const styleLabel = answerStyleOptions.find((option) => option.id === styleId)?.label ?? '';

  return (
    <Toolbar
      label="Live session controls"
      size={size}
      variant={variant}
      separators={separators}
      leading={<WindowDotsSample />}
      groups={[
        {
          id: 'sensors',
          label: 'Capture and microphone',
          children: (
            <>
              <CaptureSplitButtonDemo initial={capture} onAction={onAction} />
              <MicSplitButtonDemo initial={mic} onAction={onAction} />
            </>
          ),
        },
        {
          id: 'style',
          label: 'Answer style',
          children: (
            <ActionMenu
              {...answerStyleMenuSpec(styleId)}
              onValueChange={(_sectionId, id) => {
                setStyleId(id);
                onAction?.('answer-style:select', id);
              }}
              trigger={
                <Button
                  buttonSize={size}
                  tone="neutral"
                  icon={<GraduationCap className="text-[color:var(--oui-foreground-muted)]" />}
                  iconAfter={<ChevronDown className="size-4 text-[color:var(--oui-foreground-muted)]" />}
                  labelMaxWidth="var(--oui-control-label-max)"
                  data-testid="answer-style-trigger"
                >
                  {styleLabel}
                </Button>
              }
            />
          ),
        },
        {
          id: 'panels',
          label: 'Panels',
          children: (
            <SegmentedPrimitive
              mode="multiple"
              appearance="control"
              minActive={1}
              minActiveReason="At least one panel stays visible"
              value={panelValues}
              options={SAMPLE_PANELS}
              aria-label="Visible panels"
              onChange={(next) => {
                setPanelValues(next);
                onAction?.('panels:change', next);
              }}
            />
          ),
        },
        {
          id: 'tools',
          label: 'Tools',
          children: (
            <>
              <IconButton
                variant="ghost"
                iconSize={size}
                icon={<ContrastFilledIcon />}
                className={BRIGHT_GHOST}
                label="See-through"
                tooltip="See-through"
                onClick={() => onAction?.('see-through:press')}
              />
              <ActionMenu
                {...shortcutsMenu}
                align="end"
                trigger={
                  <IconButton
                    variant="ghost"
                    iconSize={size}
                    icon={<Keyboard />}
                    className={BRIGHT_GHOST}
                    label="Shortcuts"
                    tooltip="Keyboard shortcuts"
                  />
                }
              />
            </>
          ),
        },
      ]}
    />
  );
};

/** The seven states of board 1a, in design order. */
export const toolbarVariants: Variant<NativeToolbarDemoProps>[] = [
  { name: 'Live · manual', args: { capture: { mode: 'manual' }, mic: { status: 'listening' } } },
  { name: 'Live · auto (blue tint)', args: { capture: { mode: 'auto' }, mic: { status: 'listening' } } },
  { name: 'Analysing (ring)', args: { capture: { mode: 'manual', analysing: true }, mic: { status: 'listening' } } },
  { name: 'Mic lost · retrying', args: { capture: { mode: 'manual' }, mic: { status: 'lost' } } },
  { name: 'Screen permission lost', args: { capture: { mode: 'manual', problem: true }, mic: { status: 'listening' } } },
  { name: 'Mic muted by you', args: { capture: { mode: 'manual' }, mic: { status: 'muted' } } },
  { name: 'Paused · code hidden', args: { capture: { mode: 'manual', paused: true }, mic: { status: 'paused' }, panels: ['chat', 'answer'] } },
];

/** Labelled (52px) rows: icon with a caption underneath. */
export const toolbarLabelledVariants: Variant<NativeToolbarDemoProps>[] = [
  { name: 'Labelled · live manual', args: { capture: { mode: 'manual' }, mic: { status: 'listening' }, size: 'control-labelled' } },
  { name: 'Labelled · mic lost', args: { capture: { mode: 'manual' }, mic: { status: 'lost' }, size: 'control-labelled' } },
];

/** Build `<NativeToolbarDemo>` props for standalone stories and tests. */
export const nativeToolbarDemoPropsFactory = (overrides: Partial<NativeToolbarDemoProps> = {}): NativeToolbarDemoProps => ({
  ...toolbarVariants[0].args,
  ...overrides,
  capture: { ...toolbarVariants[0].args.capture, ...overrides.capture } as CaptureState,
  mic: { ...toolbarVariants[0].args.mic, ...overrides.mic } as MicState,
});
