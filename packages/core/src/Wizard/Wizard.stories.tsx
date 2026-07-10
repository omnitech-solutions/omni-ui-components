import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Wizard, type WizardProps } from '@omnitech/omni-ui-core/Wizard';
import { SAMPLE_STEPS, wizardPropsFactory } from 'factories/omni-ui-components/Wizard/Wizard.factories';

const Renderer: React.FC<WizardProps> = (args) => {
  const [step, setStep] = React.useState<string>(args.defaultStep ?? args.steps[0]?.name ?? '');
  return <Wizard {...args} currentStep={step} onStepChange={setStep} />;
};

const meta: Meta<typeof Wizard> = {
  title: 'omni-ui-components/Navigation/Wizard',
  component: Wizard,
  tags: ['autodocs'],
  args: wizardPropsFactory({ className: 'mx-auto max-w-2xl' }),
  argTypes: {
    onStepChange: { action: 'step changed' },
    onComplete: { action: 'completed' },
  },
  render: (args) => <Renderer {...(args as WizardProps)} />,
};
export default meta;

type Story = StoryObj<typeof Wizard>;

export const Default: Story = {};

export const StartOnMiddleStep: Story = { args: { defaultStep: 'payment' } };

export const HideActions: Story = { args: { hideActions: true } };

export const BlockedStep: Story = {
  args: {
    steps: [
      ...SAMPLE_STEPS.slice(0, 2),
      { ...SAMPLE_STEPS[2], canAdvance: false, content: <p className="text-sm text-destructive">Cannot advance — agree to terms first.</p> },
    ],
    defaultStep: 'review',
  },
};

export const CustomLabels: Story = {
  args: {
    labels: { back: '← Prev', next: 'Continue →', finish: 'Submit application' },
  },
};
