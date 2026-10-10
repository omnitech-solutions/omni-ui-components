import '@testing-library/jest-dom';

import { message } from '@oc-tech/omni-ui-components/Message';
import { clearRaisedToast } from '@oc-tech/omni-ui-components/Toast';
import { act, fireEvent, screen } from '@testing-library/react';

describe('omni-ui-components/message', () => {
  afterEach(() => act(() => clearRaisedToast()));

  it('raises the library Toast, not window.alert', () => {
    const alertMock = jest.fn();
    Object.defineProperty(window, 'alert', {
      value: alertMock,
      configurable: true,
      writable: true,
    });
    act(() => message.success('Saved'));
    const toast = screen.getByRole('status');
    expect(toast).toHaveTextContent('Saved');
    expect(toast).toHaveAttribute('data-slot', 'toast');
    expect(toast.querySelector('[data-tone="success"]')).not.toBeNull();
    expect(alertMock).not.toHaveBeenCalled();
  });

  it('replaces the message on screen and keeps one host', () => {
    act(() => message.info('First'));
    act(() => message.error('Second'));
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Second');
    expect(screen.getByRole('status').querySelector('[data-tone="error"]')).not.toBeNull();
    expect(document.querySelectorAll('[data-slot="toast-host"]')).toHaveLength(1);
  });

  it('closes on Escape and can be raised again', () => {
    act(() => message.warning('Careful'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(() => message.warning('Again'));
    expect(screen.getByRole('status')).toHaveTextContent('Again');
  });

  it('closes itself after the toast duration', () => {
    jest.useFakeTimers();
    act(() => message.success('Brief'));
    expect(screen.getByRole('status')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(4000));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    jest.useRealTimers();
  });
});
