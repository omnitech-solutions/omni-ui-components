import { useDebouncedCallback } from '@oc-tech/omni-ui-components/lib/chat';
import { act, render } from '@testing-library/react';

describe('useDebouncedCallback', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = (delay = 600) => {
    const callback = jest.fn();
    const ref: { current: ReturnType<typeof useDebouncedCallback<[string]>> | null } = {
      current: null,
    };
    const Probe = () => {
      ref.current = useDebouncedCallback(callback, delay);
      return null;
    };
    const view = render(<Probe />);
    return { callback, ref, ...view };
  };

  it('runs once, with the last arguments, after the quiet period', () => {
    const { callback, ref } = setup();
    act(() => {
      ref.current?.('a');
      ref.current?.('ab');
    });
    act(() => jest.advanceTimersByTime(599));
    expect(callback).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('ab');
  });

  it('flush runs now, cancel drops the call, and unmount flushes a pending call', () => {
    const { callback, ref, unmount } = setup();
    act(() => ref.current?.('x'));
    act(() => ref.current?.flush());
    expect(callback).toHaveBeenLastCalledWith('x');
    act(() => ref.current?.('y'));
    act(() => ref.current?.cancel());
    act(() => jest.advanceTimersByTime(1000));
    expect(callback).toHaveBeenCalledTimes(1);
    act(() => ref.current?.('z'));
    unmount();
    expect(callback).toHaveBeenLastCalledWith('z');
  });
});
