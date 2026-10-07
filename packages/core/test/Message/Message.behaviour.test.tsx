import { vi } from 'vitest';

import { message } from '@oc-tech/omni-ui-components/Message';
import { notification } from '@oc-tech/omni-ui-components/Notification';

describe('message and notification', () => {
  let alert: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    vi.useFakeTimers();
    alert = vi.fn();
    window.alert = alert as never;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(['success', 'error', 'info', 'warning'] as const)('message.%s alerts the content on the next tick, not synchronously', (kind) => {
    message[kind]('Saved');
    expect(alert).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(alert).toHaveBeenCalledWith('Saved');
  });

  it.each(['success', 'error', 'info', 'warning'] as const)('notification.%s alerts the message, with its description after a blank line', (kind) => {
    notification[kind]({ message: 'Heads up' });
    vi.runAllTimers();
    expect(alert).toHaveBeenLastCalledWith('Heads up');
    notification[kind]({ message: 'Heads up', description: 'Details here' });
    vi.runAllTimers();
    expect(alert).toHaveBeenLastCalledWith('Heads up\n\nDetails here');
  });
});
