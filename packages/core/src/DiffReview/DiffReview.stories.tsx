import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { DiffReview, type DiffReviewProps } from '@oc-tech/omni-ui-components/DiffReview';
import {
  DIFF_REVIEW_STATUSES,
  DiffReviewDemo,
  diffReviewPropsFactory,
  longChange,
  phaseActions,
  sampleChanges,
} from 'factories/omni-ui-components/DiffReview/DiffReview.factories';

type StoryArgs = DiffReviewProps & { onAction?: (name: string, detail?: unknown) => void };

const Stage: React.FC<React.PropsWithChildren<{ width?: number }>> = ({ width = 640, children }) => (
  <div className="p-6">
    <div style={{ maxWidth: width }}>{children}</div>
  </div>
);

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/DiffReview',
  component: DiffReview as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A reviewable <primary>proposed change</primary>. Each change carries its text before and after. The `diff` variant shows one tab per change with a unified diff (changed lines plus <primary>one line of context</primary>, `⋯` where lines are hidden, +n/−n counts); the `checklist` variant shows one tickable row per change for a <primary>partial apply</primary>. A <primary>status pill</primary>, a footer note and caller-defined `actions` frame it. The card keeps only the open tab and the unticked ids: every transition belongs to the caller, and `phaseActions` (in the factories) reproduces the standard button table per phase. Syntax colours come from the `highlight` prop (the library `highlightLines`); without it lines are plain. Tabs: Left / Right (wrapping), Home and End. <primary>Callbacks</primary>\n\n| Prop | Fires when | Payload |\n|---|---|---|\n| `actions[].onClick` | an action button is chosen (the button exists only with it) | `{ changes, selected, variant, status }`: the full change objects, by reference (all in the diff variant). The host works here, then changes `status` |\n| `onSelectionChange` | a checklist row is ticked or unticked, controlled or not | the ticked change objects (`C[]`) in change order |\n| `onTabChange` | another tab opens (click or keys), controlled or not | the change object (`C`) |\n',
      },
    },
  },
  args: { ...diffReviewPropsFactory() },
  argTypes: {
    changes: { control: 'object', description: 'Reviewable surfaces: `{ id, label, description?, icon?, language?, before, after }`.' },
    status: { control: 'select', options: DIFF_REVIEW_STATUSES, description: 'Where the proposal is. Drives the pill and the footer note.' },
    variant: { control: 'inline-radio', options: ['diff', 'checklist'], description: 'Checklist needs more than one change; with one it falls back to diff.' },
    highlight: { control: false, description: 'A HighlightFn (`highlightLines`). Unset: plain text. The language is each change\'s `language`.' },
    contextLines: { control: { type: 'number', min: 0, max: 6 }, description: 'Unchanged lines kept around each change. Default 1.' },
    actions: { control: false, description: 'Footer buttons `{ key, label | (ctx) => label, primary, disabled | (ctx) => boolean, icon, onClick({ changes, selected }) }`.' },
    note: { control: 'text', description: 'Replaces the status note.' },
    product: { control: 'text', description: 'Fills `{product}` in the notes.' },
    fallback: { control: false, description: 'Shown instead of the diff when `changes` is empty.' },
    labels: { control: 'object', description: 'Every string (partial). Counts and the apply label are functions.' },
    icons: { control: false, description: 'Caller-supplied nodes: badge, checklistBadge, change, notes per status.' },
    defaultActiveId: { control: 'text' },
    onTabChange: { action: 'tab' },
    onSelectionChange: { action: 'selection' },
    onAction: { action: 'transition', description: 'Story-only: the demo reports apply, reject, preview, undo, restore.' },
  },
  render: (args) => {
    const { onAction, ...props } = args;
    return (
      <Stage>
        <DiffReviewDemo {...props} onAction={onAction} />
      </Stage>
    );
  },
};
export default meta;

type Story = StoryObj<StoryArgs>;

/** The diff variant, pending: Reject, Preview in app and Apply. Apply walks the card through its phases (Applied, Undo, Rolled back, Re-apply). */
export const Default: Story = {};

/** The checklist variant: all rows ticked, Apply follows the selection (Apply all / Apply 2 / disabled at none). */
export const Checklist: Story = {
  args: { variant: 'checklist', onAction: fn() },
  /** Interaction: untick one (Apply 2), untick all (Apply 0 is off), tick again, apply the ticked changes. */
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Apply all' })).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Code' }));
    await expect(canvas.getByRole('button', { name: 'Apply 2' })).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Notes' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Tests' }));
    await expect(canvas.getByRole('button', { name: 'Apply 0' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Notes' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Apply 1' }));
    await waitFor(() => expect(args.onAction).toHaveBeenCalledWith('apply', ['notes']));
    await expect(canvasElement.querySelector('[data-slot="diff-review-status"]')).toHaveTextContent('Applied');
  },
};

/** Two changes read "Apply both". */
export const ChecklistTwoChanges: Story = { args: { variant: 'checklist', changes: sampleChanges(2) } };

/** Tabs with the keyboard: Right / Left wrap, End / Home jump; the tab list is one tab stop (roving tabindex). */
export const KeyboardTabs: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [notes, code, tests] = canvas.getAllByRole('tab');
    await userEvent.tab();
    await expect(notes).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(code).toHaveFocus();
    await expect(code).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    await expect(tests).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(notes).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(tests).toHaveFocus();
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('keeps a contained interval');
  },
};

/** Every phase with the buttons `phaseActions` gives it. The note and pill come from `labels`. */
export const EveryStatus: Story = {
  parameters: { layout: 'padded' },
  render: ({ onAction: _onAction, ...args }) => (
    <div className="grid gap-5 p-6 [grid-template-columns:repeat(auto-fill,minmax(520px,1fr))]">
      {DIFF_REVIEW_STATUSES.map((status) => (
        <div key={status} className="flex flex-col gap-1">
          <span className="font-mono text-[11px] text-muted-foreground">{status}</span>
          <DiffReview
            {...args}
            status={status}
            variant="diff"
            actions={phaseActions({ status, onApply: fn(), onReject: fn(), onPreview: fn(), onStopPreview: fn(), onUndo: fn(), onRestore: fn() })}
          />
        </div>
      ))}
    </div>
  ),
};

/** The same change with and without the `highlight` prop. */
export const WithAndWithoutHighlighting: Story = {
  parameters: { layout: 'padded' },
  render: ({ onAction: _onAction, ...args }) => (
    <div className="flex flex-wrap gap-6 p-6">
      {[true, false].map((on) => (
        <div key={String(on)} className="flex w-[520px] flex-col gap-1">
          <span className="font-mono text-[11px] text-muted-foreground">{on ? 'highlight={highlightLines}' : 'no highlight'}</span>
          <DiffReview {...args} changes={[sampleChanges()[1]!]} highlight={on ? args.highlight : undefined} actions={[]} />
        </div>
      ))}
    </div>
  ),
};

/** Two edits far apart: the lines between collapse into a `⋯` row. `contextLines` widens the window. */
export const LongDiff: Story = { args: { changes: [longChange()], contextLines: 1 } };

/** No changes could be described: the raw proposal in the `fallback` slot. */
export const FallbackWhenEmpty: Story = {
  args: { changes: [], fallback: '{\n  "patch": {\n    "notes": "Sweep once instead of merging pairwise",\n    "code": "mergeIntervals.ts"\n  }\n}' },
};

/** Conflicted: the note is replaced by the caller's explanation and no action is offered. */
export const ConflictedWithNote: Story = {
  args: { status: 'conflicted', note: 'Notes changed while you were reviewing. Ask for a fresh proposal.' },
};

/** Strings through `labels`: translated title, pills and notes. */
export const TranslatedLabels: Story = {
  args: {
    labels: {
      region: 'Cambio propuesto',
      title: 'Cambio propuesto',
      summary: (n, a, r) => `${n} superficies · +${a} −${r}`,
      statuses: { pending: 'Sin aplicar', preview: 'Vista previa', applied: 'Aplicado', rejected: 'Rechazado', reverted: 'Revertido', conflicted: 'Sin aplicar' },
      notes: { pending: 'Aún no se aplicó nada', preview: 'Mostrando en {product}', applied: 'Aplicado en {product}', rejected: 'Rechazado', reverted: 'Revertido', conflicted: 'Conflicto en {product}' },
    },
  },
};
