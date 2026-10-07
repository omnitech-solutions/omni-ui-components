import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Rate } from '@oc-tech/omni-ui-components/Rate';

const filled = () => document.querySelectorAll('svg.fill-amber-400').length;

describe('omni-ui-components/Rate', () => {
  it('renders five stars by default, or the requested count', () => {
    const { rerender } = render(<Rate />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
    rerender(<Rate count={3} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('uncontrolled: starts from defaultValue, fills up to the clicked star and reports it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rate defaultValue={2} onChange={onChange} />);
    expect(filled()).toBe(2);
    await user.click(screen.getAllByRole('button')[3]);
    expect(onChange).toHaveBeenCalledWith(4);
    expect(filled()).toBe(4);
  });

  it('controlled: shows the value and only reports the request', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rate value={1} onChange={onChange} />);
    await user.click(screen.getAllByRole('button')[4]);
    expect(onChange).toHaveBeenCalledWith(5);
    expect(filled()).toBe(1);
  });

  it('disabled: stars are disabled and nothing changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rate disabled onChange={onChange} />);
    for (const star of screen.getAllByRole('button')) expect(star).toBeDisabled();
    await user.click(screen.getAllByRole('button')[2]);
    expect(onChange).not.toHaveBeenCalled();
    expect(filled()).toBe(0);
  });

  it('works without an onChange handler', async () => {
    const user = userEvent.setup();
    render(<Rate />);
    await user.click(screen.getAllByRole('button')[1]);
    expect(filled()).toBe(2);
  });
});
