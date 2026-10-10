import { Rate } from '@oc-tech/omni-ui-components/Rate';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ratePropsFactory,
  rateSizeVariants,
  SAMPLE_RATE_ICON,
  SAMPLE_RATE_LABELS,
} from 'factories/omni-ui-components/Rate/Rate.factories';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta<typeof Rate> = {
  title: 'omni-ui-components/Rate',
  component: Rate,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '<primary>Rating input</primary>: a radio group of marks whose value is a number from 0 to `count`. One tab stop; the arrow keys, Home and End change the value, and activating the current value again clears it. `RatePrimitive` is the bare control; `Rate` adds the <primary>label, description and error</primary>.',
      },
    },
  },
  args: ratePropsFactory(),
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    onChange: { action: 'changed' },
  },
};
export default meta;

type Story = StoryObj<typeof Rate>;

export const Default: Story = {};

export const Disabled: Story = { args: { defaultValue: 4, disabled: true } };

export const ReadOnly: Story = { args: { defaultValue: 4, readOnly: true } };

export const Required: Story = { args: { defaultValue: 0, required: true } };

export const WithError: Story = {
  args: { defaultValue: 0, required: true, error: 'Rate the answer before continuing' },
};

export const NoClear: Story = {
  args: { allowClear: false, description: 'Activating the current value keeps it.' },
};

export const TenMarks: Story = { args: { count: 10, defaultValue: 7 } };

export const CustomIconAndLabels: Story = {
  args: { icon: SAMPLE_RATE_ICON, labels: SAMPLE_RATE_LABELS },
};

export const Horizontal: Story = { args: { layout: 'horizontal' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {rateSizeVariants.map((variant) => (
        <Rate key={variant.name} {...args} description={undefined} {...variant.args} />
      ))}
    </div>
  ),
};

/** Operated by keyboard only: Tab in, raise, jump to the ends, then clear with Space. */
export const Keyboard: Story = {
  args: { id: 'rate-keyboard', defaultValue: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('radiogroup', { name: 'Answer quality' });
    await userEvent.tab();
    await expect(canvas.getByRole('radio', { name: '2 stars' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowUp}');
    await expect(canvas.getByRole('radio', { name: '4 stars' })).toBeChecked();
    await userEvent.keyboard('{End}');
    await expect(canvas.getByRole('radio', { name: '5 stars' })).toBeChecked();
    await userEvent.keyboard('{Home}');
    await expect(canvas.getByRole('radio', { name: '1 star' })).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(within(group).queryByRole('radio', { checked: true })).toBeNull();
  },
};
