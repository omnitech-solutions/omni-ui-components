import { Segmented, type SegmentedProps } from '@oc-tech/omni-ui-components/Segmented';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SAMPLE_PANELS,
  segmentedControlVariants,
  segmentedPropsFactory,
} from 'factories/omni-ui-components/Segmented/Segmented.factories';
import * as React from 'react';

const Renderer: React.FC<SegmentedProps> = (args) => {
  const [value, setValue] = React.useState<string | string[]>(
    args.value ?? (args.mode === 'multiple' ? [] : ''),
  );
  React.useEffect(
    () => setValue(args.value ?? (args.mode === 'multiple' ? [] : '')),
    [args.value, args.mode],
  );
  const props = {
    ...args,
    value,
    onChange: (next: string | string[]) => {
      setValue(next);
      (args.onChange as ((next: string | string[]) => void) | undefined)?.(next);
    },
  } as SegmentedProps;
  return <Segmented {...props} />;
};

const meta: Meta<typeof Segmented> = {
  title: 'omni-ui-components/Segmented',
  component: Segmented,
  tags: ['autodocs'],
  args: segmentedPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    mode: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description: 'multiple: value and onChange carry string[].',
    },
    appearance: {
      control: 'inline-radio',
      options: ['pill', 'control'],
      description: 'control: the 36px bordered toolbar group.',
    },
    minActive: {
      control: { type: 'number', min: 0, max: 3 },
      description: 'Multiple mode: the last on-option(s) cannot be turned off.',
    },
    minActiveReason: { control: 'text', description: 'Tooltip on an option locked by minActive.' },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as SegmentedProps)} />,
};
export default meta;

type Story = StoryObj<typeof Segmented>;

export const Default: Story = {};

export const TwoOptions: Story = {
  args: {
    label: 'Auto-publish',
    value: 'yes',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
};

export const Required: Story = { args: { required: true } };

export const WithError: Story = {
  args: { error: 'Tone is required', value: '' },
};

export const Disabled: Story = { args: { disabled: true, value: 'professional' } };

export const HorizontalSidebar: Story = {
  args: { layout: 'horizontal', label: 'Tone', wrapperClassName: 'mx-auto max-w-lg' },
};

export const MultipleControl: Story = {
  args: {
    label: 'Panels',
    mode: 'multiple',
    appearance: 'control',
    options: SAMPLE_PANELS,
    value: ['chat', 'answer', 'code'],
  },
};

export const MultipleMinActive: Story = {
  name: 'Multiple, last one cannot be turned off',
  args: {
    label: 'Panels',
    mode: 'multiple',
    appearance: 'control',
    minActive: 1,
    minActiveReason: 'At least one panel stays visible',
    options: SAMPLE_PANELS,
    value: ['answer'],
  },
};

export const ControlLabelled: Story = { args: segmentedControlVariants[2].args };
export const DisabledReason: Story = { args: segmentedControlVariants[3].args };
export const ControlSingle: Story = { args: segmentedControlVariants[4].args };

export const ControlMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {segmentedControlVariants.map((variant) => (
        <Renderer key={variant.name} {...({ ...args, ...variant.args } as SegmentedProps)} />
      ))}
    </div>
  ),
};
