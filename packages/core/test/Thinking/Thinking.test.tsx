import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { Thinking } from '@oc-tech/omni-ui-components/Thinking';
import { SAMPLE_REASONING, thinkingPropsFactory } from 'factories/omni-ui-components/Thinking/Thinking.factories';

describe('omni-ui-components/Thinking', () => {
  it('streaming: spinner and Thinking…, collapsed', () => {
    render(<Thinking {...thinkingPropsFactory({ streaming: true })} />);
    const toggle = screen.getByRole('button', { name: 'Thinking…' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.querySelector('[data-slot="thinking-spinner"]')).not.toBeNull();
    expect(screen.queryByText(SAMPLE_REASONING)).toBeNull();
  });

  it('done: Thought for Ns (at least 1, rounded) or Thought without a duration', () => {
    const { rerender } = render(<Thinking {...thinkingPropsFactory({ seconds: 3.6 })} />);
    expect(screen.getByRole('button', { name: 'Thought for 4s' })).toBeInTheDocument();
    rerender(<Thinking {...thinkingPropsFactory({ seconds: 0.2 })} />);
    expect(screen.getByRole('button', { name: 'Thought for 1s' })).toBeInTheDocument();
    rerender(<Thinking {...thinkingPropsFactory({ seconds: undefined })} />);
    expect(screen.getByRole('button', { name: 'Thought' })).toBeInTheDocument();
    expect(document.querySelector('[data-slot="thinking-spinner"]')).toBeNull();
  });

  it('toggles the text with aria-expanded and reports onOpenChange', async () => {
    const onOpenChange = vi.fn();
    render(<Thinking {...thinkingPropsFactory({ onOpenChange })} />);
    const toggle = screen.getByRole('button', { name: 'Thought for 4s' });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(SAMPLE_REASONING)).toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.queryByText(SAMPLE_REASONING)).toBeNull();
    expect(onOpenChange.mock.calls.map((call) => call[0])).toEqual([true, false]);
  });

  it('is controlled by open, and labels are configurable', () => {
    render(
      <Thinking
        {...thinkingPropsFactory({
          open: true,
          labels: { thoughtFor: 'Gedacht {n}s' },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Gedacht 4s' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('onOpenChange fires in controlled mode with the requested state', async () => {
    const onOpenChange = vi.fn();
    render(<Thinking {...thinkingPropsFactory({ open: false, onOpenChange })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Thought for 4s' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Thought for 4s' })).toHaveAttribute('aria-expanded', 'false');
  });
});
