import '@testing-library/jest-dom';

import { Toast, useToast } from '@oc-tech/omni-ui-components/Toast';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ToastDemo,
  toastPropsFactory,
  toastVariants,
} from 'factories/omni-ui-components/Toast/Toast.factories';

describe('omni-ui-components/Toast', () => {
  afterEach(() => jest.useRealTimers());

  it('is an output with the status role and shows its text; nothing when closed', () => {
    const { rerender } = render(<Toast {...toastPropsFactory()} />);
    const status = screen.getByRole('status');
    expect(status.tagName).toBe('OUTPUT');
    expect(status).toHaveTextContent('Conversation archived');
    rerender(<Toast {...toastPropsFactory({ open: false })} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('the action runs, then asks to close', async () => {
    const onAction = jest.fn();
    const onOpenChange = jest.fn();
    const toast = { text: 'Conversation archived', actionLabel: 'Undo' };
    render(<Toast {...toastPropsFactory({ toast, onAction, onOpenChange })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0]).toBe(toast);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('has no button without an action', () => {
    render(<Toast {...toastPropsFactory({ toast: { text: 'Plain' } })} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('onTimeout fires with the toast item when it closes itself; onDismiss fires on Escape, not on timeout', () => {
    jest.useFakeTimers();
    const toast = { text: 'Hi' };
    const onTimeout = jest.fn();
    const onDismiss = jest.fn();
    const { rerender } = render(
      <Toast {...toastPropsFactory({ toast, duration: 500, onTimeout, onDismiss })} />,
    );
    act(() => jest.advanceTimersByTime(500));
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onTimeout.mock.calls[0][0]).toBe(toast);
    expect(onDismiss).not.toHaveBeenCalled();
    rerender(
      <Toast {...toastPropsFactory({ toast, duration: 0, onTimeout, onDismiss, open: true })} />,
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss.mock.calls[0][0]).toBe(toast);
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('the action button is not rendered without onAction', () => {
    render(<Toast {...toastPropsFactory({ onAction: undefined })} />);
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
  });

  it('dismisses itself after the default 3800 ms', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    render(<Toast {...toastPropsFactory({ duration: undefined, onOpenChange })} />);
    act(() => jest.advanceTimersByTime(3799));
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('honours a custom duration, and 0 keeps it until dismissed', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    const { rerender } = render(<Toast {...toastPropsFactory({ duration: 1000, onOpenChange })} />);
    act(() => jest.advanceTimersByTime(1000));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    rerender(<Toast {...toastPropsFactory({ duration: 0, onOpenChange })} />);
    act(() => jest.advanceTimersByTime(60_000));
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it('pauses while hovered and resumes after', () => {
    jest.useFakeTimers();
    const onOpenChange = jest.fn();
    render(<Toast {...toastPropsFactory({ duration: 1000, onOpenChange })} />);
    const status = screen.getByRole('status');
    fireEvent.mouseEnter(status);
    act(() => jest.advanceTimersByTime(5000));
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.mouseLeave(status);
    act(() => jest.advanceTimersByTime(1000));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Escape asks to close', () => {
    const onOpenChange = jest.fn();
    render(<Toast {...toastPropsFactory({ onOpenChange })} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies placement and position classes', () => {
    const { rerender } = render(
      <Toast {...toastPropsFactory({ placement: 'top-right', position: 'fixed' })} />,
    );
    expect(screen.getByRole('status')).toHaveClass('fixed', 'top-4', 'right-4');
    rerender(<Toast {...toastPropsFactory({ placement: 'bottom-left', position: 'absolute' })} />);
    expect(screen.getByRole('status')).toHaveClass('absolute', 'bottom-4', 'left-4');
  });

  it('useToast shows, replaces and dismisses', async () => {
    const onUndo = jest.fn();
    render(<ToastDemo duration={0} onAction={onUndo} />);
    await userEvent.click(screen.getByRole('button', { name: /Archive/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Conversation archived');
    await userEvent.click(screen.getByRole('button', { name: /Copy/ }));
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
    expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Archive/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onUndo).toHaveBeenCalledWith('undo');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('useToast.dismiss closes it', () => {
    const Probe = () => {
      const toast = useToast();
      return (
        <>
          <button onClick={() => toast.notify({ text: 'Hi' })}>show</button>
          <button onClick={toast.dismiss}>hide</button>
          <Toast {...toast.props} duration={0} />
        </>
      );
    };
    render(<Probe />);
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByRole('status')).toBeInTheDocument();
    fireEvent.click(screen.getByText('hide'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders every factory variant', () => {
    toastVariants.forEach((variant) => {
      const { unmount } = render(<Toast {...toastPropsFactory(variant.args)} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      unmount();
    });
  });
});
