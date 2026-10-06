import '@testing-library/jest-dom';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { describeHoldKey, useHoldToTalk } from '../../src/lib/use-hold-to-talk';

// A stand-in for dictation that records what the key asked for.
function setup(code = 'AltRight', holdMs?: number) {
  const log: string[] = [];
  let active = false;
  const hook = renderHook(() =>
    useHoldToTalk({
      code,
      enabled: true,
      active,
      holdMs,
      onStart: () => {
        active = true;
        log.push('start');
      },
      onFinish: () => {
        active = false;
        log.push('finish');
      },
    }),
  );
  const press = (key: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(window, { code: key, ...init });
  const release = (key: string) => fireEvent.keyUp(window, { code: key });
  return {
    log,
    press,
    release,
    tap: () => {
      press(code);
      release(code);
      hook.rerender();
    },
    rerender: () => hook.rerender(),
    unmount: hook.unmount,
  };
}

describe('omni-ui-components/lib/useHoldToTalk', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts on a tap of the key and finishes on the next tap', () => {
    const key = setup();
    key.tap();
    expect(key.log).toEqual(['start']);
    key.tap();
    expect(key.log).toEqual(['start', 'finish']);
  });

  it('dictates while the key is held past holdMs (500 by default) and finishes on release', () => {
    const key = setup();
    key.press('AltRight');
    act(() => vi.advanceTimersByTime(499));
    expect(key.log).toEqual([]);
    act(() => vi.advanceTimersByTime(1));
    expect(key.log).toEqual(['start']);
    key.rerender();
    key.release('AltRight');
    expect(key.log).toEqual(['start', 'finish']);
  });

  it('holdMs is configurable', () => {
    const key = setup('AltRight', 200);
    key.press('AltRight');
    act(() => vi.advanceTimersByTime(200));
    expect(key.log).toEqual(['start']);
  });

  it('ignores a held auto-repeat', () => {
    const key = setup();
    key.press('AltRight');
    key.press('AltRight', { repeat: true });
    act(() => vi.advanceTimersByTime(500));
    expect(key.log).toEqual(['start']);
  });

  it('any other key cancels the gesture, so Option chords and accented letters still type', () => {
    const key = setup();
    key.press('AltRight');
    key.press('KeyE');
    act(() => vi.advanceTimersByTime(800));
    key.release('KeyE');
    key.release('AltRight');
    expect(key.log).toEqual([]);
    key.tap();
    expect(key.log).toEqual(['start']);
    // The left Option key does nothing on its own.
    const other = setup();
    other.press('AltLeft');
    other.release('AltLeft');
    expect(other.log).toEqual([]);
  });

  it('losing window focus mid-hold finishes the dictation', () => {
    const key = setup();
    key.press('AltRight');
    act(() => vi.advanceTimersByTime(500));
    key.rerender();
    fireEvent.blur(window);
    expect(key.log).toEqual(['start', 'finish']);
  });

  it('is inert when disabled, with an empty code, or after unmount', () => {
    const off = renderHook(() => useHoldToTalk({ code: '', enabled: true, active: false, onStart: () => undefined, onFinish: () => undefined }));
    off.unmount();
    const key = setup();
    key.unmount();
    key.press('AltRight');
    key.release('AltRight');
    expect(key.log).toEqual([]);
  });

  it('names the key for shortcut lists', () => {
    expect(describeHoldKey('AltRight')).toBe('Right ⌥');
    expect(describeHoldKey('MetaLeft')).toBe('Left ⌘');
    expect(describeHoldKey('F9')).toBe('F9');
  });
});
