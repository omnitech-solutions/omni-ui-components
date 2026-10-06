import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Sources, type SourcesProps } from '@oc-tech/omni-ui-components/Sources';
import { sourcesPropsFactory } from 'factories/omni-ui-components/Sources/Sources.factories';

const meta: Meta<SourcesProps> = {
  title: 'omni-ui-components/Sources',
  component: Sources,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The sources a reply cites: <primary>one chip per source</primary> (`n`, title, meta; `aria-pressed`) and <primary>one quote card at a time</primary>. Choosing a chip opens its card, choosing it again or the card's close control closes it. The open source is <primary>controlled</primary> with `openN` (a citation pill in the Markdown can open it) or kept inside. Icons are nodes (`cardIcon`, `closeIcon`); strings are in `labels`; `renderCard` replaces the card.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onToggle` | a source's card opens or closes, controlled or not (opening another source first reports the previous one closing) | `(source: T, open: boolean)` |\n| `onClose` | the card's close control is chosen | `(source: T)` |\n\n`openN` stays the source number; callbacks emit the full item you passed in `items`, by reference.",
      },
    },
  },
  args: { ...sourcesPropsFactory(), onToggle: fn() },
  argTypes: {
    items: {
      control: 'object',
      description: 'Sources: { n, title, meta?, quote }.',
    },
    openN: {
      control: 'number',
      description: 'Open source number (controlled). `null` is controlled and closed.',
    },
    defaultOpenN: {
      control: 'number',
      description: 'Initial open source when uncontrolled.',
    },
    onToggle: {
      action: 'toggle',
      description: 'Called with the new open number, or null when closed.',
    },
    labels: { control: 'object', description: 'Partial { group, close }.' },
  },
  render: (args) => (
    <div className="max-w-[560px]">
      <Sources {...args} />
    </div>
  ),
};
export default meta;
type Story = StoryObj<SourcesProps>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Chips only; nothing is pressed. Click one to open its card.',
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Two Sum notes/ }));
    await expect(canvas.getByText(/single lookup/)).toBeVisible();
    await expect(canvas.getByRole('button', { name: /Two Sum notes/ })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(canvas.getByRole('button', { name: /Map reference/ }));
    await expect(canvas.queryByText(/single lookup/)).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(args.onToggle).toHaveBeenCalledWith(args.items[1], false);
  },
};

export const CardOpen: Story = {
  args: { defaultOpenN: 2 },
  parameters: {
    docs: {
      description: {
        story: 'The card of source 2: icon, title, meta, close and the quotation.',
      },
    },
  },
};

export const OneSource: Story = {
  args: { items: sourcesPropsFactory().items.slice(0, 1), defaultOpenN: 1 },
};
