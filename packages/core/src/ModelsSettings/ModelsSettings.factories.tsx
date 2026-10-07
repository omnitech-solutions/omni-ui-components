import { Cpu, Plus, SlidersHorizontal, X } from 'lucide-react';
import type * as React from 'react';
import type { Variant } from '../internal/support/makeFactory';
import { sampleModels } from '../ModelPicker/ModelPicker.factories';
import type { SettingsTab } from '../SettingsDialog';
import { SettingsDialog } from '../SettingsDialog';
import { ModelsSettings } from './ModelsSettings';
import type { ModelsSettingsProps } from './ModelsSettings.types';

/** Build `<ModelsSettings>` props for standalone stories and tests. */
export const modelsSettingsPropsFactory = (
  overrides: Partial<ModelsSettingsProps> = {},
): ModelsSettingsProps => ({
  endpoint: 'http://localhost:1234/v1',
  models: sampleModels().slice(0, 3),
  modelIcon: <Cpu />,
  addProviderIcon: <Plus />,
  onAddProvider: () => undefined,
  ...overrides,
});

export const modelsSettingsVariants: Variant<ModelsSettingsProps>[] = [
  { name: 'Connected', args: {} },
  { name: 'Checking', args: { status: 'checking' } },
  {
    name: 'Disconnected, no models',
    args: { status: 'disconnected', models: [] },
  },
  { name: 'Read-only (no provider row)', args: { onAddProvider: undefined } },
];

/** The Models tab inside a `SettingsDialog`, next to a plain tab. */
export const ModelsSettingsDialogDemo: React.FC<{
  onAction?: (name: string, ...args: unknown[]) => void;
}> = ({ onAction }) => {
  const tabs: SettingsTab[] = [
    {
      id: 'general',
      label: 'General',
      icon: <SlidersHorizontal />,
      render: () => <p className="m-0 text-[13px]">General settings</p>,
    },
    {
      id: 'models',
      label: 'Models',
      icon: <Cpu />,
      render: () => (
        <ModelsSettings
          {...modelsSettingsPropsFactory({
            onAddProvider: () => onAction?.('add-provider'),
          })}
        />
      ),
    },
  ];
  return (
    <SettingsDialog
      open
      defaultTab="models"
      tabs={tabs}
      closeIcon={<X />}
      onClose={() => onAction?.('close')}
    />
  );
};
