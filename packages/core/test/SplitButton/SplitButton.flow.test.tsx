import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SplitButton } from '@oc-tech/omni-ui-components/SplitButton';
import {
  CaptureSplitButtonDemo,
  MicSplitButtonDemo,
  captureSplitButtonProps,
  splitButtonPropsFactory,
} from 'factories/omni-ui-components/SplitButton/SplitButton.factories';

const root = (container: HTMLElement) => container.querySelector('[data-slot="split-button"]') as HTMLElement;

describe('omni-ui-components/SplitButton interaction flow', () => {
  describe('choosing a menu row updates everything that shows the value', () => {
    it('Auto: the whole control tints blue, the tooltip names the mode, and the check moves', async () => {
      const onAction = vi.fn();
      const user = userEvent.setup();
      const { container } = render(<CaptureSplitButtonDemo onAction={onAction} />);
      expect(root(container)).toHaveAttribute('data-tone', 'neutral');

      await user.click(screen.getByRole('button', { name: 'More options' }));
      await user.click(screen.getByRole('menuitemradio', { name: /^Auto/ }));

      expect(root(container)).toHaveAttribute('data-tone', 'accent');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      // the callback fired exactly once for the one choice
      expect(onAction.mock.calls.filter(([name]) => name === 'capture:select')).toEqual([['capture:select', 'auto']]);

      await user.click(screen.getByRole('button', { name: 'More options' }));
      expect(screen.getByRole('menuitemradio', { name: /^Auto/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('menuitemradio', { name: /^Manual/ })).toHaveAttribute('aria-checked', 'false');
      await user.keyboard('{Escape}');

      await user.hover(screen.getByRole('button', { name: 'Capture' }));
      expect((await screen.findAllByText(/^Auto · re-analyses/))[0]).toBeInTheDocument();
    });

    it("choosing the display moves that section's check without touching the mode", async () => {
      const user = userEvent.setup();
      const { container } = render(<CaptureSplitButtonDemo />);
      await user.click(screen.getByRole('button', { name: 'More options' }));
      await user.click(screen.getByRole('menuitemradio', { name: /Built-in Retina Display$/ }));
      await user.click(screen.getByRole('button', { name: 'More options' }));
      expect(screen.getByRole('menuitemradio', { name: /^Built-in Retina Display$/ })).toHaveAttribute('aria-checked', 'true');
      expect(screen.getByRole('menuitemradio', { name: /^Manual/ })).toHaveAttribute('aria-checked', 'true');
      expect(root(container)).toHaveAttribute('data-tone', 'neutral');
    });

    it('pressing the main action starts and stops the analysis ring', async () => {
      const user = userEvent.setup();
      const { container } = render(<CaptureSplitButtonDemo />);
      await user.click(screen.getByRole('button', { name: 'Capture' }));
      expect(container.querySelector('[data-slot="progress-ring"]')).not.toBeNull();
      await user.click(screen.getByRole('button', { name: 'Capture' }));
      expect(container.querySelector('[data-slot="progress-ring"]')).toBeNull();
    });

    it('microphone: the device check moves, and "Retry now" recovers a lost mic', async () => {
      const user = userEvent.setup();
      const { container } = render(<MicSplitButtonDemo initial={{ status: 'lost' }} />);
      expect(root(container)).toHaveAttribute('data-tone', 'warning');
      await user.click(screen.getByRole('button', { name: 'More options' }));
      await user.click(screen.getByRole('menuitemradio', { name: 'AirPods Pro' }));
      await user.click(screen.getByRole('button', { name: 'More options' }));
      expect(screen.getByRole('menuitemradio', { name: 'AirPods Pro' })).toHaveAttribute('aria-checked', 'true');
      await user.click(screen.getByRole('menuitem', { name: 'Retry now' }));
      expect(root(container)).toHaveAttribute('data-tone', 'neutral');
      expect(container.querySelector('[data-slot="split-button-status"]')).toBeNull();
    });
  });

  describe('focus', () => {
    it('after a POINTER selection nothing stays focused (no ring on the caret)', async () => {
      const user = userEvent.setup();
      render(<CaptureSplitButtonDemo />);
      const caret = screen.getByRole('button', { name: 'More options' });
      await user.click(caret);
      await user.click(screen.getByRole('menuitemradio', { name: /^Auto/ }));
      expect(caret).not.toHaveFocus();
      expect(document.activeElement === document.body || !document.activeElement?.closest('[data-slot="split-button"]')).toBe(true);
    });

    it('after a KEYBOARD selection focus returns to the caret', async () => {
      const user = userEvent.setup();
      render(<CaptureSplitButtonDemo />);
      const caret = screen.getByRole('button', { name: 'More options' });
      caret.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}{Enter}');
      expect(caret).toHaveFocus();
    });

    it('Escape returns focus to the caret; an outside click leaves nothing focused', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <CaptureSplitButtonDemo />
          <p data-testid="outside">outside</p>
        </div>,
      );
      const caret = screen.getByRole('button', { name: 'More options' });
      caret.focus();
      await user.keyboard('{Enter}');
      await user.keyboard('{Escape}');
      expect(caret).toHaveFocus();

      await user.click(caret);
      await user.click(screen.getByTestId('outside'));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(caret).not.toHaveFocus();
    });

    it('the focus ring belongs to the whole control, never to one half', () => {
      const { container } = render(<SplitButton {...splitButtonPropsFactory()} />);
      expect(root(container).className).toContain('has-[:focus-visible]:ring-2');
      container.querySelectorAll('[data-slot="split-button-main"], [data-slot="split-button-caret"]').forEach((half) => {
        expect(half.className).not.toMatch(/focus-visible:ring/);
        expect(half).toHaveClass('outline-none');
      });
    });
  });

  describe('tones keep a visible outline and inherit their text colour', () => {
    it.each(['neutral', 'accent', 'warning', 'danger', 'dim'] as const)(
      '%s: the container draws the border; segments inherit the tone colour',
      (tone) => {
        const { container } = render(<SplitButton {...splitButtonPropsFactory({ tone })} />);
        expect(root(container)).toHaveClass('border');
        expect(root(container).className).toContain(`border-[color:var(--oui-tone-${tone}-border)]`);
        expect(screen.getByRole('button', { name: 'Capture' })).toHaveClass('text-inherit');
      },
    );

    it("the caret is divided by a 1px left border that takes the control's own border colour", () => {
      render(<SplitButton {...splitButtonPropsFactory()} />);
      expect(screen.getByRole('button', { name: 'More options' })).toHaveClass('border-l', 'border-inherit');
    });
  });

  describe('status badge sits on the icon, inside the main segment', () => {
    it('is inside the main button, anchored to the icon wrapper, and not inside the caret or a sibling of it', () => {
      const { container } = render(<SplitButton {...splitButtonPropsFactory(captureSplitButtonProps({ mode: 'manual', problem: true }))} />);
      const badge = container.querySelector('[data-slot="split-button-status"]') as HTMLElement;
      const main = screen.getByRole('button', { name: 'Capture' });
      const caret = screen.getByRole('button', { name: 'More options' });
      expect(main.contains(badge)).toBe(true);
      expect(caret.contains(badge)).toBe(false);
      expect(badge.parentElement).toHaveAttribute('data-slot', 'split-button-icon');
      expect(badge.parentElement).toHaveClass('relative');
      expect(badge.parentElement?.parentElement).toBe(main);
      expect(root(container).children).toHaveLength(2);
    });

    it('keeps its spoken description on the main button', () => {
      render(<SplitButton {...splitButtonPropsFactory(captureSplitButtonProps({ mode: 'manual', problem: true }))} />);
      expect(screen.getByRole('button', { name: 'Capture' })).toHaveAccessibleDescription('Screen recording permission lost');
      expect(within(screen.getByRole('button', { name: 'Capture' })).getByText('!')).toBeInTheDocument();
    });
  });
});
