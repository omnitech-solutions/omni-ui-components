import * as React from 'react';

/** True on Apple platforms (⌘ ⇧ ⌥ glyphs). Pass a platform string to test; default reads `navigator.platform`. */
export const isMac = (platform: string = globalThis.navigator?.platform ?? ''): boolean => /Mac|iPhone|iPad/.test(platform);

/**
 * Does the keyboard event match a shortcut string such as `mod+shift+o`? `mod` is Meta or Ctrl, `shift` and `alt` are
 * exact (an unlisted modifier must be up). The last part is the key; it matches `event.key` (case-insensitive) or the
 * physical key (`KeyO`, `Digit1`), so ⌥ on a Mac (which changes `event.key`) still matches.
 */
export const matchesShortcut = (event: Pick<KeyboardEvent, 'key' | 'code' | 'metaKey' | 'ctrlKey' | 'shiftKey' | 'altKey'>, shortcut: string): boolean => {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts[parts.length - 1];
  const wants = (name: string) => parts.includes(name);
  const code = (event.code ?? '').toLowerCase();
  const keyMatches = (event.key ?? '').toLowerCase() === key || code === `key${key}` || code === `digit${key}`;
  return keyMatches && (event.metaKey || event.ctrlKey) === wants('mod') && event.shiftKey === wants('shift') && event.altKey === wants('alt');
};

/** The key glyphs of a shortcut, one entry per key: `mod+shift+o` is `['⌘', '⇧', 'O']` on a Mac and `['Ctrl', '⇧', 'O']` elsewhere. */
export const describeShortcutKeys = (shortcut: string, mac: boolean = isMac()): string[] =>
  shortcut.split('+').map((part) => {
    const name = part.toLowerCase();
    if (name === 'mod') return mac ? '⌘' : 'Ctrl';
    if (name === 'shift') return '⇧';
    if (name === 'alt') return mac ? '⌥' : 'Alt';
    return part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1);
  });

/** A shortcut as text: `mod+shift+o` is `⌘ ⇧ O` on a Mac. Use `separator: ''` for `⌘⇧O`. */
export const describeShortcut = (shortcut: string, options: { mac?: boolean; separator?: string } = {}): string =>
  describeShortcutKeys(shortcut, options.mac).join(options.separator ?? ' ');

export interface HotkeyBinding {
  /** A shortcut string such as `mod+k`. */
  shortcut: string;
  /** Called when the shortcut is pressed; `preventDefault` has already run unless `preventDefault: false`. */
  handler: (event: KeyboardEvent) => void;
  /** Default true. */
  preventDefault?: boolean;
}

export interface UseHotkeysOptions {
  /** Turn every binding off (default true). */
  enabled?: boolean;
  /** Where to listen. Default `window`. */
  target?: Pick<Window, 'addEventListener' | 'removeEventListener'> | null;
}

/**
 * Listens for shortcut strings on `window`: the first binding that matches handles the event. Bindings may change on
 * every render (the latest list is read through a ref), so callers never memoise them.
 *
 * @example
 * useHotkeys([{ shortcut: 'mod+k', handler: () => searchRef.current?.focus() }]);
 */
export const useHotkeys = (bindings: readonly HotkeyBinding[], options: UseHotkeysOptions = {}): void => {
  const { enabled = true } = options;
  const latest = React.useRef(bindings);
  latest.current = bindings;
  const target = options.target === undefined ? (typeof window === 'undefined' ? null : window) : options.target;
  React.useEffect(() => {
    if (!enabled || !target) return undefined;
    const onKeyDown = (event: Event) => {
      const keyboard = event as KeyboardEvent;
      const hit = latest.current.find((binding) => matchesShortcut(keyboard, binding.shortcut));
      if (!hit) return;
      if (hit.preventDefault !== false) keyboard.preventDefault();
      hit.handler(keyboard);
    };
    target.addEventListener('keydown', onKeyDown);
    return () => target.removeEventListener('keydown', onKeyDown);
  }, [enabled, target]);
};
