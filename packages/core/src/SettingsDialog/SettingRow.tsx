import { cn } from 'lib/utils';
import type { SettingRowProps } from './SettingsDialog.types';
import { settingRowVariants } from './SettingsDialog.variants';

/**
 * One setting: a title, an optional description and a control. `tone="boxed"` draws it as a card, `tone="danger"`
 * as a destructive card; `layout="stack"` puts the control under the text (a textarea, a list). Use the library
 * Switch, Segmented or Button as the control.
 *
 * @example
 * <SettingRow title="Send with Enter" description="Shift+Enter adds a new line"><Switch aria-label="Send with Enter" checked={on} onChange={setOn} /></SettingRow>
 */
export const SettingRow = ({
  title,
  description,
  tone = 'plain',
  layout = 'inline',
  htmlFor,
  children,
  className,
}: SettingRowProps) => (
  <div
    data-slot="setting-row"
    data-tone={tone}
    className={cn(settingRowVariants({ tone, layout }), className)}
  >
    <div data-slot="setting-text" className="min-w-0 flex-1 leading-snug">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          data-slot="setting-title"
          className="block text-[13.5px] font-medium"
        >
          {title}
        </label>
      ) : (
        <div data-slot="setting-title" className="text-[13.5px] font-medium">
          {title}
        </div>
      )}
      {description ? (
        <div
          data-slot="setting-description"
          className="mt-0.5 text-[12.5px] text-[color:var(--oui-panel-meta-fg)]"
        >
          {description}
        </div>
      ) : null}
    </div>
    {children ? (
      <div data-slot="setting-control" className={cn('flex-none', layout === 'stack' && 'w-full')}>
        {children}
      </div>
    ) : null}
  </div>
);
