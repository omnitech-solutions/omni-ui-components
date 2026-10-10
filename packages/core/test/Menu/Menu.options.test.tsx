import '@testing-library/jest-dom';

import { Menu, type MenuItem } from '@oc-tech/omni-ui-components/Menu';
import { fireEvent, render, screen } from '@testing-library/react';

interface RouteItem extends MenuItem {
  path?: string;
}

const items: RouteItem[] = [
  { key: 'home', label: 'Home', href: '/home', path: '/home', shortcut: ['G', 'H'] },
  { key: 'inbox', label: 'Inbox', indicator: { label: '3 unread', tone: 'warning' } },
  { key: 'reports', label: 'Reports', href: '/reports', disabledReason: 'No records yet' },
  { key: 'rule', label: '', type: 'divider' },
  {
    key: 'workspace',
    label: 'Workspace',
    type: 'group',
    children: [{ key: 'people', label: 'People', path: '/people' }],
  },
];

describe('omni-ui-components/Menu without the new props', () => {
  it('renders the same card list of buttons as before the options', () => {
    const { container } = render(
      <Menu
        items={[
          { key: 'a', label: 'Alpha' },
          { key: 'b', label: 'Beta' },
        ]}
      />,
    );
    const list = container.firstElementChild as HTMLElement;
    expect(list.tagName).toBe('UL');
    expect(list.className).toBe(
      'list-none space-y-1 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-2 shadow-xs',
    );
    const button = screen.getByRole('button', { name: 'Alpha' });
    expect(button.className).toBe(
      'flex w-full appearance-none items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left transition-colors font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground)] hover:bg-muted/40',
    );
    expect(button).toHaveStyle({ paddingLeft: '12px' });
    expect(button).not.toHaveAttribute('aria-current');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('still opens a branch and calls the item onClick', () => {
    const onClick = jest.fn();
    render(
      <Menu
        items={[{ key: 'a', label: 'Alpha', onClick, children: [{ key: 'a1', label: 'Child' }] }]}
      />,
    );
    const branch = screen.getByRole('button', { name: 'Alpha' });
    expect(branch).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(branch);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(branch).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Child' })).toBeInTheDocument();
  });
});

describe('omni-ui-components/Menu options', () => {
  it('names the navigation and marks the current item', () => {
    render(<Menu label="Main navigation" items={items} selectedKeys={['home']} />);
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Home/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: /Inbox/ })).not.toHaveAttribute('aria-current');
  });

  it('draws an anchor for an item with href and gives onSelect the full item', () => {
    const onSelect = jest.fn();
    render(<Menu<RouteItem> items={items} onSelect={onSelect} />);
    const link = screen.getByRole('link', { name: /Home/ });
    expect(link).toHaveAttribute('href', '/home');
    fireEvent.click(link);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBe(items[0]);
  });

  it('prevents the default of an anchor when onSelect returns false, and not otherwise', () => {
    const { rerender } = render(<Menu items={items} onSelect={() => false} />);
    const kept = new MouseEvent('click', { bubbles: true, cancelable: true });
    screen.getByRole('link', { name: /Home/ }).dispatchEvent(kept);
    expect(kept.defaultPrevented).toBe(true);

    rerender(<Menu items={items} onSelect={() => undefined} />);
    const followed = new MouseEvent('click', { bubbles: true, cancelable: true });
    followed.preventDefault = jest.fn();
    screen.getByRole('link', { name: /Home/ }).dispatchEvent(followed);
    expect(followed.preventDefault).not.toHaveBeenCalled();
  });

  it('draws shortcut keys and a named indicator', () => {
    render(<Menu items={items} />);
    const keys = screen.getByRole('link', { name: /Home/ }).querySelectorAll('kbd');
    expect(Array.from(keys, (key) => key.textContent)).toEqual(['G', 'H']);
    const dot = screen.getByRole('img', { name: '3 unread' });
    expect(dot).toHaveAttribute('data-tone', 'warning');
    expect(dot.className).toContain('--oui-tone-warning-fg');
  });

  it('disables an item with a reason: no href, described, and never selected', () => {
    const onSelect = jest.fn();
    render(<Menu items={items} onSelect={onSelect} />);
    const reports = screen.getByRole('link', { name: /Reports/ });
    expect(reports).not.toHaveAttribute('href');
    expect(reports).toHaveAttribute('aria-disabled', 'true');
    expect(reports).toHaveAttribute('tabindex', '0');
    expect(
      document.getElementById(reports.getAttribute('aria-describedby') ?? ''),
    ).toHaveTextContent('No records yet');
    fireEvent.click(reports);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('draws a group as a labelled flat list, and a divider that is not an item', () => {
    const { container } = render(<Menu items={items} />);
    expect(screen.getByRole('list', { name: 'Workspace' })).toContainElement(
      screen.getByRole('button', { name: 'People' }),
    );
    expect(screen.queryByRole('button', { name: 'Workspace' })).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="menu-divider"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('collapsed: icons only, the label stays the accessible name, shortcuts are not drawn', () => {
    const { container } = render(
      <Menu collapsed items={[{ ...items[0], icon: <svg aria-hidden="true" /> }, items[1]]} />,
    );
    expect(container.querySelector('ul')).toHaveAttribute('data-collapsed', 'true');
    const home = screen.getByRole('link', { name: /Home/ });
    expect(home.querySelector('kbd')).toBeNull();
    expect(screen.getByText('Home')).toHaveClass('sr-only');
    expect(screen.getByRole('button', { name: /Inbox/ })).toHaveTextContent('I');
  });

  it('plain drops the card and compact tightens the rows', () => {
    const { container } = render(<Menu appearance="plain" size="compact" items={items} />);
    expect(container.querySelector('ul')).toHaveClass('border-0', 'bg-transparent', 'p-0');
    expect(screen.getByRole('button', { name: /Inbox/ })).toHaveClass('py-1.5', 'text-[13px]');
  });

  it('is reachable and operable from the keyboard', () => {
    const onSelect = jest.fn();
    render(<Menu items={items} onSelect={onSelect} />);
    const inbox = screen.getByRole('button', { name: /Inbox/ });
    inbox.focus();
    expect(inbox).toHaveFocus();
    expect(inbox).toHaveAttribute('type', 'button');
    fireEvent.click(inbox);
    expect(onSelect.mock.calls[0][0]).toBe(items[1]);
  });
});
