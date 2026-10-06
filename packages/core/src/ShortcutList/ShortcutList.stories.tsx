import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';

import { ShortcutList, type ShortcutListProps } from '@oc-tech/omni-ui-components/ShortcutList';
import { shortcutListPropsFactory, shortcutListVariants } from 'factories/omni-ui-components/ShortcutList/ShortcutList.factories';

const meta: Meta<ShortcutListProps> = {
  title: 'omni-ui-components/ShortcutList',
  component: ShortcutList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A read-only reference of actions and their keys. `keys` is a <primary>shortcut string</primary> (`mod+shift+o`) turned into glyphs by <primary>describe</primary> (default: ⌘ ⇧ ⌥ on a Mac, Ctrl Shift Alt elsewhere) or the glyphs themselves (`[\'Esc\']`).\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `(none)` | the list is read-only | `` |',
      },
    },
  },
  args: shortcutListPropsFactory(),
  argTypes: {
    items: { control: 'object', description: '`{ id?, label, keys }`; `keys` is a shortcut string or an array of glyphs.' },
    title: { control: 'text', description: 'Optional visible heading.' },
    describe: { control: false, description: 'Turns a shortcut string into glyphs. Default `describeShortcutKeys`.' },
    labels: { control: 'object', description: '`title`: accessible name when there is no visible heading.' },
  },
  decorators: [
    (Story) => (
      <div className="w-[420px] p-6">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<ShortcutListProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Stop reply')).toBeInTheDocument();
    expect(canvasElement.querySelectorAll('kbd').length).toBeGreaterThan(6);
  },
};
export const WithHeading: Story = { args: shortcutListVariants[0].args };
export const CtrlGlyphs: Story = { args: shortcutListVariants[1].args };
