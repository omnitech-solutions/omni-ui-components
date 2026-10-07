import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Menu, type MenuItem } from '../../src/Menu/Menu';

const tree = (onLeaf = vi.fn(), onParent = vi.fn()): MenuItem[] => [
  { key: 'home', label: 'Home', icon: <svg data-testid="home-icon" />, onClick: onLeaf },
  {
    key: 'settings',
    label: 'Settings',
    onClick: onParent,
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'security', label: 'Security', children: [{ key: 'mfa', label: 'MFA' }] },
    ],
  },
];

describe('omni-ui-components/Menu behaviour', () => {
  it('shows top-level items only, collapsed branches have aria-expanded=false', () => {
    render(<Menu items={tree()} />);
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveAttribute('aria-expanded');
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });

  it('clicking a branch toggles its children and calls its onClick; leaves call onClick only', async () => {
    const user = userEvent.setup();
    const onLeaf = vi.fn();
    const onParent = vi.fn();
    render(<Menu items={tree(onLeaf, onParent)} />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(onParent).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(onLeaf).toHaveBeenCalledTimes(1);
  });

  it('expands nested branches independently and indents by depth', async () => {
    const user = userEvent.setup();
    render(<Menu items={tree()} />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    await user.click(screen.getByRole('button', { name: 'Security' }));
    expect(screen.getByText('MFA')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toHaveStyle({ paddingLeft: '12px' });
    expect(screen.getByRole('button', { name: 'Profile' })).toHaveStyle({ paddingLeft: '26px' });
    expect(screen.getByRole('button', { name: 'MFA' })).toHaveStyle({ paddingLeft: '40px' });
  });

  it('opens the ancestors of a selected key and highlights the selection', () => {
    render(<Menu items={tree()} selectedKeys={['profile']} />);
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Profile' })).toHaveClass('font-semibold');
    expect(screen.getByRole('button', { name: 'Home' })).not.toHaveClass('font-semibold');
  });

  it('opens a branch when it is selected itself, and when the selection changes later', () => {
    const { rerender } = render(<Menu items={tree()} />);
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'false');
    rerender(<Menu items={tree()} selectedKeys={['settings']} />);
    expect(screen.getByRole('button', { name: 'Settings' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders the icon instead of a chevron, and a chevron or spacer otherwise', async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu items={tree()} />);
    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
    // Collapsed branch shows the right chevron; leaf without icon shows the spacer.
    expect(screen.getByRole('button', { name: 'Settings' }).querySelector('svg.lucide-chevron-right')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('button', { name: 'Settings' }).querySelector('svg.lucide-chevron-down')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Profile' }).querySelector('span.w-4')).toBeInTheDocument();
    expect(container.querySelectorAll('ul').length).toBeGreaterThan(1);
  });

  it('merges className and passes list props through', () => {
    render(<Menu items={tree()} className="custom" aria-label="Main" />);
    expect(screen.getByRole('list', { name: 'Main' })).toHaveClass('custom');
  });
});
