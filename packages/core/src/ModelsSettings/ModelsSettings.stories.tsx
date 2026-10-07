import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ModelsSettings, type ModelsSettingsProps } from '@oc-tech/omni-ui-components/ModelsSettings';
import {
  ModelsSettingsDialogDemo,
  modelsSettingsPropsFactory,
  modelsSettingsVariants,
} from 'factories/omni-ui-components/ModelsSettings/ModelsSettings.factories';

const meta: Meta<ModelsSettingsProps> = {
  title: 'omni-ui-components/ModelsSettings',
  component: ModelsSettings,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'The Models tab of a settings dialog: the <primary>read-only endpoint</primary>, a <primary>Connected · N models</primary> status, the available models and a cloud-providers row. Generic over `ModelInfo`. <code>onAddProvider()</code> adds the Add provider button; when it is absent the row is not rendered.',
      },
    },
  },
  args: { ...modelsSettingsPropsFactory(), onAddProvider: fn() },
  argTypes: {
    models: {
      control: 'object',
      description: 'The `ModelInfo` items; passed through untouched.',
    },
    status: {
      control: 'inline-radio',
      options: ['connected', 'checking', 'disconnected'],
    },
    labels: {
      control: 'object',
      description: 'Every string; `connected` and `context` are functions.',
    },
    onAddProvider: {
      action: 'addProvider',
      description: 'Absent hides the cloud-providers row.',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-6">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<ModelsSettingsProps>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Connected · 3 models')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Add provider' }));
    expect(args.onAddProvider).toHaveBeenCalled();
  },
};
export const Checking: Story = { args: modelsSettingsVariants[1].args };
export const Disconnected: Story = { args: modelsSettingsVariants[2].args };
export const ReadOnly: Story = { args: modelsSettingsVariants[3].args };

/** The tab as a `SettingsDialog` tab. */
export const InSettingsDialog: Story = {
  decorators: [(Story) => <Story />],
  render: () => <ModelsSettingsDialogDemo />,
  parameters: { layout: 'fullscreen' },
};
