import { message } from '@oc-tech/omni-ui-components/Message';

describe('omni-ui-components/message', () => {
  it('delegates to window.alert', () => {
    jest.useFakeTimers();
    const alertMock = jest.fn();
    Object.defineProperty(window, 'alert', { value: alertMock, configurable: true, writable: true });
    message.success('Saved');
    jest.runAllTimers();
    expect(alertMock).toHaveBeenCalledWith('Saved');
    jest.useRealTimers();
  });
});
