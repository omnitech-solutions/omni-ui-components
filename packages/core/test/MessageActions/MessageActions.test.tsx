import '@testing-library/jest-dom';

import {
  type MessageActionButton,
  MessageActions,
} from '@oc-tech/omni-ui-components/MessageActions';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MessageActionsDemo,
  messageActionsPropsFactory,
  sampleActions,
} from 'factories/omni-ui-components/MessageActions/MessageActions.factories';
import { expectTypeOf } from 'vitest';

describe('omni-ui-components/MessageActions', () => {
  it('is a labelled toolbar of named icon buttons, a custom node and meta text', () => {
    render(<MessageActions {...messageActionsPropsFactory()} />);
    const bar = screen.getByRole('toolbar', { name: 'Message actions' });
    expect(within(bar).getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(within(bar).getByRole('group', { name: 'Versions' })).toHaveTextContent('2 / 2');
    expect(bar).toHaveTextContent('DeepSeek R1 · 1,284 tokens · local');
  });

  it('toggles carry aria-pressed only when pressed is set', () => {
    render(
      <MessageActions
        {...messageActionsPropsFactory({
          actions: sampleActions({ rating: 'up' }),
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Good reply' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Bad reply' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Copy' })).not.toHaveAttribute('aria-pressed');
  });

  it('calls each action callback and respects disabled', async () => {
    const onClick = vi.fn();
    render(
      <MessageActions
        actions={[
          { id: 'a', icon: <i />, label: 'A', onClick },
          { id: 'b', icon: <i />, label: 'B', onClick, disabled: true },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'A' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'B' })).toBeDisabled();
  });

  it('arrow keys, Home and End move focus between enabled buttons', async () => {
    render(
      <MessageActions
        {...messageActionsPropsFactory({
          actions: sampleActions({ busy: true }),
        })}
      />,
    );
    const copy = screen.getByRole('button', { name: 'Copy' });
    copy.focus();
    await userEvent.keyboard('{ArrowRight}');
    // Regenerate and the pager buttons are disabled while busy, so the next enabled one is Good reply.
    expect(screen.getByRole('button', { name: 'Good reply' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('button', { name: 'Read aloud' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(copy).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Read aloud' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(copy).toHaveFocus();
  });

  it('the demo toggles thumbs exclusively and read aloud', async () => {
    render(<MessageActionsDemo />);
    await userEvent.click(screen.getByRole('button', { name: 'Good reply' }));
    expect(screen.getByRole('button', { name: 'Good reply' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Bad reply' }));
    expect(screen.getByRole('button', { name: 'Good reply' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Bad reply' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Read aloud' }));
    expect(screen.getByRole('button', { name: 'Stop reading' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('an action without onClick is not rendered', () => {
    render(
      <MessageActions
        actions={[
          { id: 'a', icon: <i />, label: 'A' },
          { id: 'b', icon: <i />, label: 'B', onClick: () => undefined },
        ]}
      />,
    );
    expect(screen.queryByRole('button', { name: 'A' })).toBeNull();
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument();
  });

  it('each onClick receives its own extended action item by reference; its extra fields are typed', async () => {
    type Action = MessageActionButton & { analyticsId: string };
    const onClick = vi.fn((action: Action) => {
      expectTypeOf(action.analyticsId).toEqualTypeOf<string>();
    });
    const actions: Action[] = [
      { id: 'copy', icon: <i />, label: 'Copy', analyticsId: 'a-1', onClick },
      { id: 'redo', icon: <i />, label: 'Redo', analyticsId: 'a-2', onClick },
    ];
    render(<MessageActions<Action> actions={actions} />);
    await userEvent.click(screen.getByRole('button', { name: 'Redo' }));
    expect(onClick.mock.calls[0]![0]).toBe(actions[1]);
  });
});
