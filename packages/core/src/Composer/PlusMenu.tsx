import { cn } from 'lib/utils';
import { ActionMenu, type ActionMenuSection } from '../ActionMenu';
import { IconButton } from '../IconButton';
import { DEFAULT_COMPOSER_LABELS, type PlusMenuProps } from './Composer.types';
import { composerRoundClasses } from './Composer.variants';

/**
 * The composer's `+` menu: the library ActionMenu configured from `items` (icon, label, description, `onClick`, and
 * `separated` for a divider before a group). The trigger is a round IconButton whose `aria-expanded` Radix keeps
 * in sync; focus returns to it when the menu closes from the keyboard.
 * Slot: `data-slot="plus-menu"` on the trigger.
 *
 * @example
 * <PlusMenu icon={<Plus />} items={[{ id: 'file', label: 'Upload a file', description: 'Text, Markdown or PDF', icon: <Paperclip />, onClick: openPicker }]} />
 */
export function PlusMenu({
  items,
  icon,
  label = DEFAULT_COMPOSER_LABELS.plus,
  appearance = 'outlined',
  side = 'top',
  align = 'start',
  width = 280,
  ...rest
}: PlusMenuProps) {
  // A `separated` row starts a new section, so the ActionMenu draws its divider.
  const sections: ActionMenuSection[] = [];
  // [GUARD] A row without a callback is not rendered
  const usable = items.filter((item) => Boolean(item.onClick));
  for (const item of usable) {
    if (sections.length === 0 || item.separated)
      sections.push({ id: `plus-${sections.length}`, selection: 'none', items: [] });
    sections[sections.length - 1]!.items.push({
      id: item.id,
      label: item.label,
      description: item.description,
      icon: item.icon,
      disabled: item.disabled,
      onSelect: item.onClick,
    });
  }
  if (usable.length === 0) return null;
  return (
    <ActionMenu
      label={label}
      side={side}
      align={align}
      width={width}
      sections={sections}
      {...rest}
      trigger={
        <IconButton
          variant={appearance === 'outlined' ? 'outline' : 'ghost'}
          iconSize="md"
          icon={icon ?? <span aria-hidden="true">+</span>}
          label={label}
          data-slot="plus-menu"
          className={cn(composerRoundClasses)}
        />
      }
    />
  );
}
