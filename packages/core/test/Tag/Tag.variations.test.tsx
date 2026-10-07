import '@testing-library/jest-dom';

import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { tagVariants } from 'factories/omni-ui-components/Tag/Tag.factories';

const SHA = '3f9a1c2d4e5b6a7f8091a2b3c4d5e6f708192a3b';

describe('omni-ui-components/Tag variations', () => {
  describe('mono', () => {
    it('uses the monospace face only when asked', () => {
      const { rerender } = render(<Tag>Plain</Tag>);
      expect(screen.getByText('Plain')).not.toHaveClass('font-mono');
      rerender(<Tag mono>Plain</Tag>);
      expect(screen.getByText('Plain')).toHaveClass('font-mono');
    });
  });

  describe('tooltip', () => {
    it('shows the tooltip on hover', async () => {
      const user = userEvent.setup();
      render(
        <Tag mono tooltip={SHA}>
          3f9a1c2 · main
        </Tag>,
      );
      await user.hover(screen.getByText('3f9a1c2 · main'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent(SHA);
    });

    it('does not leak the custom props into the DOM', () => {
      render(
        <Tag mono tooltip="tip" copyValue="x" onCopy={() => undefined}>
          Leak
        </Tag>,
      );
      const el = screen.getByRole('button', { name: /Leak/ });
      ['mono', 'tooltip', 'copyvalue', 'copyValue', 'oncopy'].forEach((a) =>
        expect(el).not.toHaveAttribute(a),
      );
    });
  });

  describe('copyValue', () => {
    let writeText: jest.Mock;
    /** userEvent.setup() installs its own clipboard stub, so the mock goes in after it. */
    const mockClipboard = () => {
      writeText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    };
    afterEach(() => {
      jest.useRealTimers();
      Reflect.deleteProperty(navigator, 'clipboard');
    });

    it('is a button; without copyValue it is plain', () => {
      mockClipboard();
      const { rerender } = render(<Tag>Plain</Tag>);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      rerender(<Tag copyValue={SHA}>Plain</Tag>);
      expect(screen.getByRole('button', { name: 'Plain' })).toHaveAttribute('type', 'button');
    });

    it('copies the value (not the label), calls onCopy with it and confirms', async () => {
      const user = userEvent.setup();
      mockClipboard();
      const onCopy = jest.fn();
      render(
        <Tag copyValue={SHA} onCopy={onCopy}>
          3f9a1c2 · main
        </Tag>,
      );
      const tag = screen.getByRole('button', { name: /3f9a1c2/ });
      expect(tag).not.toHaveAttribute('data-copied');
      await user.click(tag);
      expect(writeText).toHaveBeenCalledWith(SHA);
      expect(onCopy).toHaveBeenCalledWith(SHA);
      expect(tag).toHaveAttribute('data-copied', 'true');
      expect(screen.getByRole('status')).toHaveTextContent('Copied');
    });

    it('drops the confirmation after a moment', async () => {
      jest.useFakeTimers();
      mockClipboard();
      render(<Tag copyValue={SHA}>sha</Tag>);
      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(screen.getByRole('button')).toHaveAttribute('data-copied', 'true');
      act(() => {
        jest.advanceTimersByTime(1600);
      });
      expect(screen.getByRole('button')).not.toHaveAttribute('data-copied');
      expect(screen.getByRole('status')).toHaveTextContent('');
    });

    it('neither confirms nor calls onCopy when the clipboard refuses', async () => {
      const user = userEvent.setup();
      mockClipboard();
      writeText.mockRejectedValueOnce(new Error('denied'));
      const onCopy = jest.fn();
      render(
        <Tag copyValue={SHA} onCopy={onCopy}>
          sha
        </Tag>,
      );
      await user.click(screen.getByRole('button'));
      expect(onCopy).not.toHaveBeenCalled();
      expect(screen.getByRole('button')).not.toHaveAttribute('data-copied');
    });

    it('is a no-op (and does not throw) without a clipboard API', async () => {
      Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
      const onCopy = jest.fn();
      render(
        <Tag copyValue={SHA} onCopy={onCopy}>
          sha
        </Tag>,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole('button'));
      });
      expect(onCopy).not.toHaveBeenCalled();
    });

    it('combines with a tooltip on the same button', async () => {
      const user = userEvent.setup();
      mockClipboard();
      render(
        <Tag copyValue={SHA} tooltip="Click to copy the full SHA">
          sha
        </Tag>,
      );
      await user.hover(screen.getByRole('button', { name: /sha/ }));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Click to copy the full SHA');
    });
  });

  it('keeps closable behaviour when there is no copyValue', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <Tag closable onClose={onClose} mono>
        Filter
      </Tag>,
    );
    await user.click(screen.getByRole('button', { name: 'Remove tag' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders every factory variant', () => {
    tagVariants.forEach((variant) => {
      const { unmount } = render(<Tag {...variant.args} />);
      unmount();
    });
  });
});
