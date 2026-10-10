import { Cascader, type CascaderProps } from '@oc-tech/omni-ui-components/Cascader';
import type { Meta, StoryObj } from '@storybook/react';
import {
  cascaderPropsFactory,
  type StackOption,
} from 'factories/omni-ui-components/Cascader/Cascader.factories';
import * as React from 'react';
import { expect, userEvent, within } from 'storybook/test';

type Props = CascaderProps<StackOption>;

const Renderer: React.FC<Props> = (args) => {
  const [value, setValue] = React.useState<string[]>(args.value ?? args.defaultValue ?? []);
  React.useEffect(() => {
    if (args.value) setValue(args.value);
  }, [args.value]);
  return (
    <Cascader<StackOption>
      {...args}
      defaultValue={undefined}
      value={value}
      onChange={(path, selectedOptions) => {
        setValue(path);
        args.onChange?.(path, selectedOptions);
      }}
    />
  );
};

const meta: Meta<Props> = {
  title: 'omni-ui-components/Cascader',
  component: Cascader,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Chooses a path through a tree of `options`, one column per level. The value is the <primary>path</primary>: one option `value` per level, and `onChange` gets the path first, then the chosen options by reference. Only a leaf commits unless `changeOnSelect` is on. Arrow keys move within a column and between levels, Enter chooses, Escape closes.',
      },
    },
  },
  args: cascaderPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }),
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    variant: { control: 'inline-radio', options: ['bordered', 'panel', 'ghost'] },
    inputSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    changeOnSelect: { description: 'A level that has children can be chosen too.' },
    allowClear: { description: 'Draws a clear control while there is a value.' },
    onChange: { action: 'changed' },
    onOpenChange: { action: 'open changed' },
  },
  render: (args) => <Renderer {...args} />,
};
export default meta;

type Story = StoryObj<Props>;

export const Default: Story = {};

export const WithValue: Story = { args: { value: ['frontend', 'styling', 'tailwind'] } };

export const ChangeOnSelect: Story = {
  args: { changeOnSelect: true, description: 'A whole area can be chosen, not only a leaf.' },
};

export const AllowClear: Story = { args: { allowClear: true, value: ['backend', 'hono'] } };

export const CustomSeparator: Story = {
  args: { displaySeparator: ' › ', value: ['frontend', 'react'] },
};

export const Required: Story = { args: { required: true } };

export const WithError: Story = { args: { required: true, error: 'Choose a technology' } };

export const Disabled: Story = { args: { disabled: true, value: ['backend', 'rails'] } };

export const ReadOnly: Story = {
  args: { readOnly: true, allowClear: true, value: ['backend', 'rails'] },
};

export const Horizontal: Story = { args: { layout: 'horizontal' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-3">
      {(['sm', 'default', 'md', 'lg'] as const).map((inputSize) => (
        <Renderer
          key={inputSize}
          {...args}
          id={`demo-cascader-${inputSize}`}
          label={inputSize}
          description={undefined}
          inputSize={inputSize}
          value={['frontend', 'react']}
        />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-3">
      {(['bordered', 'panel', 'ghost'] as const).map((variant) => (
        <Renderer
          key={variant}
          {...args}
          id={`demo-cascader-${variant}`}
          label={variant}
          description={undefined}
          variant={variant}
        />
      ))}
    </div>
  ),
};

export const TranslatedLabels: Story = {
  args: {
    allowClear: true,
    value: ['backend', 'hono'],
    placeholder: undefined,
    labels: {
      placeholder: 'Choisir…',
      clear: 'Effacer la sélection',
      popup: 'Options',
      level: 'Niveau',
      empty: 'Aucune option',
    },
  },
};

/** Tab to the field, open it with ArrowDown, walk Frontend → Styling → CSS Modules and choose it with Enter. */
export const KeyboardSelection: Story = {
  args: { 'data-testid': 'stack' },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('combobox', { name: /Stack/ });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(await body.findByRole('option', { name: 'Frontend' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(body.getByRole('option', { name: 'React' })).toHaveFocus();
    // Vue is disabled and is skipped.
    await userEvent.keyboard('{ArrowDown}');
    await expect(body.getByRole('option', { name: 'Styling' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(body.getByRole('option', { name: 'CSS Modules' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveTextContent('Frontend / Styling / CSS Modules');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toHaveFocus();
  },
};
