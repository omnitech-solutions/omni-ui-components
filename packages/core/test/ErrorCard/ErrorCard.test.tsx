import '@testing-library/jest-dom';

import { ErrorCard, type ErrorItem } from '@oc-tech/omni-ui-components/ErrorCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorCardPropsFactory } from 'factories/omni-ui-components/ErrorCard/ErrorCard.factories';
import { expectTypeOf } from 'vitest';

describe('omni-ui-components/ErrorCard', () => {
  it('is an alert with title, message and the reassurance note', () => {
    render(<ErrorCard {...errorCardPropsFactory()} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('The model took too long');
    expect(alert).toHaveTextContent(
      'The request timed out after 30 seconds. Your message is saved and nothing has been applied.',
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Retry calls onRetry, is labelled by config and disables while busy', async () => {
    const onRetry = vi.fn();
    const { rerender } = render(<ErrorCard {...errorCardPropsFactory({ onRetry })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(
      <ErrorCard
        {...errorCardPropsFactory({
          onRetry,
          retryDisabled: true,
          retryLabel: 'Nochmal',
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Nochmal' })).toBeDisabled();
  });

  it('extra actions are drawn after Retry', () => {
    render(
      <ErrorCard
        {...errorCardPropsFactory({
          onRetry: () => undefined,
          actions: <button>Switch model</button>,
        })}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual(['Retry', 'Switch model']);
  });

  it('stopped variant is a quiet status line without Retry', () => {
    render(
      <ErrorCard
        {...errorCardPropsFactory({
          variant: 'stopped',
          title: 'Stopped. Nothing has been applied.',
          onRetry: () => undefined,
        })}
      />,
    );
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('Stopped. Nothing has been applied.');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Retry is not drawn without onRetry', () => {
    render(<ErrorCard {...errorCardPropsFactory()} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('onDismiss draws a dismiss control and fires on click; absent means no control, in both variants', async () => {
    const onDismiss = vi.fn();
    const { rerender } = render(<ErrorCard {...errorCardPropsFactory()} />);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull();
    rerender(<ErrorCard {...errorCardPropsFactory({ onDismiss })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    rerender(
      <ErrorCard
        {...errorCardPropsFactory({ variant: 'stopped', onDismiss, dismissLabel: 'Close' })}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onDismiss).toHaveBeenCalledTimes(2);
  });

  it('onRetry and onDismiss receive the extended error item by reference; its extra fields are typed; it supplies the text', async () => {
    type RunError = ErrorItem & { code: string };
    const error: RunError = {
      id: 'e1',
      title: 'The model took too long',
      message: 'Timed out.',
      code: 'model-timeout',
    };
    const onRetry = vi.fn((given: RunError) => {
      expectTypeOf(given.code).toEqualTypeOf<string>();
    });
    const onDismiss = vi.fn();
    render(<ErrorCard<RunError> error={error} onRetry={onRetry} onDismiss={onDismiss} />);
    expect(screen.getByRole('alert')).toHaveTextContent('The model took too long');
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onRetry.mock.calls[0]![0]).toBe(error);
    expect(onDismiss.mock.calls[0]![0]).toBe(error);
  });
});
