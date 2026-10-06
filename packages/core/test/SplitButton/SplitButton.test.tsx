import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SplitButton, type SplitButtonProps } from '@oc-tech/omni-ui-components/SplitButton';
import { IconButton } from '@oc-tech/omni-ui-components/IconButton';
import { Toolbar } from '@oc-tech/omni-ui-components/Toolbar';
import {
  splitButtonCaptureVariants,
  splitButtonMicVariants,
  splitButtonPropsFactory,
} from 'factories/omni-ui-components/SplitButton/SplitButton.factories';

const renderSplit = (overrides: Partial<SplitButtonProps> = {}) => render(<SplitButton {...splitButtonPropsFactory(overrides)} />);
const variant = (name: string) => [...splitButtonCaptureVariants, ...splitButtonMicVariants].find((v) => v.name === name)!.args;

describe('omni-ui-components/SplitButton', () => {
  describe('one control, one border', () => {
    it('renders the main action and a caret in one bordered container, the caret divided by a single 1px border', () => {
      const { container } = renderSplit();
      const root = container.querySelector('[data-slot="split-button"]') as HTMLElement;
      expect(root).toHaveClass('border');
      const main = within(root).getByRole('button', { name: 'Capture' });
      const caret = within(root).getByRole('button', { name: 'More options' });
      expect(main.className).not.toMatch(/(^|\s)border(\s|$)/);
      // The caret carries only the left divider, in the control's own border colour.
      expect(caret).toHaveClass('border-l', 'border-inherit');
      expect(caret.className).not.toMatch(/(^|\s)border(\s|$)/);
    });

    it('sizes the control from the control tokens: 36px, 52px labelled, 10px radius', () => {
      const { container, rerender } = renderSplit();
      const root = () => container.querySelector('[data-slot="split-button"]') as HTMLElement;
      expect(root()).toHaveClass('h-[var(--oui-control-height)]', 'rounded-[var(--oui-control-radius)]');
      rerender(<SplitButton {...splitButtonPropsFactory({ size: 'control-labelled' })} />);
      expect(root()).toHaveClass('h-[var(--oui-control-height-labelled)]');
      expect(
        screen.getByText('Capture', {
          selector: '[data-slot="split-button-caption"]',
        }),
      ).toBeInTheDocument();
    });

    it('takes its size from an enclosing Toolbar, and `size` wins over it', () => {
      const { container } = render(
        <Toolbar label="Bar" size="control-labelled">
          <SplitButton {...splitButtonPropsFactory()} />
          <SplitButton {...splitButtonPropsFactory({ size: 'control' })} />
        </Toolbar>,
      );
      const roots = container.querySelectorAll('[data-slot="split-button"]');
      expect(roots[0]).toHaveAttribute('data-size', 'control-labelled');
      expect(roots[1]).toHaveAttribute('data-size', 'control');
    });

    it('has no caption in the compact size', () => {
      renderSplit();
      expect(document.querySelector('[data-slot="split-button-caption"]')).toBeNull();
    });
  });

  describe('tones', () => {
    it.each(['neutral', 'accent', 'success', 'warning', 'danger', 'dim'] as const)('sets data-tone and the %s tint on the whole control', (tone) => {
      const { container } = renderSplit({ tone });
      const root = container.querySelector('[data-slot="split-button"]') as HTMLElement;
      expect(root).toHaveAttribute('data-tone', tone);
      expect(root.className).toContain(`--oui-tone-${tone}-border`);
    });

    it('defaults to neutral, and to accent while analysing', () => {
      const { container, rerender } = renderSplit();
      const root = () => container.querySelector('[data-slot="split-button"]') as HTMLElement;
      expect(root()).toHaveAttribute('data-tone', 'neutral');
      rerender(<SplitButton {...splitButtonPropsFactory(variant('Capture · analysing (ring)'))} />);
      expect(root()).toHaveAttribute('data-tone', 'accent');
    });
  });

  describe('states', () => {
    it('analysing: swaps the icon for the progress ring, sets aria-busy and keeps the press working', async () => {
      const onPress = vi.fn();
      const props = variant('Capture · analysing (ring)');
      render(
        <SplitButton
          {...splitButtonPropsFactory({
            ...props,
            main: { ...props.main!, onPress },
          })}
        />,
      );
      const main = screen.getByRole('button', { name: 'Capture' });
      expect(main).toHaveAttribute('aria-busy', 'true');
      expect(main.querySelector('[data-slot="progress-ring"]')).not.toBeNull();
      expect(main.querySelector('svg.lucide-monitor')).toBeNull();
      await userEvent.click(main);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('shows the warning badge at the top-right with a spoken description', () => {
      const { container } = renderSplit(variant('Capture · screen permission lost'));
      const badge = container.querySelector('[data-slot="split-button-status"]') as HTMLElement;
      expect(badge).toHaveAttribute('data-tone', 'warning');
      expect(badge).toHaveTextContent('!');
      expect(badge).toHaveClass('top-[var(--oui-badge-offset)]', 'right-0');
      expect(badge.parentElement).toBe(screen.getByRole('button', { name: 'Capture' }));
      expect(screen.getByRole('button', { name: 'Capture' })).toHaveAccessibleDescription('Screen recording permission lost');
    });

    it('uses the same size and top offset as the IconButton badge, so the two read as one family', () => {
      const split = renderSplit(variant('Capture · screen permission lost'));
      const splitBadge = split.container.querySelector('[data-slot="split-button-status"]') as HTMLElement;
      const icon = render(<IconButton icon={<span />} label="Mic" badge={{ tone: 'warning', label: '!', description: 'Microphone lost' }} />);
      const iconBadge = icon.container.querySelector('[data-slot="icon-button-badge"]') as HTMLElement;
      for (const cls of ['size-[var(--oui-badge-size)]', 'top-[var(--oui-badge-offset)]', 'rounded-full', 'text-[11px]']) {
        expect(splitBadge).toHaveClass(cls);
        expect(iconBadge).toHaveClass(cls);
      }
    });

    it('has no badge unless `status` is set', () => {
      renderSplit();
      expect(document.querySelector('[data-slot="split-button-status"]')).toBeNull();
    });

    it('reflects `pressed` as aria-pressed on the main action', () => {
      renderSplit({ main: { label: 'Panel', icon: <i />, pressed: true } });
      expect(screen.getByRole('button', { name: 'Panel' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('red slash mic: danger tone with the caller icon', () => {
      const { container } = renderSplit(variant('Mic · muted by you'));
      expect(container.querySelector('[data-slot="split-button"]')).toHaveAttribute('data-tone', 'danger');
      expect(screen.getByRole('button', { name: 'Unmute' })).toBeInTheDocument();
    });
  });

  describe('paused / disabled main with a usable caret', () => {
    it('swallows the main press, exposes aria-disabled and shows the reason as the tooltip', async () => {
      const onPress = vi.fn();
      const props = variant('Capture · paused');
      render(
        <SplitButton
          {...splitButtonPropsFactory({
            ...props,
            main: { ...props.main!, onPress },
          })}
        />,
      );
      const main = screen.getByRole('button', { name: 'Capture' });
      expect(main).toHaveAttribute('aria-disabled', 'true');
      expect(main).not.toBeDisabled();
      await userEvent.click(main);
      expect(onPress).not.toHaveBeenCalled();
      await userEvent.hover(main);
      expect((await screen.findAllByText('Resume to capture')).length).toBeGreaterThan(0);
    });

    it('keeps the caret enabled and opening the menu while the main part is disabled', async () => {
      renderSplit(variant('Capture · paused'));
      const caret = screen.getByRole('button', { name: 'More options' });
      expect(caret).not.toHaveAttribute('aria-disabled');
      expect(caret).toBeEnabled();
      await userEvent.click(caret);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('native `disabled` blocks the main press too', async () => {
      const onPress = vi.fn();
      renderSplit({
        main: { label: 'Capture', icon: <i />, disabled: true, onPress },
      });
      await userEvent.click(screen.getByRole('button', { name: 'Capture' }));
      expect(onPress).not.toHaveBeenCalled();
    });

    it('a caret `disabledReason` blocks the menu', async () => {
      renderSplit({ caret: { disabledReason: 'Nothing to choose yet' } });
      const caret = screen.getByRole('button', { name: 'More options' });
      expect(caret).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(caret);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  describe('callbacks and menu', () => {
    it('calls onPress with the click event', async () => {
      const onPress = vi.fn();
      renderSplit({ main: { label: 'Capture', icon: <i />, onPress } });
      await userEvent.click(screen.getByRole('button', { name: 'Capture' }));
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('the caret opens the ActionMenu; choosing a row calls menu.onSelect and closes', async () => {
      const onSelect = vi.fn();
      const props = splitButtonPropsFactory();
      render(<SplitButton {...props} menu={{ ...props.menu, onSelect }} />);
      await userEvent.click(screen.getByRole('button', { name: 'More options' }));
      expect(screen.getByRole('menu', { name: 'Capture options' })).toBeInTheDocument();
      await userEvent.click(screen.getByRole('menuitemradio', { name: /^Auto/ }));
      expect(onSelect).toHaveBeenCalledWith('auto', expect.objectContaining({ id: 'auto' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('reports open state through onOpenChange', async () => {
      const onOpenChange = vi.fn();
      renderSplit({ onOpenChange });
      await userEvent.click(screen.getByRole('button', { name: 'More options' }));
      expect(onOpenChange).toHaveBeenLastCalledWith(true);
      await userEvent.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('is controllable through `open`', () => {
      renderSplit({ open: true });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('opens on right-click and ArrowDown of the main part only when configured', async () => {
      const { unmount } = renderSplit();
      fireEvent.contextMenu(screen.getByRole('button', { name: 'Capture' }));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      unmount();

      renderSplit({ openMenuOn: ['contextmenu', 'arrowdown'] });
      fireEvent.contextMenu(screen.getByRole('button', { name: 'Capture' }));
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('opens on ArrowDown of the main part when configured', () => {
      renderSplit({ openMenuOn: ['arrowdown'] });
      fireEvent.keyDown(screen.getByRole('button', { name: 'Capture' }), {
        key: 'ArrowDown',
      });
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('leads the capture menu with the permission notice and its fix action', async () => {
      renderSplit(variant('Capture · screen permission lost'));
      await userEvent.click(screen.getByRole('button', { name: 'More options' }));
      expect(screen.getByText('Screen recording permission missing')).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Open System Settings' })).toBeInTheDocument();
    });
  });

  describe('tooltip', () => {
    it('shows the tooltip with the shortcut glyphs in mono text on hover', async () => {
      renderSplit();
      await userEvent.hover(screen.getByRole('button', { name: 'Capture' }));
      const tip = (await screen.findAllByText('⌘⇧S'))[0];
      expect(tip).toHaveClass('font-mono');
    });

    it('falls back to the native title when there is no tooltip', () => {
      renderSplit({ main: { label: 'Capture', icon: <i /> } });
      expect(screen.getByRole('button', { name: 'Capture' })).toHaveAttribute('title', 'Capture');
    });
  });
});
