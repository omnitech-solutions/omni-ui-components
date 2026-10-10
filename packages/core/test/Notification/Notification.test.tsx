import '@testing-library/jest-dom';

import { notification } from '@oc-tech/omni-ui-components/Notification';
import { clearRaisedToast } from '@oc-tech/omni-ui-components/Toast';
import { act, screen } from '@testing-library/react';

describe('omni-ui-components/notification', () => {
  afterEach(() => act(() => clearRaisedToast()));

  it('raises the library Toast with the title over the description, not window.alert', () => {
    const alertMock = jest.fn();
    Object.defineProperty(window, 'alert', {
      value: alertMock,
      configurable: true,
      writable: true,
    });
    act(() => notification.info({ message: 'Heads up', description: 'FYI' }));
    const toast = screen.getByRole('status');
    expect(toast.querySelector('[data-slot="notification-title"]')).toHaveTextContent('Heads up');
    expect(toast.querySelector('[data-slot="notification-description"]')).toHaveTextContent('FYI');
    expect(toast.querySelector('[data-tone="info"]')).not.toBeNull();
    expect(alertMock).not.toHaveBeenCalled();
  });

  it('draws no description when none is given, for every tone', () => {
    for (const tone of ['success', 'error', 'warning'] as const) {
      act(() => notification[tone]({ message: `A ${tone}` }));
      const toast = screen.getByRole('status');
      expect(toast).toHaveTextContent(`A ${tone}`);
      expect(toast.querySelector('[data-slot="notification-description"]')).toBeNull();
      expect(toast.querySelector(`[data-tone="${tone}"]`)).not.toBeNull();
    }
  });

  it('stays on screen with duration 0', () => {
    jest.useFakeTimers();
    act(() => notification.success({ message: 'Kept', duration: 0 }));
    act(() => jest.advanceTimersByTime(60000));
    expect(screen.getByRole('status')).toHaveTextContent('Kept');
    jest.useRealTimers();
  });
});
