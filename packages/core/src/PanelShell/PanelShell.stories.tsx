import { PanelShell, type PanelShellProps } from '@oc-tech/omni-ui-components/PanelShell';
import type { Meta, StoryObj } from '@storybook/react';
import {
  ChatShellDemo,
  panelShellPropsFactory,
  panelShellVariants,
} from 'factories/omni-ui-components/PanelShell/PanelShell.factories';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { exampleDocs } from 'storybook-helpers/internal/support/exampleDocs';
import exampleSource from './PanelShell.factories.tsx?raw';

const meta: Meta<PanelShellProps> = {
  title: 'omni-ui-components/PanelShell',
  component: PanelShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shell of an assistant. <primary>panel</primary> mode is a side panel (default <primary>440px</primary>) beside the host page; <primary>full</primary> mode fills the area and hides the host. It lays out <primary>header</primary>, a body, an optional <primary>docked or overlay sidebar</primary> and a pinned <primary>footer</primary>, and positions nothing against the window. Closed (`open={false}`) it renders only the host. Compose the library parts into the slots: ConversationList, ConversationHeader, Transcript or EmptyStarters, a composer and a Toast.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onOpenChange` | Escape closes the panel (with `closeOnEscape`) | `(open: boolean)` |\n| `onSidebarOpenChange` | Escape closes the overlay sidebar | `(open: boolean)` |',
      },
    },
  },
  args: {
    ...panelShellPropsFactory(panelShellVariants[0].args),
    onOpenChange: fn(),
    onSidebarOpenChange: fn(),
  },
  argTypes: {
    mode: { control: 'inline-radio', options: ['panel', 'full'] },
    width: { control: 'number', description: 'Panel width (px or CSS length). Default 440.' },
    open: {
      control: 'boolean',
      description: 'Whether the assistant is shown. Closed in panel mode leaves the host.',
    },
    sidebarMode: { control: 'inline-radio', options: ['docked', 'overlay'] },
    sidebarOpen: {
      control: 'boolean',
      description: 'Overlay mode: whether the sidebar is showing.',
    },
    sidebarWidth: { control: 'number', description: 'Sidebar width. Default 260.' },
    closeOnEscape: {
      control: 'boolean',
      description: 'Escape in the panel closes it through `onOpenChange`.',
    },
    label: { control: 'text', description: 'Accessible name of the region. Default `Chat`.' },
    onOpenChange: { action: 'open change' },
    onSidebarOpenChange: { action: 'sidebar open change' },
  },
  decorators: [
    (Story) => (
      <div className="h-[520px] p-4">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<PanelShellProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const panel = canvas.getByRole('region', { name: 'Chat' });
    expect(panel).toHaveStyle({ flex: '0 0 440px' });
    expect(canvasElement.querySelector('[data-slot="panel-shell-host"]')).not.toBeNull();
  },
};
export const FullPage: Story = {
  args: panelShellVariants[1].args,
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('[data-slot="panel-shell-host"]')).toBeNull();
  },
};
export const Closed: Story = {
  args: panelShellVariants[2].args,
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('region', { name: 'Chat' })).not.toBeInTheDocument();
  },
};
export const NarrowPanel: Story = { args: panelShellVariants[3].args };

/**
 * ChatShell: the whole shell composed from the library parts (ConversationList overlay, ConversationHeader with
 * the ModelPicker, EmptyStarters or Transcript, the composer, SettingsDialog and a Toast with Undo).
 */
export const ChatShell: Story = {
  parameters: { layout: 'fullscreen', ...exampleDocs(exampleSource, 'ChatShellDemo') },
  render: () => <ChatShellDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Conversations/ }));
    expect(await canvas.findByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Debounce vs throttle' }));
    await waitFor(() =>
      expect(canvas.queryByRole('navigation', { name: 'Conversations' })).not.toBeInTheDocument(),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Settings' }));
    expect(
      await within(document.body).findByRole('dialog', { name: 'Settings' }),
    ).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

export const ChatShellFullPage: Story = {
  render: () => <ChatShellDemo mode="full" />,
};

export const ChatShellEmpty: Story = {
  render: () => <ChatShellDemo empty />,
};
