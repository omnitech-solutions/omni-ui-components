import * as React from 'react';
import { Bookmark, Eraser, FileText, LayoutGrid, Replace, SquarePen } from 'lucide-react';

import type { CommandItem, CommandPopoverProps } from '@oc-tech/omni-ui-components/CommandPopover';
import { DEFAULT_COMMAND_HINT } from '@oc-tech/omni-ui-components/CommandPopover';
import type { Variant } from '../../internal/support/makeFactory';

/** The built-in commands of the original composer (`/new`, `/model`, `/prompts`, `/clear`). `id` is the command word. */
export const slashCommands = (): CommandItem[] => [
  { id: 'new', label: 'new', description: 'Start a new conversation', icon: <SquarePen /> },
  { id: 'model', label: 'model', description: 'Switch model', icon: <Replace /> },
  { id: 'prompts', label: 'prompts', description: 'Insert a saved prompt', icon: <Bookmark /> },
  { id: 'clear', label: 'clear', description: 'Clear the message box', icon: <Eraser /> },
];

/** Things on screen the `@` can point at. */
export const surfaceItems = (): CommandItem[] => [
  { id: 'notes', label: 'Notes', description: 'Your interview notes', icon: <LayoutGrid /> },
  { id: 'code', label: 'Code', description: 'The solution you are writing', icon: <LayoutGrid /> },
  { id: 'tests', label: 'Tests', description: 'The failing tests', icon: <LayoutGrid /> },
  { id: 'brief', label: 'Brief', description: 'The job description', icon: <FileText /> },
];

/** Props for a static popover: the slash list with its hint. */
export const commandPopoverPropsFactory = (overrides: Partial<CommandPopoverProps> = {}): CommandPopoverProps => ({
  items: slashCommands(),
  label: 'Commands',
  title: 'Commands',
  labelPrefix: '/',
  hint: DEFAULT_COMMAND_HINT,
  activeIndex: 0,
  onSelect: () => undefined,
  className: 'static mb-0 w-80',
  ...overrides,
});

export const commandPopoverVariants: Variant<CommandPopoverProps>[] = [
  { name: 'Slash commands', args: {} },
  { name: 'Mentions', args: { items: surfaceItems(), label: 'Add from Studio', title: 'Add from Studio', labelPrefix: undefined, hint: undefined, activeIndex: 1 } },
  { name: 'Nothing matches', args: { items: [], hideWhenEmpty: false, label: 'Add from Studio', title: 'Add from Studio', labelPrefix: undefined, hint: undefined } },
];
