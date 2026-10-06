import { fireEvent, render } from '@testing-library/react';

import { describeShortcut, describeShortcutKeys, matchesShortcut, useHotkeys } from '@oc-tech/omni-ui-components/lib/chat';

const key = (init: Partial<KeyboardEvent>) => ({ key: '', code: '', metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, ...init });

describe('shortcuts', () => {
  it('describes mod, shift and alt for Mac and other platforms', () => {
    expect(describeShortcut('mod+shift+o', { mac: true })).toBe('⌘ ⇧ O');
    expect(describeShortcut('mod+shift+o', { mac: false })).toBe('Ctrl ⇧ O');
    expect(describeShortcut('mod+alt+k', { mac: true, separator: '' })).toBe('⌘⌥K');
    expect(describeShortcut('mod+alt+k', { mac: false })).toBe('Ctrl Alt K');
    expect(describeShortcutKeys('esc')).toEqual(['Esc']);
  });

  it('matches mod as Meta or Ctrl and requires exact shift and alt', () => {
    expect(matchesShortcut(key({ key: 'k', metaKey: true }), 'mod+k')).toBe(true);
    expect(matchesShortcut(key({ key: 'K', ctrlKey: true }), 'mod+k')).toBe(true);
    expect(matchesShortcut(key({ key: 'k' }), 'mod+k')).toBe(false);
    expect(matchesShortcut(key({ key: 'k', metaKey: true, shiftKey: true }), 'mod+k')).toBe(false);
    expect(matchesShortcut(key({ key: 'o', metaKey: true, shiftKey: true }), 'mod+shift+o')).toBe(true);
    expect(matchesShortcut(key({ key: 'o', metaKey: true, shiftKey: true, altKey: true }), 'mod+shift+o')).toBe(false);
  });

  it('matches the physical key when alt changes `event.key` (Option on a Mac)', () => {
    expect(matchesShortcut(key({ key: 'ø', code: 'KeyO', metaKey: true, altKey: true }), 'mod+alt+o')).toBe(true);
  });

  it('useHotkeys runs the first matching handler, prevents default, and can be disabled', () => {
    const onSearch = jest.fn();
    const onToggle = jest.fn();
    const Probe = ({ enabled = true }: { enabled?: boolean }) => {
      useHotkeys(
        [
          { shortcut: 'mod+k', handler: onSearch },
          { shortcut: 'mod+j', handler: onToggle, preventDefault: false },
        ],
        { enabled },
      );
      return null;
    };
    const { rerender } = render(<Probe />);
    const prevented = !fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(prevented).toBe(true);
    expect(onSearch).toHaveBeenCalledTimes(1);
    const notPrevented = fireEvent.keyDown(window, { key: 'j', ctrlKey: true });
    expect(notPrevented).toBe(true);
    expect(onToggle).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: 'x', metaKey: true });
    expect(onSearch).toHaveBeenCalledTimes(1);
    rerender(<Probe enabled={false} />);
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
