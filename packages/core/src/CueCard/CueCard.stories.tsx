import { CueCard, type CueCardProps } from '@oc-tech/omni-ui-components/CueCard';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AnswerPanel,
  type Cited,
  ClosingNotePanel,
  CompactNotePanel,
  CompactTwoAnchorsPanel,
  GermanNotePanel,
  HeardPanel,
  LineOnItsOwn,
  PendingNotePanel,
  PreparingNotePanel,
  UnconfirmedNotePanel,
} from 'factories/omni-ui-components/CueCard/CueCard.factories';
import type * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/sourceSnippet';
import factories from './CueCard.factories.tsx?raw';

type StoryArgs = Partial<CueCardProps<Cited>>;

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/CueCard',
  component: CueCard as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    controls: { disable: true },
    docs: {
      description: {
        component:
          '<primary>What to say next</primary>, readable in the two seconds a person has while still listening. The content is structured and the card alone decides how it looks: `sections` (`say`, `anchors`, `ask`, `caution`, `context`) hold one-sentence `lines`, and each piece of a line carries a `role` (`spoken`, `cue`, `evidence`, `caution`, `context`). A line is written the short way: a string with its key words marked, `**cue**`, `==evidence==` and `!!caution!!` (the rest is spoken); or a list of strings and segments, where a string is spoken text taken exactly as written and a segment object is used only for a `source`, a `grounding` or a field of your own; a full `{ segments }` line still works, and `toCueLine` turns any form into one. Evidence is the accent colour, a caution sits in an amber box whose first line names it, context is small and quiet. `mode="compact"` keeps the response, `maxAnchors` anchors and any caution. `status="pending"` says a revision is on its way and leaves what is ready on show. A piece with `grounding: "inferred"` is underlined with a tooltip. A piece with a `source` is a button only when <primary>onSourceSelect(segment)</primary> is given, and the segment arrives by reference: <code>CueCard&lt;S extends CueSegment&gt;</code>. Headings and status text come from `labels`; a section `label` replaces its heading and an empty string draws none. <primary>HeardLine</primary> draws the sentence the card answers: `pieces` with the carrying words `strong`, a `label`, `tone="ask"` for something asked, cut after `maxLines` with the whole sentence in its tooltip; `pieces` is a string, or a list of strings and `{ text, strong }`. <primary>CueLineText</primary> is one line on its own, the part every line of the card is drawn with. They draw their content only: the card reuses its own `CueLineText` and `toCueLine` for every line and imports no other component (just the library\'s `cn`); the caution icon is a node the caller passes. They are meant to be placed inside a `Panel` (`title`, `meta`, `bodyPadding`), with the `HeardLine` above the `CueCard` it answers. Every story below shows its whole code: the `Cited` type that extends `CueSegment`, the typed sections written as marked strings, the state and the callback.',
      },
    },
  },
  argTypes: {
    sections: { control: false, description: '`{ kind, label?, lines: { segments }[] }[]`.' },
    mode: { control: false, description: '`detail` (default) or `compact`.' },
    status: { control: false, description: '`ready` (default) or `pending`.' },
    maxAnchors: { control: false, description: 'Anchors a compact card keeps.' },
    onSourceSelect: {
      control: false,
      description: '`(segment: S) => void`. Without it a piece with a `source` is plain text.',
    },
    cautionIcon: { control: false, description: 'Icon of a caution section (a node).' },
    labels: { control: false, description: '{ sections, preparing, updating, inferred }.' },
  },
};
export default meta;
type Story = StoryObj<StoryArgs>;

/** The technical note under the sentence it answers. Pressing a source shows the segment's own `href` in the panel's `meta`. */
export const Default: Story = {
  render: () => <AnswerPanel />,
  parameters: exampleDocs(factories, 'AnswerPanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Answer' })).toBeVisible();
    await expect(canvas.getByText('data consistent across services')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Changelog' }));
    await expect(canvas.getByText('open: /docs/changelog')).toBeVisible();
  },
};

/** A closing note: the opening phrase is a `cue`, the documents are `evidence`, and there is something to ask. */
export const ClosingNote: Story = {
  render: () => <ClosingNotePanel />,
  parameters: exampleDocs(factories, 'ClosingNotePanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('One thing I should have said earlier:')).toHaveAttribute(
      'data-role',
      'cue',
    );
    await expect(canvas.getByText('Ask')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Migration guide' }));
    await expect(canvas.getByText('open: /docs/migration')).toBeVisible();
  },
};

/** Compact keeps the response, three of the four anchors and the caution; context is left out. */
export const Compact: Story = {
  render: () => <CompactNotePanel />,
  parameters: exampleDocs(factories, 'CompactNotePanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText('Context')).toBeNull();
    await expect(
      canvas.queryByText('Nightly reconciliation catches what slips through'),
    ).toBeNull();
    await expect(canvas.getByText('Careful')).toBeVisible();
  },
};

/** Without `onSourceSelect` a piece with a `source` is plain text: nothing to press. */
export const CompactTwoAnchors: Story = {
  render: () => <CompactTwoAnchorsPanel />,
  parameters: exampleDocs(factories, 'CompactTwoAnchorsPanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(canvas.queryByText(': 40 fixes, no breaking change')).toBeNull();
  },
};

/** A newer revision is being prepared: what is ready stays, with a polite status under it. */
export const Pending: Story = {
  render: () => <PendingNotePanel />,
  parameters: exampleDocs(factories, 'PendingNotePanel'),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Updating…');
  },
};

export const PendingWithNothingReady: Story = {
  render: () => <PreparingNotePanel />,
  parameters: exampleDocs(factories, 'PreparingNotePanel'),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Preparing response…',
    );
  },
};

/** An unconfirmed claim is underlined and says so in its tooltip. */
export const InferredClaim: Story = {
  render: () => <UnconfirmedNotePanel />,
  parameters: exampleDocs(factories, 'UnconfirmedNotePanel'),
};

export const CustomLabels: Story = {
  render: () => <GermanNotePanel />,
  parameters: exampleDocs(factories, 'GermanNotePanel'),
};

/** HeardLine on its own: plain, cut after one line, and asked. */
export const HeardLines: Story = {
  render: () => <HeardPanel />,
  parameters: exampleDocs(factories, 'HeardPanel'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('region', { name: 'Heard' })).toBeVisible();
    await expect(canvas.getByText('Follow-up · 11:46')).toBeVisible();
  },
};

/** `CueLineText` on its own: one marked string, drawn by role inside any text element. */
export const LineText: Story = {
  render: () => <LineOnItsOwn />,
  parameters: exampleDocs(factories, 'LineOnItsOwn'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Start with')).toHaveAttribute('data-role', 'cue');
    await expect(canvas.getByText('result')).toHaveAttribute('data-role', 'evidence');
    await expect(canvas.getByText('not the method')).toHaveAttribute('data-role', 'caution');
  },
};
