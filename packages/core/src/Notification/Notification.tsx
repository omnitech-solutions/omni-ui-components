import { type MessageTone, toneIcon } from '../Message/Message';
import { raiseToast } from '../Toast/raiseToast';

export interface NotificationArgs {
  message: string;
  description?: string;
  /** Milliseconds on screen; 0 keeps it until Escape. Default: the toast's. */
  duration?: number;
}

export type NotificationApi = Record<MessageTone, (args: NotificationArgs) => void>;

const show =
  (tone: MessageTone) =>
  ({ message, description, duration }: NotificationArgs) =>
    raiseToast({
      text: (
        <span style={{ display: 'grid', gap: 2 }}>
          <strong data-slot="notification-title">{message}</strong>
          {description ? <span data-slot="notification-description">{description}</span> : null}
        </span>
      ),
      icon: toneIcon(tone),
      duration,
      placement: 'top-right',
    });

/**
 * A titled notice from anywhere, without rendering a component. It is the library `Toast` (role `status`), raised
 * at the top right with the title over the description; one notice is on screen at a time.
 */
export const notification: NotificationApi = {
  success: show('success'),
  error: show('error'),
  info: show('info'),
  warning: show('warning'),
};
