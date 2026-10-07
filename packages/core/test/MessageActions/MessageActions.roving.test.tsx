import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { MessageActions } from '@oc-tech/omni-ui-components/MessageActions';
import { messageActionsPropsFactory, sampleActions } from 'factories/omni-ui-components/MessageActions/MessageActions.factories';

const stops = () => screen.getAllByRole('button').filter((b) => b.getAttribute('tabindex') === '0');

describe('omni-ui-components/MessageActions roving tabindex', () => {
  it('exposes exactly one tab stop, the first enabled button', () => {
    render(<MessageActions {...messageActionsPropsFactory()} />);
    expect(stops()).toEqual([screen.getByRole('button', { name: 'Copy' })]);
    for (const button of screen.getAllByRole('button').filter((b) => !(b as HTMLButtonElement).disabled)) if (button !== stops()[0]) expect(button).toHaveAttribute('tabindex', '-1');
  });

  it('moves the tab stop with arrows, Home and End', async () => {
    render(<MessageActions {...messageActionsPropsFactory({ actions: sampleActions({ busy: true }) })} />);
    const copy = screen.getByRole('button', { name: 'Copy' });
    await userEvent.tab();
    expect(copy).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    const good = screen.getByRole('button', { name: 'Good reply' });
    expect(good).toHaveFocus();
    expect(stops()).toEqual([good]);
    await userEvent.keyboard('{End}');
    expect(stops()).toEqual([screen.getByRole('button', { name: 'Read aloud' })]);
    await userEvent.keyboard('{Home}');
    expect(stops()).toEqual([copy]);
  });

  it('Tab leaves the toolbar and Shift+Tab returns to the last-focused button', async () => {
    render(
      <>
        <button type="button">before</button>
        <MessageActions {...messageActionsPropsFactory({ actions: sampleActions({ busy: true }) })} />
        <button type="button">after</button>
      </>,
    );
    await userEvent.tab();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'after' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Good reply' })).toHaveFocus();
  });

  it('hands the tab stop on when the current button becomes disabled', () => {
    const actions = (disabled: boolean) => [
      { id: 'a', icon: <i />, label: 'A', onClick: () => undefined, disabled },
      { id: 'b', icon: <i />, label: 'B', onClick: () => undefined },
    ];
    const { rerender } = render(<MessageActions actions={actions(false)} />);
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute('tabindex', '0');
    rerender(<MessageActions actions={actions(true)} />);
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute('tabindex', '0');
  });

  it('keeps a caller onKeyDown and lets it prevent the move', async () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight') event.preventDefault();
    });
    render(<MessageActions {...messageActionsPropsFactory({ onKeyDown })} />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(onKeyDown).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Copy' })).toHaveFocus();
  });
});
