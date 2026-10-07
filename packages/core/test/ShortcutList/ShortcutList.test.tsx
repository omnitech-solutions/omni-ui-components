import '@testing-library/jest-dom';

import { ShortcutList } from '@oc-tech/omni-ui-components/ShortcutList';
import { render, screen, within } from '@testing-library/react';
import {
  shortcutListPropsFactory,
  shortcutListVariants,
} from 'factories/omni-ui-components/ShortcutList/ShortcutList.factories';

describe('omni-ui-components/ShortcutList', () => {
  it('lists each label with its keys, one kbd per key', () => {
    render(
      <ShortcutList
        {...shortcutListPropsFactory({
          describe: (s) => (s === 'mod+shift+o' ? ['⌘', '⇧', 'O'] : ['⌘', 'K']),
        })}
      />,
    );
    const newChat = screen.getByText('New chat');
    const keys = newChat.nextElementSibling as HTMLElement;
    expect(
      within(keys)
        .getAllByText(/./)
        .map((k) => k.textContent),
    ).toEqual(['⌘', '⇧', 'O']);
  });

  it('shows ready glyphs as given and describes shortcut strings with `describe`', () => {
    render(
      <ShortcutList
        items={[
          { label: 'Stop reply', keys: ['Esc'] },
          { label: 'Search', keys: 'mod+k' },
        ]}
        describe={(s) => s.toUpperCase().split('+')}
      />,
    );
    expect(screen.getByText('Stop reply').nextElementSibling).toHaveTextContent('Esc');
    expect(screen.getByText('Search').nextElementSibling).toHaveTextContent('MODK');
  });

  it('names the list by the heading or by labels.title', () => {
    const { rerender, container } = render(<ShortcutList items={[{ label: 'A', keys: ['x'] }]} />);
    expect(container.querySelector('dl')).toHaveAttribute('aria-label', 'Keyboard shortcuts');
    rerender(<ShortcutList items={[{ label: 'A', keys: ['x'] }]} title="Atajos" />);
    expect(screen.getByText('Atajos')).toBeInTheDocument();
    expect(container.querySelector('dl')).toHaveAttribute('aria-labelledby');
  });

  it('renders every factory variant', () => {
    shortcutListVariants.forEach((variant) => {
      const { unmount } = render(<ShortcutList {...shortcutListPropsFactory(variant.args)} />);
      expect(screen.getByText('Stop reply')).toBeInTheDocument();
      unmount();
    });
  });
});
