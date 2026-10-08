import { type CueCardProps, HeardLine } from '@oc-tech/omni-ui-components/CueCard';
import type { Meta, StoryObj } from '@storybook/react';
import {
  CueCardDemo,
  type CueSourcedSegment,
  cueClosingSections,
  cueInferredSections,
  heardLinePropsFactory,
  heardLineVariants,
} from 'factories/omni-ui-components/CueCard/CueCard.factories';
import type * as React from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

type StoryArgs = Partial<CueCardProps<CueSourcedSegment>> & {
  heard?: boolean;
  onAction?: (name: string, detail?: unknown) => void;
};

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/CueCard',
  component: CueCardDemo as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '<primary>What to say next</primary>, readable in the two seconds a person has while still listening. The content is structured and the card alone decides how it looks: `sections` (`say`, `anchors`, `ask`, `caution`, `context`) hold one-sentence `lines`, and each piece of a line carries a `role` (`spoken`, `cue`, `evidence`, `caution`, `context`). Evidence is the accent colour, a caution sits in an amber box whose first line names it, context is small and quiet. `mode="compact"` keeps the response, `maxAnchors` anchors and any caution. `status="pending"` says a revision is on its way and leaves what is ready on show. A piece with `grounding: "inferred"` is underlined with a tooltip. A piece with a `source` is a button only when <primary>onSourceSelect(segment)</primary> is given, and the segment arrives by reference: <code>CueCard&lt;S extends CueSegment&gt;</code>. Headings and status text come from `labels`; a section `label` replaces its heading and an empty string draws none. <primary>HeardLine</primary> draws the sentence the card answers: `pieces` with the carrying words `strong`, a `label`, `tone="ask"` for something asked, cut after `maxLines` with the whole sentence in its tooltip.',
      },
    },
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['detail', 'compact'] },
    status: { control: 'inline-radio', options: ['ready', 'pending'] },
    maxAnchors: {
      control: { type: 'number', min: 0 },
      description: 'Anchors a compact card keeps.',
    },
    sections: { control: 'object', description: '`{ kind, label?, lines: { segments }[] }[]`.' },
    labels: { control: 'object', description: '{ sections, preparing, updating, inferred }.' },
    heard: { control: 'boolean', description: 'Story-only: draws a HeardLine above the card.' },
    onAction: { action: 'cue-card', description: 'Story-only: reports onSourceSelect.' },
  },
};
export default meta;
type Story = StoryObj<StoryArgs>;

/** The technical note in detail. Pressing a source reports its segment and names it under the card. */
export const Default: Story = {
  args: { onAction: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Relay' }));
    await expect(args.onAction).toHaveBeenCalledWith(
      'source',
      expect.objectContaining({ text: 'Relay', source: 'roles/relay' }),
    );
    await expect(canvas.getByText('Source: Relay · Staff engineer')).toBeVisible();
  },
};

/** A closing note: the opening phrase is a `cue`, the employers are `evidence`, and there is something to ask. */
export const ClosingNote: Story = {
  args: { sections: cueClosingSections },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('One thing I should have said earlier:')).toHaveAttribute(
      'data-role',
      'cue',
    );
    await expect(canvas.getByText('Ask')).toBeVisible();
  },
};

/** Compact keeps the response, three of the four anchors and the caution; context is left out. */
export const Compact: Story = {
  args: { mode: 'compact' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Context')).toBeNull();
    await expect(
      canvas.queryByText('Nightly reconciliation catches what slips through'),
    ).toBeNull();
    await expect(canvas.getByText('Careful')).toBeVisible();
  },
};

export const CompactTwoAnchors: Story = { args: { mode: 'compact', maxAnchors: 2 } };

/** A newer revision is being prepared: what is ready stays, with a polite status under it. */
export const Pending: Story = {
  args: { status: 'pending' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Updating…');
  },
};

export const PendingWithNothingReady: Story = {
  args: { sections: [], status: 'pending' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Preparing response…',
    );
  },
};

/** An unconfirmed claim is underlined and says so in its tooltip. */
export const InferredClaim: Story = { args: { sections: cueInferredSections } };

export const UnderTheHeardSentence: Story = { args: { heard: true } };

export const CustomLabels: Story = {
  args: {
    status: 'pending',
    labels: {
      sections: { say: 'Sag das', anchors: 'Anker', caution: 'Vorsicht', context: '' },
      updating: 'Wird aktualisiert…',
    },
  },
};

/** HeardLine on its own: asked, plain, cut after one line, and without a label. */
export const HeardLines: Story = {
  render: () => (
    <div className="flex max-w-[560px] flex-col gap-6">
      {heardLineVariants.map((variant) => (
        <HeardLine key={variant.name} {...heardLinePropsFactory(variant.args)} />
      ))}
    </div>
  ),
};
