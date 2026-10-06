import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';

import type { VersionPagerProps } from '@oc-tech/omni-ui-components/VersionPager';
import { VersionPagerDemo } from 'factories/omni-ui-components/VersionPager/VersionPager.factories';

type StoryArgs = Partial<VersionPagerProps> & {
  onAction?: (name: string, detail?: unknown) => void;
};

const meta: Meta<StoryArgs> = {
  title: 'omni-ui-components/VersionPager',
  component: VersionPagerDemo as unknown as React.ComponentType<StoryArgs>,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '`‹ 2 / 3 ›` for a message with several versions (edits of your message, regenerations of a reply). Previous and Next call <primary>onMove(-1 | 1)</primary> and disable at either end and while <primary>disabled</primary>. The position is announced politely. Icons are nodes; the position text is a `labels.position(index, count)` function.\n\n**Callbacks**\n\n| Callback | Fires | Arguments |\n|---|---|---|\n| `onMove` | Previous or Next is chosen | `(step: -1 or 1, current?: T)`: `current` is `versions[index]` |\n| `onSelect` | same moment, when `versions` is given | `(version: T, index: number)`: the version moved to |',
      },
    },
  },
  args: { index: 1, count: 3 },
  argTypes: {
    index: {
      control: { type: 'number', min: 0 },
      description: '0-based shown version (the demo then moves it itself).',
    },
    count: {
      control: { type: 'number', min: 1 },
      description: 'Number of versions.',
    },
    disabled: { control: 'boolean' },
    onAction: { action: 'pager', description: 'Story-only: reports onMove.' },
  },
};
export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Next version' }));
    await expect(canvas.getByText('3 / 3')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Next version' })).toBeDisabled();
  },
};
export const First: Story = { args: { index: 0 } };
export const Disabled: Story = { args: { disabled: true } };
