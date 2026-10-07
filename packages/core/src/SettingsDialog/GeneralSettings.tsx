import { useControllableState } from '../lib/use-controllable-state';
import { SegmentedPrimitive } from '../Segmented';
import { ShortcutList } from '../ShortcutList';
import { SwitchPrimitive } from '../Switch';
import { SettingRow } from './SettingRow';
import type { GeneralSettingsLabels, GeneralSettingsProps } from './SettingsDialog.types';

export const DEFAULT_GENERAL_SETTINGS_LABELS: GeneralSettingsLabels = {
  themeTitle: 'Theme',
  themeDescription: 'Applies to the whole app',
  light: 'Light',
  dark: 'Dark',
  sendOnEnterTitle: 'Send with Enter',
  sendOnEnterDescription: 'Shift+Enter adds a new line',
  sendOnEnterSwitch: 'Send with Enter',
  shortcutsTitle: 'Keyboard shortcuts',
};

/**
 * The General tab of the settings dialog: Theme (Segmented), Send with Enter (Switch) and the shortcut list. Both
 * values work controlled or uncontrolled and fire their change callback either way; a row whose callback is absent
 * is not rendered.
 *
 * @example
 * <GeneralSettings theme={theme} onThemeChange={setTheme} onSendOnEnterChange={setSend} shortcuts={shortcuts} />
 */
export const GeneralSettings = ({
  theme: themeProp,
  defaultTheme = 'light',
  onThemeChange,
  themeOptions,
  sendOnEnter: sendProp,
  defaultSendOnEnter = true,
  onSendOnEnterChange,
  shortcuts,
  labels: labelOverrides,
}: GeneralSettingsProps) => {
  const labels = { ...DEFAULT_GENERAL_SETTINGS_LABELS, ...labelOverrides };
  const [theme, setTheme] = useControllableState<string>(themeProp, defaultTheme, onThemeChange);
  const [sendOnEnter, setSendOnEnter] = useControllableState<boolean>(
    sendProp,
    defaultSendOnEnter,
    onSendOnEnterChange,
  );
  const options = themeOptions ?? [
    { value: 'light', label: labels.light },
    { value: 'dark', label: labels.dark },
  ];
  return (
    <>
      {onThemeChange ? (
        <SettingRow title={labels.themeTitle} description={labels.themeDescription}>
          <SegmentedPrimitive value={theme} onChange={setTheme} options={options} />
        </SettingRow>
      ) : null}
      {onSendOnEnterChange ? (
        <SettingRow title={labels.sendOnEnterTitle} description={labels.sendOnEnterDescription}>
          <SwitchPrimitive
            aria-label={labels.sendOnEnterSwitch}
            checked={sendOnEnter}
            onChange={setSendOnEnter}
          />
        </SettingRow>
      ) : null}
      {shortcuts?.length ? <ShortcutList title={labels.shortcutsTitle} items={shortcuts} /> : null}
    </>
  );
};
