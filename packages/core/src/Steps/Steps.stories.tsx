import type { Meta, StoryObj } from '@storybook/react';
import { Steps, type StepsProps } from './Steps';
import { stepsChecklistItems, stepsVariants } from 'factories/omni-ui-components/Steps/Steps.factories';

const meta = {
  title: 'omni-ui-components/Steps',
  component: Steps,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Numbered <primary>step indicator</primary>. `variant="checklist"` is a read-only vertical list (done check, current spinning ring, pending circle) driven by `items[{ label, state }]`; the current item carries `aria-current="step"`.',
      },
    },
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'checklist'] },
    onChange: { action: 'step changed' },
  },
} satisfies Meta<typeof Steps>;
export default meta;
export const Default: StoryObj<typeof meta> = { args: { items: [{ title: 'Question' }, { title: 'Solution' }, { title: 'Tests' }] } };

export const Checklist: StoryObj<typeof meta> = { args: { variant: 'checklist', items: stepsChecklistItems() } };

export const ChecklistStates: StoryObj<typeof meta> = {
  render: () => (
    <div className="flex flex-col gap-6">
      {stepsVariants.slice(1).map((variant) => (
        <div key={variant.name} className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">{variant.name}</span>
          <Steps {...(variant.args as StepsProps)} />
        </div>
      ))}
    </div>
  ),
};
