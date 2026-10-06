import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { PreferencesForm, type PreferencesFormProps } from '@oc-tech/omni-ui-components/PreferencesForm';
import { PreferencesFormDemo, preferencesFormPropsFactory, preferencesFormVariants } from 'factories/omni-ui-components/PreferencesForm/PreferencesForm.factories';

const meta: Meta<PreferencesFormProps> = {
  title: 'omni-ui-components/PreferencesForm',
  component: PreferencesForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Custom instructions (an <primary>textarea</primary>, max 4000) and the <primary>memory</primary> the assistant keeps (a switch and a list with Forget). `onChange(text)` fires on every keystroke; debounce it with the exported `useDebouncedCallback` to autosave.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onChange` | every keystroke in the instructions field | `(text: string)` |\n| `onMemoryToggle` | the memory switch is flipped | `(enabled: boolean)` |\n| `onForget` | a Forget button is chosen | `(memory: M)` |',
      },
    },
  },
  args: { ...preferencesFormPropsFactory(), onChange: fn(), onMemoryToggle: fn(), onForget: fn() },
  argTypes: {
    instructions: { control: 'text', description: 'The saved instructions. A change from outside replaces the field.' },
    maxLength: { control: 'number', description: 'Default 4000.' },
    rows: { control: 'number' },
    loading: { control: 'boolean' },
    memories: { control: 'object', description: 'The remembered facts `{ id, text, ... }`. The memory section shows when given.' },
    memoryEnabled: { control: 'boolean', description: 'State of the memory switch.' },
    labels: { control: 'object' },
    onChange: { action: 'change', description: '(text): every keystroke. Debounce it to autosave.' },
    onMemoryToggle: { action: 'memory toggle', description: '(enabled): the memory switch; not rendered without it.' },
    onForget: { action: 'forget', description: '(memory): the full memory item; the Forget buttons are not rendered without it.' },
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

type Story = StoryObj<PreferencesFormProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByLabelText('Custom instructions')).toHaveAttribute('maxlength', '4000');
    expect(canvas.getByRole('switch', { name: 'Memory' })).toBeChecked();
  },
};

/** Typing fires `onChange` with the new text on every keystroke. */
export const OnChange: Story = {
  play: async ({ canvasElement, args }) => {
    const field = within(canvasElement).getByLabelText('Custom instructions');
    await userEvent.clear(field);
    await userEvent.type(field, 'Hi');
    expect(args.onChange).toHaveBeenLastCalledWith('Hi');
  },
};

/** The memory switch and Forget change the list. */
export const MemoryInteractive: Story = {
  render: () => <PreferencesFormDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Forget: Prefers TypeScript over JavaScript' }));
    expect(canvas.queryByText('Prefers TypeScript over JavaScript')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: /Forget: Interviewing/ }));
    expect(canvas.getByText(/No memories yet/)).toBeInTheDocument();
  },
};

export const InstructionsOnly: Story = { args: preferencesFormVariants[1].args };
export const MemoryEmpty: Story = { args: preferencesFormVariants[2].args };
export const Loading: Story = { args: preferencesFormVariants[3].args };
