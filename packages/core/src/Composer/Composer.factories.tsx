import {
  type AttachmentItem,
  type FileRejection,
  useFilePreviews,
} from '@oc-tech/omni-ui-components/Attachment';
import type { CommandItem } from '@oc-tech/omni-ui-components/CommandPopover';
import {
  CommandPopover,
  DEFAULT_COMMAND_HINT,
  MENTION_PATTERN,
  mentionTrigger,
  SAVED_PROMPTS_PATTERN,
  SLASH_PATTERN,
  savedPromptsTrigger,
  slashTrigger,
  useCommandTrigger,
} from '@oc-tech/omni-ui-components/CommandPopover';
import {
  Composer,
  ComposerNotice,
  type ComposerProps,
  PlusMenu,
} from '@oc-tech/omni-ui-components/Composer';
import type { QueuedItem } from '@oc-tech/omni-ui-components/QueuedList';
import {
  ArrowUp,
  AtSign,
  Bookmark,
  Check,
  Clock,
  EyeOff,
  Image as ImageIcon,
  ListPlus,
  Mic,
  Paperclip,
  Plus,
  Square,
  X,
} from 'lucide-react';
import * as React from 'react';
import type { Variant } from '../../internal/support/makeFactory';
import { attachmentIcons } from '../Attachment/Attachment.factories';
import {
  type SavedPrompt,
  savedPrompts,
  slashCommands,
  surfaceItems,
} from '../CommandPopover/CommandPopover.factories';
import type { OnAction } from '../SplitButton/SplitButton.factories';

/** Composer props with the icons and strings a story needs (icons are nodes, so the factory supplies them). */
export const composerPropsFactory = (overrides: Partial<ComposerProps> = {}): ComposerProps => ({
  value: '',
  onChange: () => undefined,
  onSubmit: () => undefined,
  placeholder: 'Ask anything  ·  / for commands  ·  @ to add context',
  sendIcon: <ArrowUp />,
  stopIcon: <Square />,
  queueIcon: <ListPlus />,
  ...overrides,
});

const rejectionText = (rejection: FileRejection) =>
  rejection.code === 'too-many'
    ? 'Attach up to 10 files'
    : rejection.code === 'too-large'
      ? `${rejection.file?.name ?? 'That file'} is larger than 10 MB`
      : `${rejection.file?.name ?? 'That file'} is not a supported type`;

export interface ComposerDemoProps {
  variant?: 'stacked' | 'pill';
  /** A reply is running: the send button is Stop (empty) or Queue (text). */
  streaming?: boolean;
  initialValue?: string;
  placeholder?: string;
  /** Files: the `+` menu, picker, paste and drop (with overlay). Default true. */
  attachments?: boolean;
  /** `/` commands. Default true. */
  commands?: boolean;
  /** `@` mentions with an async source. Default true. */
  mentions?: boolean;
  /** The mic, the hold-to-talk key and the dictation bar. Default true. */
  dictation?: boolean;
  /** Rows already queued. */
  queued?: QueuedItem[];
  /** Files already attached, to show states without interaction. */
  initialItems?: AttachmentItem[];
  /** Show the vision warning callout. */
  warning?: boolean;
  /** Earlier prompts: ArrowUp on the first line recalls the newest, further Ups go back, ArrowDown on the last line comes forward. */
  history?: string[];
  sendOnEnter?: boolean;
  /** A message to show as the hint line. */
  hint?: string;
  onAction?: OnAction;
}

/**
 * Prompt history for `onRecallPrevious` / `onRecallNext`: a cursor over `sent` that starts past the newest entry. Previous walks back
 * (stopping at the oldest), next walks forward and answers nothing past the newest, which makes the Composer put the draft back.
 */
export const usePromptHistory = (sent: readonly string[]) => {
  const at = React.useRef<number | null>(null);
  return {
    previous: () => {
      if (sent.length === 0) return undefined;
      at.current = at.current === null ? sent.length - 1 : Math.max(0, at.current - 1);
      return sent[at.current];
    },
    next: () => {
      if (at.current === null) return undefined;
      if (at.current >= sent.length - 1) {
        at.current = null;
        return undefined;
      }
      at.current += 1;
      return sent[at.current];
    },
    reset: () => {
      at.current = null;
    },
  };
};

const DICTATION_WORDS = ['walk', 'me', 'through', 'the', 'two', 'pointer', 'approach'];

/**
 * The whole chat composer, wired the way a host would: state in the demo (the host owns `value`, the attachment list
 * and the queue), every part from the library through the Composer's own props and callbacks. Nothing here is clever:
 * `onSubmit` is called with `{ value, attachments }` and the demo clears its own draft.
 */
export const ComposerDemo: React.FC<ComposerDemoProps> = ({
  variant = 'stacked',
  streaming = false,
  initialValue = '',
  placeholder = 'Ask anything  ·  / for commands  ·  @ to add context',
  attachments = true,
  commands = true,
  mentions = true,
  dictation = true,
  queued = [],
  initialItems = [],
  warning = false,
  history = ['Walk me through two sum', 'Explain Big O of the hash map'],
  sendOnEnter = true,
  hint,
  onAction,
}) => {
  const [value, setValue] = React.useState(initialValue);
  const [files, setFiles] = React.useState<File[]>([]);
  const [extra, setExtra] = React.useState<AttachmentItem[]>(initialItems);
  const [queue, setQueue] = React.useState<QueuedItem[]>(queued);
  const [sent, setSent] = React.useState<string[]>(history);
  const [problem, setProblem] = React.useState<string | null>(null);
  const [surfaces, setSurfaces] = React.useState<AttachmentItem[]>([]);
  const [listening, setListening] = React.useState(false);
  const [heard, setHeard] = React.useState('');
  const area = React.useRef<HTMLTextAreaElement>(null);
  const promptHistory = usePromptHistory(sent);
  const previews = useFilePreviews(files);

  // One list for the strip: the demo builds the items; they come back by reference in every callback.
  const items: AttachmentItem[] = [
    ...surfaces,
    ...extra,
    ...files.map((file, at) => ({
      id: `f:${at}:${file.name}`,
      name: file.name,
      kind: file.type.startsWith('image/') ? ('image' as const) : ('file' as const),
      meta: file.type.startsWith('image/') ? 'Image' : 'File',
      previewUrl: previews.get(file),
    })),
  ];
  const removeItem = (item: AttachmentItem) => {
    if (item.id.startsWith('s:')) setSurfaces((all) => all.filter((surface) => surface !== item));
    else if (item.id.startsWith('f:'))
      setFiles((all) => all.filter((file, at) => `f:${at}:${file.name}` !== item.id));
    else setExtra((all) => all.filter((candidate) => candidate !== item));
    onAction?.('remove-attachment', item.id);
  };

  const focusInput = () => area.current?.focus();
  const command = useCommandTrigger({
    value,
    disabled: !commands && !mentions,
    onAfterPick: focusInput,
    triggers: [
      ...(commands
        ? [
            slashTrigger({
              source: slashCommands(),
              onPick: (item) => {
                onAction?.('command', item.id);
                // `/prompts` hands over to the saved-prompts trigger instead of clearing the box.
                setValue(item.id === 'prompts' ? '/prompts ' : '');
                if (item.id === 'clear') {
                  setFiles([]);
                  setExtra([]);
                  setSurfaces([]);
                }
              },
              popover: { label: 'Commands', title: 'Commands', hint: DEFAULT_COMMAND_HINT },
            }),
          ]
        : []),
      ...(commands
        ? [
            savedPromptsTrigger<SavedPrompt>({
              // Async on purpose, like a library searched on a server.
              source: (query) =>
                new Promise<SavedPrompt[]>((resolve) =>
                  setTimeout(
                    () =>
                      resolve(
                        savedPrompts().filter((item) =>
                          `${item.label} ${item.description}`
                            .toLowerCase()
                            .includes(query.trim().toLowerCase()),
                        ),
                      ),
                    60,
                  ),
                ),
              onPick: (item) => {
                setValue(item.text);
                onAction?.('saved-prompt', item.id);
              },
              popover: {
                label: 'Saved prompts',
                title: 'Saved prompts',
                hint: DEFAULT_COMMAND_HINT,
              },
            }),
          ]
        : []),
      ...(mentions
        ? [
            mentionTrigger({
              // Async on purpose: the popover shows the latest answer only.
              source: (query) =>
                new Promise<CommandItem[]>((resolve) =>
                  setTimeout(
                    () =>
                      resolve(
                        surfaceItems().filter(
                          (item) =>
                            item.label.toLowerCase().includes(query.toLowerCase()) &&
                            !surfaces.some((s) => s.id === `s:${item.id}`),
                        ),
                      ),
                    80,
                  ),
                ),
              onPick: (item, { draft }) => {
                setValue(draft.replace(/@[^\s@]*$/, ''));
                setSurfaces((all) => [
                  ...all,
                  { id: `s:${item.id}`, name: item.label, kind: 'surface', meta: 'From Studio' },
                ]);
                onAction?.('mention', item.id);
              },
              popover: { label: 'Add from Studio', title: 'Add from Studio' },
            }),
          ]
        : []),
    ],
  });

  // Dictation: a stand-in recogniser that "hears" a word every 350ms while listening.
  React.useEffect(() => {
    if (!listening) return;
    setHeard('');
    let at = 0;
    const timer = setInterval(() => {
      at += 1;
      setHeard(DICTATION_WORDS.slice(0, at).join(' '));
      if (at >= DICTATION_WORDS.length) clearInterval(timer);
    }, 350);
    return () => clearInterval(timer);
  }, [listening]);

  const hasImage = items.some((item) => item.kind === 'image');
  return (
    <Composer
      variant={variant}
      value={value}
      onChange={setValue}
      onSubmit={({ value: text, attachments: atts }) => {
        setSent((all) => [...all, text]);
        promptHistory.reset();
        onAction?.('send', { text, files: atts.map((item) => item.name) });
        setValue('');
        setFiles([]);
        setExtra([]);
        setSurfaces([]);
      }}
      onQueue={({ value: text }) => {
        setQueue((all) => [...all, { id: `q${all.length}-${text}`, text }]);
        onAction?.('queue', text);
        setValue('');
      }}
      onStop={() => onAction?.('stop')}
      streaming={streaming}
      placeholder={placeholder}
      sendOnEnter={sendOnEnter}
      inputRef={area}
      onFocus={() => onAction?.('focus')}
      onBlur={() => onAction?.('blur')}
      onBeforeKeyDown={command.onKeyDown}
      onRecallPrevious={promptHistory.previous}
      onRecallNext={promptHistory.next}
      // A textarea may not take the combobox role (ARIA in HTML): it stays a textbox that names the list it
      // drives. `aria-expanded` belongs to the combobox role, so it is not set.
      textareaProps={{
        'aria-controls': command.open ? command.listboxId : undefined,
        'aria-activedescendant': command.activeDescendant,
        'aria-autocomplete': 'list',
      }}
      attachmentItems={items}
      attachmentRemoveIcon={<X />}
      attachmentKindIcons={attachmentIcons}
      onRemoveAttachment={removeItem}
      onAttachmentClick={(item) => onAction?.('attachment-click', item.id)}
      onFiles={
        attachments
          ? (next) => {
              setProblem(null);
              setFiles((all) => [...all, ...next]);
              onAction?.(
                'files',
                next.map((file) => file.name),
              );
            }
          : undefined
      }
      onReject={(rejection) => {
        setProblem(rejectionText(rejection));
        onAction?.('reject', rejection.code);
      }}
      queued={queue}
      queuedIcon={<Clock />}
      queuedRemoveIcon={<X />}
      onRemoveQueued={(item) => setQueue((all) => all.filter((candidate) => candidate !== item))}
      triggers={[
        { id: 'slash', pattern: SLASH_PATTERN },
        { id: 'mention', pattern: MENTION_PATTERN },
        { id: 'saved-prompts', pattern: SAVED_PROMPTS_PATTERN },
      ]}
      onTrigger={(event) => onAction?.('trigger', event)}
      onDictationStart={
        dictation
          ? () => {
              setListening(true);
              onAction?.('dictation-start');
            }
          : undefined
      }
      dictating={dictation ? listening : undefined}
      dictationText={heard}
      dictationKey="AltRight"
      onDictationFinish={(text) => {
        setListening(false);
        if (text) setValue((current) => (current ? `${current} ${text}` : text));
        onAction?.('dictation-finish', text);
      }}
      onDictationCancel={() => {
        setListening(false);
        onAction?.('dictation-cancel');
      }}
      micIcon={<Mic />}
      dictationCancelIcon={<X />}
      dictationDoneIcon={<Check />}
      sendIcon={<ArrowUp />}
      stopIcon={<Square />}
      queueIcon={<ListPlus />}
      leading={(api) => (
        <PlusMenu
          icon={<Plus />}
          appearance={variant === 'pill' ? 'plain' : 'outlined'}
          items={[
            ...(attachments
              ? [
                  {
                    id: 'file',
                    icon: <Paperclip />,
                    label: 'Upload a file',
                    description: 'Text, Markdown or PDF',
                    onClick: api.openPicker,
                  },
                  {
                    id: 'image',
                    icon: <ImageIcon />,
                    label: 'Add an image',
                    description: 'Or paste a screenshot',
                    onClick: api.openPicker,
                  },
                ]
              : []),
            ...(mentions
              ? [
                  {
                    id: 'mention',
                    icon: <AtSign />,
                    label: 'Add from Studio',
                    description: 'Point the assistant at something on screen',
                    onClick: () => {
                      setValue(
                        (current) => `${current}${current && !current.endsWith(' ') ? ' @' : '@'}`,
                      );
                      setTimeout(api.focus, 0);
                    },
                  },
                ]
              : []),
            {
              id: 'prompts',
              icon: <Bookmark />,
              label: 'Saved prompts',
              description: 'Your prompt library',
              separated: true,
              onClick: () => {
                setValue('/prompts ');
                setTimeout(api.focus, 0);
                onAction?.('prompts');
              },
            },
          ]}
        />
      )}
      above={
        <>
          {warning || hasImage ? (
            <ComposerNotice
              icon={<EyeOff />}
              message="Haiku can’t see images. Switch to Sonnet?"
              action={{ label: 'Switch', onClick: () => onAction?.('switch-model') }}
            />
          ) : null}
          {problem ? <ComposerNotice tone="danger" message={problem} /> : null}
        </>
      }
      popover={({ anchor }) =>
        command.open ? <CommandPopover {...command.popoverProps} anchor={anchor} /> : null
      }
      hint={
        hint ??
        (streaming
          ? 'Replying… keep typing to queue your next message · Esc to stop'
          : '⌘J to show or hide · / for commands · @ to add context')
      }
    />
  );
};

export const composerVariants: Variant<ComposerDemoProps>[] = [
  { name: 'Stacked', args: {} },
  { name: 'Pill', args: { variant: 'pill' } },
  { name: 'Replying (stop)', args: { streaming: true } },
  {
    name: 'Queued',
    args: {
      streaming: true,
      initialValue: 'Also check the O(n log n) version',
      queued: [{ id: 'q', text: 'And the space trade-off?' }],
    },
  },
];
