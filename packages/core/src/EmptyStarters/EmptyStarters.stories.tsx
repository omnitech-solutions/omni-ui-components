import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { EmptyStarters, type EmptyStartersProps } from '@oc-tech/omni-ui-components/EmptyStarters';
import { emptyStartersPropsFactory, emptyStartersVariants } from 'factories/omni-ui-components/EmptyStarters/EmptyStarters.factories';

const meta: Meta<EmptyStartersProps> = {
  title: 'omni-ui-components/EmptyStarters',
  component: EmptyStarters,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The <primary>empty conversation</primary>: a heading, a description and <primary>starter cards</primary> (`icon`, `title`, `subtitle`, `prompt`). Choosing a card calls <primary>onStart(prompt)</primary> so the app sends it. It fills its parent and centres, so it drops into a Panel body or the PanelShell.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onStart` | a starter card is chosen | `(starter: S)` |',
      },
    },
  },
  args: { ...emptyStartersPropsFactory(), onStart: fn() },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    starters: { control: 'object', description: 'Cards `{ key?, icon, title, subtitle?, prompt }`.' },
    columns: { control: 'inline-radio', options: [1, 2, 3], description: 'Card columns from `sm` up.' },
    labels: { control: 'object', description: '`starters`: accessible name of the card group.' },
    onStart: { action: 'start', description: '(starter): the full starter item, which carries its `prompt`.' },
  },
  decorators: [
    (Story) => (
      <div className="flex h-[480px] w-[640px] flex-col p-6">
        <div className="flex min-h-0 flex-1 flex-col rounded-xl border">
          <Story />
        </div>
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<EmptyStartersProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('heading', { name: 'What are we working on?' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Explain a concept/ }));
    expect(args.onStart).toHaveBeenCalledWith(expect.objectContaining({ title: 'Explain a concept', prompt: 'Explain closures' }));
  },
};
export const ThreeColumns: Story = { args: emptyStartersVariants[1].args };
export const OneColumn: Story = { args: emptyStartersVariants[2].args };
export const TitleOnly: Story = { args: emptyStartersVariants[3].args };
