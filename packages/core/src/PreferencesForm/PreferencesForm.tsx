import { cn } from 'lib/utils';
import * as React from 'react';
import { IconAction } from '../internal/support/IconAction';
import { SettingRow } from '../SettingsDialog/SettingRow';
import { SwitchPrimitive } from '../Switch';
import { TextareaPrimitive } from '../Textarea';
import type {
  MemoryItem,
  PreferencesFormLabels,
  PreferencesFormProps,
} from './PreferencesForm.types';

export const DEFAULT_PREFERENCES_FORM_LABELS: PreferencesFormLabels = {
  instructionsTitle: 'Custom instructions',
  instructionsDescription: 'Added to every conversation. Keep it short.',
  memoryTitle: 'Memory',
  memoryDescription: 'Facts the assistant keeps across conversations. Edit or delete any time.',
  memorySwitch: 'Memory',
  memoryList: 'Memories',
  forget: 'Forget',
  memoryEmpty: 'No memories yet. Say “remember that…” in any chat.',
  loading: 'Loading…',
};

/**
 * Omni PreferencesForm: custom instructions (a textarea, max 4000) and the memory the assistant keeps (a switch plus a
 * list with Forget). `onChange(text)` fires on every keystroke, so a host that autosaves debounces it itself (the
 * `useDebouncedCallback` util is exported for that). The memory section appears when `memories` is given; its switch
 * needs `onMemoryToggle` and each Forget button needs `onForget`, which receives the full memory item (the same object
 * you passed, extra fields included).
 *
 * Slots: `data-slot="preferences-form" | "preferences-instructions" | "preferences-memory" | "preferences-memory-item"`.
 *
 * @example
 * <PreferencesForm instructions={saved} onChange={save} memories={memories} memoryEnabled={on} onMemoryToggle={setOn} onForget={(m) => forget(m.id)} />
 */
export const PreferencesForm = <M extends MemoryItem = MemoryItem>({
  instructions,
  onChange,
  maxLength = 4000,
  rows = 4,
  loading = false,
  memories,
  memoryEnabled = true,
  onMemoryToggle,
  onForget,
  forgetIcon,
  labels: labelOverrides,
  className,
}: PreferencesFormProps<M>) => {
  const labels = { ...DEFAULT_PREFERENCES_FORM_LABELS, ...labelOverrides };
  const fieldId = React.useId();
  const [text, setText] = React.useState(instructions);
  React.useEffect(() => setText(instructions), [instructions]);

  if (loading) {
    return (
      <div
        data-slot="preferences-form"
        className={cn('text-[13px] text-[color:var(--oui-panel-meta-fg)]', className)}
      >
        {labels.loading}
      </div>
    );
  }

  return (
    <div data-slot="preferences-form" className={cn('flex flex-col gap-5', className)}>
      <div data-slot="preferences-instructions">
        <SettingRow
          layout="stack"
          htmlFor={fieldId}
          title={labels.instructionsTitle}
          description={labels.instructionsDescription}
        >
          <TextareaPrimitive
            id={fieldId}
            rows={rows}
            maxLength={maxLength}
            value={text}
            onChange={(next) => {
              setText(next);
              onChange?.(next);
            }}
          />
        </SettingRow>
      </div>

      {memories ? (
        <div data-slot="preferences-memory" className="flex flex-col gap-2.5">
          <SettingRow
            tone="boxed"
            title={labels.memoryTitle}
            description={labels.memoryDescription}
          >
            {onMemoryToggle ? (
              <SwitchPrimitive
                aria-label={labels.memorySwitch}
                checked={memoryEnabled}
                onChange={(next) => void onMemoryToggle(next)}
              />
            ) : null}
          </SettingRow>
          <ul
            aria-label={labels.memoryList}
            className="m-0 flex list-none flex-col overflow-hidden rounded-xl border border-solid border-[color:var(--oui-panel-border)] p-0"
          >
            {memories.map((item) => (
              <li
                key={item.id}
                data-slot="preferences-memory-item"
                className="flex items-center gap-2 border-b border-solid border-[color:var(--oui-panel-divider)] px-3 py-2 text-[13px] last:border-b-0"
              >
                <span className="flex-1">{item.text}</span>
                {onForget ? (
                  <IconAction
                    icon={forgetIcon}
                    label={labels.forget}
                    aria-label={`${labels.forget}: ${item.text}`}
                    onClick={() => void onForget(item)}
                  />
                ) : null}
              </li>
            ))}
            {memories.length === 0 ? (
              <li className="px-3 py-3 text-[13px] text-[color:var(--oui-panel-meta-fg)]">
                {labels.memoryEmpty}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
