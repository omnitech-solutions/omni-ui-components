import { TreeSelect, type TreeSelectProps } from '@oc-tech/omni-ui-components/TreeSelect';
import type { Meta, StoryObj } from '@storybook/react';
import {
  type PlaceNode,
  treeSelectPropsFactory,
} from 'factories/omni-ui-components/TreeSelect/TreeSelect.factories';
import * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

type PlaceTreeSelectProps = TreeSelectProps<PlaceNode>;
type AnyValue = string | string[];

/** Keeps the value in state, like a consumer does, for either mode. */
const Renderer: React.FC<PlaceTreeSelectProps> = (args) => {
  const empty: AnyValue = args.mode === 'multiple' ? [] : '';
  const [value, setValue] = React.useState<AnyValue>(args.value ?? empty);
  React.useEffect(
    () => setValue(args.value ?? (args.mode === 'multiple' ? [] : '')),
    [args.value, args.mode],
  );
  const props = {
    ...args,
    value,
    onChange: (next: AnyValue, picked: unknown) => {
      setValue(next);
      (args.onChange as ((next: AnyValue, picked: unknown) => void) | undefined)?.(next, picked);
    },
  } as PlaceTreeSelectProps;
  return <TreeSelect<PlaceNode> {...props} />;
};

const meta: Meta<typeof TreeSelect> = {
  title: 'omni-ui-components/TreeSelect',
  component: TreeSelect,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A field that opens a <primary>tree of nested options</primary> in a popover. `mode` picks <primary>one value</primary> (`single`, the default) or <primary>several independent checks</primary> (`multiple`). Nodes are typed data in `treeData` and reach `onChange` by reference. Arrow keys move and expand, Enter or Space chooses, Escape closes.',
      },
    },
  },
  args: treeSelectPropsFactory({ wrapperClassName: 'mx-auto max-w-md' }) as TreeSelectProps,
  argTypes: {
    layout: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    mode: {
      control: 'inline-radio',
      options: ['single', 'multiple'],
      description: 'multiple: value and onChange carry string[].',
    },
    variant: { control: 'inline-radio', options: ['bordered', 'panel', 'ghost'] },
    inputSize: { control: 'inline-radio', options: ['sm', 'default', 'md', 'lg'] },
    onChange: { action: 'changed' },
    onExpandedChange: { action: 'expanded changed' },
    onOpenChange: { action: 'open changed' },
  },
  render: (args) => <Renderer {...(args as PlaceTreeSelectProps)} />,
};
export default meta;

type Story = StoryObj<typeof TreeSelect>;

export const Default: Story = {};

export const Placeholder: Story = { args: { value: '' } };

export const Multiple: Story = {
  args: { mode: 'multiple', value: ['ireland', 'canada'] } as Partial<TreeSelectProps>,
};

export const LeavesOnly: Story = {
  args: { selectableParents: false, description: 'Only a place without children can be chosen.' },
};

export const ExpandAll: Story = { args: { defaultExpandAll: true, defaultOpen: true } };

export const AllowClear: Story = { args: { allowClear: true } };

export const Required: Story = { args: { required: true, value: '' } };

export const WithError: Story = { args: { error: 'Choose a location', value: '' } };

export const Disabled: Story = { args: { disabled: true } };

export const ReadOnly: Story = { args: { readOnly: true } };

export const Horizontal: Story = { args: { layout: 'horizontal' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {(['sm', 'default', 'md', 'lg'] as const).map((inputSize) => (
        <Renderer
          key={inputSize}
          {...(args as PlaceTreeSelectProps)}
          id={`demo-tree-select-${inputSize}`}
          label={`Size ${inputSize}`}
          description={undefined}
          inputSize={inputSize}
        />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      {(['bordered', 'panel', 'ghost'] as const).map((variant) => (
        <Renderer
          key={variant}
          {...(args as PlaceTreeSelectProps)}
          id={`demo-tree-select-${variant}`}
          label={`Variant ${variant}`}
          description={undefined}
          variant={variant}
        />
      ))}
    </div>
  ),
};

/** Operated by keyboard only: open, walk into a closed branch, choose, and land back on the trigger. */
export const KeyboardSingle: Story = {
  args: { value: '' },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Location' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const tree = await body.findByRole('tree');
    await expect(within(tree).getByRole('treeitem', { name: 'Europe' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(within(tree).getByRole('treeitem', { name: 'Europe' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(within(tree).getByRole('treeitem', { name: 'France' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(trigger).toHaveTextContent('France');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Focus comes back once the popover has finished closing.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/** Multiple mode by keyboard: Space checks and the popover stays open; Escape returns to the trigger. */
export const KeyboardMultiple: Story = {
  args: { mode: 'multiple', value: [] } as Partial<TreeSelectProps>,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('combobox', { name: 'Location' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const tree = await body.findByRole('tree');
    await userEvent.keyboard(' {End} ');
    await expect(within(tree).getByRole('treeitem', { name: 'Europe' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(within(tree).getByRole('treeitem', { name: 'Remote' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(trigger).toHaveTextContent('Europe, Remote');
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Focus comes back once the popover has finished closing.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
