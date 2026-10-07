import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Breadcrumb } from '@oc-tech/omni-ui-components/Breadcrumb';

describe('omni-ui-components/Breadcrumb', () => {
  it('renders links, buttons and plain text by what each item provides, separated except after the last', async () => {
    const user = userEvent.setup();
    const onLink = vi.fn((e: React.MouseEvent) => e.preventDefault());
    const onButton = vi.fn();
    render(
      <Breadcrumb
        items={[
          { title: 'Home', href: '/', onClick: onLink },
          { title: 'Library', onClick: onButton },
          { title: 'Data' },
        ]}
        separator="/"
      />,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
    await user.click(link);
    expect(onLink).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Library' }));
    expect(onButton).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Data')).toHaveClass('text-foreground');
    expect(screen.getAllByText('/')).toHaveLength(2);
  });

  it('marks a last link or button as non-interactive', () => {
    const { rerender } = render(<Breadcrumb items={[{ title: 'Home' }, { title: 'Here', href: '/here' }]} />);
    expect(screen.getByRole('link', { name: 'Here' })).toHaveClass('pointer-events-none');
    rerender(<Breadcrumb items={[{ title: 'Home' }, { title: 'Here', onClick: () => undefined }]} />);
    expect(screen.getByRole('button', { name: 'Here' })).toHaveClass('pointer-events-none');
  });

  it('uses item keys, defaults to a chevron separator and an empty list', () => {
    const { container, rerender } = render(<Breadcrumb items={[{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }]} />);
    expect(container.querySelector('svg.lucide-chevron-right')).toBeInTheDocument();
    rerender(<Breadcrumb />);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('renders custom children instead of the list', () => {
    render(
      <Breadcrumb className="extra">
        <span>custom crumbs</span>
      </Breadcrumb>,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveClass('extra');
    expect(screen.getByText('custom crumbs')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
