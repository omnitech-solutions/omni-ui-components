import {
  SettingRow,
  SettingsDialog,
  type SettingsDialogProps,
} from '@oc-tech/omni-ui-components/SettingsDialog';
import { SwitchPrimitive } from '@oc-tech/omni-ui-components/Switch';
import type { Meta, StoryObj } from '@storybook/react';
import {
  SettingsDialogDemo,
  settingsDialogPropsFactory,
  settingsDialogVariants,
} from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

const meta: Meta<SettingsDialogProps> = {
  title: 'omni-ui-components/SettingsDialog',
  component: SettingsDialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The library <primary>Modal</primary> with a <primary>vertical tablist</primary> and the active tab's panel. <primary>Focus is trapped</primary> while open and <primary>returns</primary> to the control that opened it; Escape and the backdrop call `onClose`. Tabs follow the ARIA tabs pattern: <primary>Up / Down / Home / End</primary> move focus and select; only the active tab is in the tab order. Tabs are data (`id`, `label`, `icon`, `render`). `SettingRow` (tone `plain`, `boxed` or `danger`; layout `inline` or `stack`) is the row used inside the panels.\n\n<primary>Callbacks</primary> (every callback is optional; a control that exists only for a callback is not rendered when it is absent):\n\n| Callback | Fires when | Payload |\n| --- | --- | --- |\n| `onClose` | Escape, the backdrop or the close button | `()` |\n| `onTabChange` | the shown tab changes (click or arrow keys, controlled or not) | `(tab: Tab)` |\n| `GeneralSettings onThemeChange` | the theme choice changes | `(theme: string)` |\n| `GeneralSettings onSendOnEnterChange` | Send with Enter is flipped | `(sendOnEnter: boolean)` |",
      },
    },
  },
  args: { ...settingsDialogPropsFactory(), onClose: fn(), onTabChange: fn() },
  argTypes: {
    open: { control: 'boolean' },
    tabs: {
      control: 'object',
      description: '`{ id, label, icon, render }`; `render` runs only for the active tab.',
    },
    activeTab: {
      control: 'text',
      description: 'The shown tab (controlled). Omit to use `defaultTab`, else the first.',
    },
    defaultTab: { control: 'text' },
    labels: { control: 'object', description: '`title` (dialog and tablist name) and `close`.' },
    onClose: {
      action: 'close',
      description: 'Escape, the backdrop or the close button. The caller sets `open` false.',
    },
    onTabChange: {
      action: 'tab change',
      description: '(tab): the full tab item whenever the shown tab changes.',
    },
  },
};
export default meta;

type Story = StoryObj<SettingsDialogProps>;

/** Open dialog, General tab: Theme, Send with Enter and the shortcut list. */
export const Default: Story = {
  play: async () => {
    const body = within(document.body);
    expect(await body.findByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
    expect(body.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    expect(body.getByRole('tab', { name: /General/ })).toHaveAttribute('aria-selected', 'true');
    expect(body.getByRole('tabpanel')).toBeInTheDocument();
  },
};

/** Arrow keys move between tabs and select them; the panel follows. */
export const ArrowKeyTabs: Story = {
  play: async ({ args }) => {
    const body = within(document.body);
    const general = await body.findByRole('tab', { name: /General/ });
    general.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('tab', { name: /Personalisation/ })).toHaveFocus();
    expect(body.getByRole('tab', { name: /Personalisation/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(args.onTabChange).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'personalisation' }),
    );
    await userEvent.keyboard('{End}');
    expect(body.getByRole('tab', { name: /Shortcuts/ })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(body.getByRole('tab', { name: /General/ })).toHaveFocus();
    expect(body.getByRole('tab', { name: /Personalisation/ })).toHaveAttribute('tabindex', '-1');
  },
};

/** The trigger opens the dialog; Escape closes it and focus goes back to the trigger. */
export const FocusReturn: Story = {
  render: () => <SettingsDialogDemo />,
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole('button', { name: 'Open settings' });
    await userEvent.click(trigger);
    const dialog = await within(document.body).findByRole('dialog', { name: 'Settings' });
    expect(dialog).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(document.body).queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const DataAndPrivacyTab: Story = { args: settingsDialogVariants[1].args };
export const TwoTabs: Story = { args: settingsDialogVariants[2].args };
export const DangerRow: Story = { args: settingsDialogVariants[3].args };

/** SettingRow on its own: plain, boxed and danger tones, inline and stack layouts. */
export const SettingRowTones: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex w-[520px] flex-col gap-3">
      <SettingRow title="Plain" description="Text left, control right">
        <SwitchPrimitive aria-label="Plain" checked onChange={() => undefined} />
      </SettingRow>
      <SettingRow tone="boxed" title="Boxed" description="A bordered card">
        <SwitchPrimitive aria-label="Boxed" onChange={() => undefined} />
      </SettingRow>
      <SettingRow
        tone="danger"
        title="Danger"
        description="All conversations, memory and attachments"
      />
      <SettingRow layout="stack" tone="boxed" title="Stack" description="Control under the text">
        <input className="h-9 w-full rounded-md border px-2" aria-label="Stack control" />
      </SettingRow>
    </div>
  ),
};
