import type { CommandItem, CommandTrigger } from './CommandPopover.types';

/** The slash trigger of the original: only when the WHOLE draft is `/word`. Group 1 is the word. */
export const SLASH_PATTERN = /^\/(\w*)$/;
/** The `@` trigger of the original: an `@` at the start or after whitespace, to the end of the draft. Group 1 is the query. */
export const MENTION_PATTERN = /(?:^|\s)@([^\s@]*)$/;

/** Slash commands filter by prefix (`command.startsWith(query)`), as the original does. */
export const startsWithFilter = (item: { id: string }, query: string): boolean => item.id.toLowerCase().startsWith(query.toLowerCase());

/** A `/` trigger with the original's pattern and prefix filter; give it `source`, `onPick` and `popover` text. */
export const slashTrigger = <T extends CommandItem = CommandItem>(config: Omit<CommandTrigger<T>, 'id' | 'pattern'> & Partial<Pick<CommandTrigger<T>, 'id' | 'pattern'>>): CommandTrigger<T> => ({
  id: 'slash',
  pattern: SLASH_PATTERN,
  filter: startsWithFilter,
  ...config,
  popover: { labelPrefix: '/', hideWhenEmpty: true, ...config.popover },
});

/** An `@` trigger with the original's pattern; the default filter is `label contains query`. */
export const mentionTrigger = <T extends CommandItem = CommandItem>(config: Omit<CommandTrigger<T>, 'id' | 'pattern'> & Partial<Pick<CommandTrigger<T>, 'id' | 'pattern'>>): CommandTrigger<T> => ({
  id: 'mention',
  pattern: MENTION_PATTERN,
  ...config,
});
