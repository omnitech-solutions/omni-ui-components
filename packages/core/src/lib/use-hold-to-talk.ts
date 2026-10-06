import * as React from 'react';

/** Options of {@link useHoldToTalk}. Every callback and flag is a prop: nothing is read from a context. */
export interface HoldToTalkOptions {
  /** A `KeyboardEvent.code`, such as `AltRight`. Empty turns the shortcut off. */
  code: string;
  /** Off: no listener is attached. */
  enabled: boolean;
  /** Dictation is running now (a hold does not start a second one; a tap finishes it). */
  active: boolean;
  /** Start dictating (a tap while idle, or a hold past `holdMs`). */
  onStart: () => void | Promise<void>;
  /** Finish dictating (a tap while active, release after a hold, or the window losing focus mid-hold). */
  onFinish: () => void | Promise<void>;
  /** How long the key must be held on its own to count as push-to-talk. Default 500. */
  holdMs?: number;
}

/**
 * Dictation from one key pressed on its own (by default the right Option key): a tap toggles dictation, and holding
 * the key for `holdMs` dictates until it is released. Pressing any other key while it is down cancels the gesture,
 * so Option chords and accented letters still type. Leaving the window mid-hold finishes the dictation.
 * Listens on the capture phase at `window`, as the original does. Ported from omnitech-assistant `useDictationKey`.
 *
 * @example
 * useHoldToTalk({ code: 'AltRight', enabled: true, active, onStart: start, onFinish: finish });
 */
export function useHoldToTalk(options: HoldToTalkOptions): void {
  // The latest callbacks and state, read when the key events arrive.
  const latest = React.useRef(options);
  latest.current = options;
  React.useEffect(() => {
    if (!options.enabled || !options.code) return;
    const holdMs = options.holdMs ?? 500;
    let down = false;
    let held = false;
    let interrupted = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = () => {
      clearTimeout(timer);
      down = held = interrupted = false;
    };
    const onDown = (event: KeyboardEvent) => {
      if (event.code !== latest.current.code) {
        // [GUARD] A chord (Option+E, Option+arrow...) is typing, not dictation.
        if (down) interrupted = true;
        return;
      }
      if (event.repeat || down) return;
      down = true;
      held = false;
      interrupted = false;
      // Held long enough on its own: push-to-talk.
      timer = setTimeout(() => {
        if (!down || interrupted || latest.current.active) return;
        held = true;
        void latest.current.onStart();
      }, holdMs);
    };
    const onUp = (event: KeyboardEvent) => {
      if (event.code !== latest.current.code || !down) return;
      const wasHeld = held;
      const wasInterrupted = interrupted;
      reset();
      if (wasInterrupted) return;
      if (wasHeld || latest.current.active) void latest.current.onFinish();
      else void latest.current.onStart();
    };
    // Leaving the window mid-press must not leave the gesture half done.
    const onBlur = () => {
      if (held) void latest.current.onFinish();
      reset();
    };
    window.addEventListener('keydown', onDown, true);
    window.addEventListener('keyup', onUp, true);
    window.addEventListener('blur', onBlur);
    return () => {
      reset();
      window.removeEventListener('keydown', onDown, true);
      window.removeEventListener('keyup', onUp, true);
      window.removeEventListener('blur', onBlur);
    };
  }, [options.enabled, options.code, options.holdMs]);
}

/** `AltRight` becomes `Right ⌥` for shortcut lists and button titles. */
export function describeHoldKey(code: string): string {
  const side = code.endsWith('Right') ? 'Right ' : code.endsWith('Left') ? 'Left ' : '';
  const key = code.replace(/(Left|Right)$/, '');
  const names: Record<string, string> = { Alt: '⌥', Meta: '⌘', Control: '⌃', Shift: '⇧' };
  return `${side}${names[key] ?? key}`;
}
