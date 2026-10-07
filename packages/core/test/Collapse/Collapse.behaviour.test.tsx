import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Collapse, type CollapseItem } from '../../src/Collapse/Collapse';

const items: CollapseItem[] = [
  { key: 'a', label: 'Alpha', children: 'Alpha body', extra: <span>extra-a</span> },
  { key: 'b', label: 'Beta', children: 'Beta body' },
  { key: 'c', label: 'Gamma', children: 'Gamma body', disabled: true },
];

describe('omni-ui-components/Collapse behaviour', () => {
  it('starts with panels closed and opens several independently, reporting every open key', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Collapse items={items} onChange={onChange} />);
    expect(screen.queryByText('Alpha body')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Alpha/ }));
    await user.click(screen.getByRole('button', { name: /Beta/ }));
    expect(onChange).toHaveBeenNthCalledWith(1, ['a']);
    expect(onChange).toHaveBeenNthCalledWith(2, ['a', 'b']);
    expect(screen.getByText('Alpha body')).toBeInTheDocument();
    expect(screen.getByText('Beta body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Alpha/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes an open panel when clicked again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Collapse items={items} defaultActiveKey="a" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Alpha/ }));
    expect(onChange).toHaveBeenCalledWith([]);
    expect(screen.queryByText('Alpha body')).not.toBeInTheDocument();
  });

  it('accordion mode keeps a single panel open', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Collapse items={items} accordion defaultActiveKey={['a']} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Beta/ }));
    expect(onChange).toHaveBeenLastCalledWith(['b']);
    expect(screen.queryByText('Alpha body')).not.toBeInTheDocument();
    expect(screen.getByText('Beta body')).toBeInTheDocument();
  });

  it('accepts a defaultActiveKey array', () => {
    render(<Collapse items={items} defaultActiveKey={['a', 'b']} />);
    expect(screen.getByText('Alpha body')).toBeInTheDocument();
    expect(screen.getByText('Beta body')).toBeInTheDocument();
  });

  it('controlled: follows activeKey (single key or array) and only reports the request', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Collapse items={items} activeKey="a" onChange={onChange} />);
    expect(screen.getByText('Alpha body')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Beta/ }));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
    expect(screen.queryByText('Beta body')).not.toBeInTheDocument();

    rerender(<Collapse items={items} activeKey={['b']} onChange={onChange} />);
    expect(screen.getByText('Beta body')).toBeInTheDocument();
    expect(screen.queryByText('Alpha body')).not.toBeInTheDocument();
  });

  it('a disabled panel cannot be opened', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Collapse items={items} onChange={onChange} />);
    const gamma = screen.getByRole('button', { name: /Gamma/ });
    expect(gamma).toBeDisabled();
    await user.click(gamma);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders extra content in the header and exposes data-state', async () => {
    const user = userEvent.setup();
    const { container } = render(<Collapse items={items} className="custom" />);
    expect(screen.getByText('extra-a')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('custom');
    expect(container.querySelector('[data-state="closed"]')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Alpha/ }));
    expect(container.querySelector('[data-state="open"]')).toBeInTheDocument();
  });

  it('works without an onChange handler', async () => {
    const user = userEvent.setup();
    render(<Collapse items={items} />);
    await user.click(screen.getByRole('button', { name: /Alpha/ }));
    expect(screen.getByText('Alpha body')).toBeInTheDocument();
  });
});
