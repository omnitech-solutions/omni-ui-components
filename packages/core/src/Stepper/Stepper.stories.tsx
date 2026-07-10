import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Calendar, FileText, Users } from 'lucide-react';

import { Stepper, type StepperProps } from '@omnitech/omni-ui-core/Stepper';
import { stepperPropsFactory } from 'factories/omni-ui-components/Stepper/Stepper.factories';

const Renderer: React.FC<StepperProps> = (args) => {
  const [value, setValue] = React.useState<number>(args.value ?? args.min ?? 0);
  React.useEffect(() => setValue(args.value ?? args.min ?? 0), [args.value, args.min]);
  return (
    <Stepper
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange?.(next);
      }}
    />
  );
};

const meta: Meta<typeof Stepper> = {
  title: 'omni-ui-components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  args: stepperPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    stepperSize: { control: 'inline-radio', options: ['sm', 'default', 'lg'] },
    onChange: { action: 'changed' },
  },
  render: (args) => <Renderer {...(args as StepperProps)} />,
};
export default meta;

type Story = StoryObj<typeof Stepper>;

export const Default: Story = {};

export const NoIcon: Story = { args: { icon: undefined } };

export const Days: Story = { args: { label: 'Duration', icon: <Calendar />, unit: 'day', value: 14, min: 1, max: 90 } };

export const People: Story = { args: { label: 'Seats', icon: <Users />, unit: 'person', unitPlural: 'people', value: 1, min: 1, max: 50 } };

export const AtMin: Story = { args: { value: 1 } };

export const AtMax: Story = { args: { value: 50 } };

export const Disabled: Story = { args: { disabled: true } };

export const WithError: Story = { args: { error: 'Must be at least 5 pages' } };

export const Required: Story = { args: { required: true } };

export const SizesMatrix: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-3">
      {(['sm', 'default', 'lg'] as const).map((s) => (
        <Renderer key={s} {...(args as StepperProps)} stepperSize={s} label={`size=${s}`} icon={<FileText />} />
      ))}
    </div>
  ),
};
