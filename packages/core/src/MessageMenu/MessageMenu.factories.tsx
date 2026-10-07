import * as React from 'react';
import { Copy, Download, Ellipsis, Eye, EyeOff, Trash2, TriangleAlert } from 'lucide-react';

import { MessageMenu, type MessageItem, type MessageMenuProps } from '@oc-tech/omni-ui-components/MessageMenu';
import type { Variant } from '../../internal/support/makeFactory';

export const sampleMessage: MessageItem = { id: 'm1', role: 'assistant', text: 'Here is the plan: ship the menu, then the thread.' };

export const sampleConversation = {
  title: 'Plan the launch',
  messages: [
    { role: 'user', text: 'What is the plan?' },
    { role: 'assistant', text: sampleMessage.text },
  ],
};

export const messageMenuIcons = {
  copy: <Copy />,
  hide: <EyeOff />,
  unhide: <Eye />,
  delete: <Trash2 />,
  download: <Download />,
  confirm: <TriangleAlert />,
};

/** Build `<MessageMenu>` props for stories and tests. */
export const messageMenuPropsFactory = <T extends MessageItem = MessageItem>(overrides: Partial<MessageMenuProps<T>> = {}): MessageMenuProps<T> =>
  ({
    message: sampleMessage as T,
    trigger: (
      <button type="button" aria-label="More">
        <Ellipsis />
      </button>
    ),
    icons: messageMenuIcons,
    onCopy: () => undefined,
    onHide: () => undefined,
    onDelete: () => undefined,
    ...overrides,
  }) as MessageMenuProps<T>;

export const messageMenuVariants: Variant<MessageMenuProps>[] = [
  { name: 'All rows', args: {} },
  { name: 'Hidden message', args: { message: { ...sampleMessage, hidden: true } } },
  { name: 'With download', args: { conversation: sampleConversation } },
  { name: 'Copy only', args: { onHide: undefined, onDelete: undefined } },
];

/** A message with state: Hide flips `hidden`, Delete removes it. */
export const MessageMenuDemo: React.FC<Partial<MessageMenuProps> & { onAction?: (name: string) => void }> = ({ onAction, ...props }) => {
  const [message, setMessage] = React.useState<MessageItem | null>(sampleMessage);
  if (!message) return <p className="p-6 text-sm">Message deleted.</p>;
  return (
    <div className="min-h-[360px] p-6">
      <p className={message.hidden ? 'mb-3 text-sm opacity-50' : 'mb-3 text-sm'}>{message.hidden ? 'Hidden message' : message.text}</p>
      <MessageMenu
        {...messageMenuPropsFactory(props)}
        message={message}
        onCopy={() => onAction?.('copy')}
        onHide={(m) => {
          onAction?.('hide');
          setMessage({ ...m, hidden: !m.hidden });
        }}
        onDelete={() => {
          onAction?.('delete');
          setMessage(null);
        }}
      />
    </div>
  );
};
