import { Button } from '@oc-tech/omni-ui-components/Button';
import type { CommandItem, CommandPopoverProps } from '@oc-tech/omni-ui-components/CommandPopover';
import { CommandPopover, DEFAULT_COMMAND_HINT } from '@oc-tech/omni-ui-components/CommandPopover';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalTitle,
} from '@oc-tech/omni-ui-components/Modal';
import { Bookmark, Eraser, FileText, LayoutGrid, Replace, SquarePen } from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';

/** The built-in commands of the original composer (`/new`, `/model`, `/prompts`, `/clear`). `id` is the command word. */
export const slashCommands = (): CommandItem[] => [
  { id: 'new', label: 'new', description: 'Start a new conversation', icon: <SquarePen /> },
  { id: 'model', label: 'model', description: 'Switch model', icon: <Replace /> },
  { id: 'prompts', label: 'prompts', description: 'Insert a saved prompt', icon: <Bookmark /> },
  { id: 'clear', label: 'clear', description: 'Clear the message box', icon: <Eraser /> },
];

/** A saved prompt: a `CommandItem` that also carries the text to insert (an extended item: `onPick` hands this object back). */
export interface SavedPrompt extends CommandItem {
  text: string;
}

/** The prompt library behind `/prompts `. */
export const savedPrompts = (): SavedPrompt[] => [
  {
    id: 'star',
    label: 'STAR answer',
    description: 'Situation, task, action, result',
    icon: <Bookmark />,
    text: 'Answer this as a STAR story: situation, task, action, result.',
  },
  {
    id: 'complexity',
    label: 'Complexity review',
    description: 'Time and space, best and worst',
    icon: <Bookmark />,
    text: 'Review this solution for time and space complexity, best and worst case.',
  },
  {
    id: 'edge',
    label: 'Edge cases',
    description: 'Empty, single, duplicates, limits',
    icon: <Bookmark />,
    text: 'List the edge cases for this problem and a test for each.',
  },
  {
    id: 'aloud',
    label: 'Say it aloud',
    description: '60 second spoken version',
    icon: <Bookmark />,
    text: 'Give me a 60 second version I can say aloud.',
  },
];

/** Things on screen the `@` can point at. */
export const surfaceItems = (): CommandItem[] => [
  { id: 'notes', label: 'Notes', description: 'Your interview notes', icon: <LayoutGrid /> },
  { id: 'code', label: 'Code', description: 'The solution you are writing', icon: <LayoutGrid /> },
  { id: 'tests', label: 'Tests', description: 'The failing tests', icon: <LayoutGrid /> },
  { id: 'brief', label: 'Brief', description: 'The job description', icon: <FileText /> },
];

/** Props for a static popover: the slash list with its hint. */
export const commandPopoverPropsFactory = (
  overrides: Partial<CommandPopoverProps> = {},
): CommandPopoverProps => ({
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
  {
    name: 'Mentions',
    args: {
      items: surfaceItems(),
      label: 'Add from Studio',
      title: 'Add from Studio',
      labelPrefix: undefined,
      hint: undefined,
      activeIndex: 1,
    },
  },
  {
    name: 'Nothing matches',
    args: {
      items: [],
      hideWhenEmpty: false,
      label: 'Add from Studio',
      title: 'Add from Studio',
      labelPrefix: undefined,
      hint: undefined,
    },
  },
];

/** A palette row: a command that carries what it runs. The extra field reaches `onSelect` untouched. */
export interface PaletteCommand extends CommandItem {
  run: string;
}

export const paletteCommands = (): PaletteCommand[] => [
  { id: 'home', label: 'Go to Home', group: 'Navigate', shortcut: ['G', 'H'], run: 'open:home' },
  {
    id: 'people',
    label: 'Go to People',
    group: 'Navigate',
    shortcut: ['G', 'P'],
    run: 'open:people',
  },
  { id: 'new', label: 'New record', group: 'Create', shortcut: ['N'], run: 'create:record' },
  { id: 'import', label: 'Import a file', group: 'Create', run: 'create:import' },
  { id: 'theme', label: 'Switch theme', group: 'Preferences', run: 'toggle:theme' },
];

/**
 * A command palette from library parts: `Modal` holds a `CommandPopover` with `search` and `placement="inline"`.
 * The popover owns the query, the filtering and the keys; the host owns `open` and what a command does.
 */
export const CommandPalette: React.FC<{ onRun?: (command: PaletteCommand) => void }> = ({
  onRun,
}) => {
  const [open, setOpen] = React.useState(false);
  const [last, setLast] = React.useState<string | null>(null);
  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open commands
      </Button>
      {last ? <p>Ran: {last}</p> : null}
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent>
          <ModalTitle className="sr-only">Commands</ModalTitle>
          <ModalDescription className="sr-only">
            Type to filter, then choose a command.
          </ModalDescription>
          <CommandPopover<PaletteCommand>
            label="Commands"
            placement="inline"
            search={{ label: 'Search commands', placeholder: 'Type a command' }}
            labels={{ empty: 'No command matches' }}
            items={paletteCommands()}
            onClose={() => setOpen(false)}
            onSelect={(command) => {
              setLast(command.label);
              onRun?.(command);
              setOpen(false);
            }}
          />
        </ModalContent>
      </Modal>
    </div>
  );
};
