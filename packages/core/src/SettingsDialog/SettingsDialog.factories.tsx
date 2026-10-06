import * as React from 'react';
import { Database, Keyboard, Plug, SlidersHorizontal, Trash2, UserRound, X } from 'lucide-react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { DataPrivacyPanelDemo } from 'factories/omni-ui-components/DataPrivacyPanel/DataPrivacyPanel.factories';
import { IntegrationListDemo } from 'factories/omni-ui-components/IntegrationList/IntegrationList.factories';
import { PreferencesFormDemo } from 'factories/omni-ui-components/PreferencesForm/PreferencesForm.factories';
import { sampleShortcuts } from 'factories/omni-ui-components/ShortcutList/ShortcutList.factories';
import { GeneralSettings, SettingRow, SettingsDialog } from '@oc-tech/omni-ui-components/SettingsDialog';
import type { SettingsDialogProps, SettingsTab } from '@oc-tech/omni-ui-components/SettingsDialog';
import { ShortcutList } from '@oc-tech/omni-ui-components/ShortcutList';
import type { Variant } from '../../internal/support/makeFactory';

/** Five tabs: the four of the original settings plus a plain one, wired to the library panels. */
export const sampleSettingsTabs = (onAction?: (name: string, ...args: unknown[]) => void): SettingsTab[] => [
  { id: 'general', label: 'General', icon: <SlidersHorizontal />, render: () => <GeneralSettings onThemeChange={(theme) => onAction?.('theme', theme)} onSendOnEnterChange={(on) => onAction?.('send-on-enter', on)} shortcuts={sampleShortcuts()} /> },
  { id: 'personalisation', label: 'Personalisation', icon: <UserRound />, render: () => <PreferencesFormDemo onAction={onAction} /> },
  { id: 'data', label: 'Data & privacy', icon: <Database />, render: () => <DataPrivacyPanelDemo onAction={onAction} /> },
  { id: 'connectors', label: 'Connectors', icon: <Plug />, render: () => <IntegrationListDemo onAction={onAction} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard />, render: () => <ShortcutList items={sampleShortcuts()} /> },
];

/** Build `<SettingsDialog>` props for standalone stories and tests. */
export const settingsDialogPropsFactory = (overrides: Partial<SettingsDialogProps> = {}): SettingsDialogProps => ({
  open: true,
  onClose: () => undefined,
  tabs: sampleSettingsTabs(),
  closeIcon: <X />,
  ...overrides,
});

export const settingsDialogVariants: Variant<SettingsDialogProps>[] = [
  { name: 'General tab', args: {} },
  { name: 'Data & privacy tab', args: { defaultTab: 'data' } },
  { name: 'Two tabs', args: { tabs: sampleSettingsTabs().slice(0, 2) } },
  { name: 'Danger setting row', args: { tabs: [{ id: 'danger', label: 'Danger', icon: <Trash2 />, render: () => <SettingRow tone="danger" title="Delete everything" description="All conversations" /> }] } },
];

/** A trigger button plus the dialog it opens: focus returns to the button on close. */
export const SettingsDialogDemo: React.FC<{ onAction?: (name: string, ...args: unknown[]) => void; defaultTab?: string }> = ({ onAction, defaultTab }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open settings
      </Button>
      <SettingsDialog
        {...settingsDialogPropsFactory({
          open,
          defaultTab,
          tabs: sampleSettingsTabs(onAction),
          onClose: () => {
            setOpen(false);
            onAction?.('close');
          },
          onTabChange: (tab) => onAction?.('tab', tab.id),
        })}
      />
    </div>
  );
};
