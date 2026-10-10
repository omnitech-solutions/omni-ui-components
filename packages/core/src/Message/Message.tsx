import { CircleAlert, CircleCheck, CircleX, Info } from 'lucide-react';
import type * as React from 'react';
import { raiseToast } from '../Toast/raiseToast';

export type MessageTone = 'success' | 'error' | 'info' | 'warning';

export type MessageApi = Record<MessageTone, (content: string) => void>;

const toneColor: Record<MessageTone, string> = {
  success: 'var(--oui-tone-success-fg)',
  error: 'var(--oui-tone-danger-fg)',
  info: 'var(--oui-tone-accent-fg)',
  warning: 'var(--oui-tone-warning-fg)',
};
const toneGlyph: Record<MessageTone, React.ReactNode> = {
  success: <CircleCheck />,
  error: <CircleX />,
  info: <Info />,
  warning: <CircleAlert />,
};

/** The icon of a tone, painted from its tone token. Shared with `notification`. */
export const toneIcon = (tone: MessageTone): React.ReactNode => (
  <span data-tone={tone} style={{ display: 'inline-flex', color: toneColor[tone] }}>
    {toneGlyph[tone]}
  </span>
);

const show = (tone: MessageTone) => (content: string) =>
  raiseToast({ text: content, icon: toneIcon(tone), placement: 'top-center' });

/**
 * A short message from anywhere, without rendering a component. It is the library `Toast` (role `status`,
 * dismissed by its timer or Escape), raised at the top centre; one message is on screen at a time.
 */
export const message: MessageApi = {
  success: show('success'),
  error: show('error'),
  info: show('info'),
  warning: show('warning'),
};
