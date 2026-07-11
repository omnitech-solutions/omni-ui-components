import { notification } from '@omnitech/omni-ui-core/Notification';

describe('omni-ui-components/notification', () => {
  it('delegates to window.alert', () => {
    jest.useFakeTimers();
    const alertMock = jest.fn();
    Object.defineProperty(window, 'alert', { value: alertMock, configurable: true, writable: true });
    notification.info({ message: 'Heads up', description: 'FYI' });
    jest.runAllTimers();
    expect(alertMock).toHaveBeenCalledWith('Heads up\n\nFYI');
    jest.useRealTimers();
  });
});
