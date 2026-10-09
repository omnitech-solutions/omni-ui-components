import '@testing-library/jest-dom';

import { Empty } from '@oc-tech/omni-ui-components/Empty';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { emptyVariants } from 'factories/omni-ui-components/Empty/Empty.factories';
import { MonitorUp } from 'lucide-react';

describe('omni-ui-components/Empty tile', () => {
  it('keeps the dashed box as the default', () => {
    const { container } = render(<Empty description="No rows" />);
    expect(container.firstElementChild).toHaveClass('border-dashed');
    expect(container.querySelector('[data-slot="empty-tile"]')).toBeNull();
  });

  it('renders a 40px icon tile with the supplied icon, and a single line of copy', () => {
    const { container } = render(
      <Empty
        variant="tile"
        icon={<MonitorUp data-testid="ic" />}
        description="Starts automatically after the approach."
      />,
    );
    const tile = container.querySelector('[data-slot="empty-tile"]')!;
    expect(tile).toHaveClass('size-10');
    expect(tile).toHaveClass('rounded-[var(--oui-control-radius)]');
    expect(tile).toHaveClass('bg-[color:var(--oui-tone-accent-bg)]');
    expect(tile.className).not.toMatch(/(^|\s)border(\s|$)/);
    expect(tile).toHaveAttribute('aria-hidden', 'true');
    expect(tile).toContainElement(screen.getByTestId('ic'));
    expect(screen.getByText('Starts automatically after the approach.')).toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('data-variant', 'tile');
  });

  it('shows the optional title only when given', () => {
    const { rerender, container } = render(<Empty variant="tile" description="Copy" />);
    expect(container.querySelector('[data-slot="empty-title"]')).toBeNull();
    rerender(<Empty variant="tile" title="Nothing analysed yet" description="Copy" />);
    expect(screen.getByText('Nothing analysed yet')).toBeInTheDocument();
  });

  it('falls back to the image prop, then the inbox glyph, for the tile icon', () => {
    const { rerender, container } = render(
      <Empty variant="tile" image={<span data-testid="img" />} description="x" />,
    );
    expect(screen.getByTestId('img')).toBeInTheDocument();
    rerender(<Empty variant="tile" description="x" />);
    expect(container.querySelector('[data-slot="empty-tile"] svg')).not.toBeNull();
  });

  describe('action', () => {
    it('renders no button without an action', () => {
      render(<Empty variant="tile" description="x" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('renders the library Button (control size, accent tone by default) and calls onClick', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      render(
        <Empty variant="tile" description="x" action={{ label: 'Capture screen', onClick }} />,
      );
      const button = screen.getByRole('button', { name: 'Capture screen' });
      expect(button).toHaveAttribute('data-slot', 'button');
      expect(button).toHaveAttribute('data-button-size', 'control');
      expect(button).toHaveAttribute('data-tone', 'accent');
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('takes a tone, an icon and a shortcut', () => {
      render(
        <Empty
          variant="tile"
          description="x"
          action={{
            label: 'Retry',
            tone: 'warning',
            icon: <MonitorUp data-testid="aic" />,
            shortcut: ['⌘', '⇧', 'S'],
            onClick: () => undefined,
          }}
        />,
      );
      const button = screen.getByRole('button', { name: /Retry/ });
      expect(button).toHaveAttribute('data-tone', 'warning');
      expect(button).toHaveAttribute('aria-keyshortcuts', 'Meta+Shift+S');
      expect(screen.getByTestId('aic')).toBeInTheDocument();
    });
  });

  it('renders every factory variant', () => {
    emptyVariants.forEach((variant) => {
      const { unmount, container } = render(<Empty {...variant.args} />);
      expect(container.firstElementChild).toBeInTheDocument();
      unmount();
    });
  });
});

describe('omni-ui-components/Empty compact', () => {
  it('a compact tile is one row: a small icon beside the description, not a centred block', () => {
    const { container } = render(
      <Empty variant="tile" size="compact" description="No releases yet." />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'compact');
    expect(root.className).toContain('items-center');
    expect(root.className).not.toContain('flex-col');
    expect(root.className).not.toContain('flex-1');
    expect(root.querySelector('[data-slot="empty-tile"]')?.className).toContain('size-6');
    expect(screen.getByText('No releases yet.')).toBeInTheDocument();
  });

  it('the default tile is unchanged', () => {
    const { container } = render(<Empty variant="tile" description="No releases yet." />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'default');
    expect(root.className).toContain('flex-col');
    expect(root.querySelector('[data-slot="empty-tile"]')?.className).toContain('size-10');
  });

  it('a compact dashed box drops its tall minimum', () => {
    const { container } = render(<Empty size="compact" description="No matching records" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toContain('min-h-48');
    expect(root.className).toContain('py-4');
  });
});
