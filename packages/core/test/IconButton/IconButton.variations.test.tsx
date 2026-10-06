import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mic } from 'lucide-react';

import { IconButton, type IconButtonProps } from '@oc-tech/omni-ui-components/IconButton';
import {
  iconButtonPropsFactory,
  iconButtonSizeVariants,
  iconButtonStateVariants,
  iconButtonToneVariants,
} from 'factories/omni-ui-components/IconButton/IconButton.factories';

const TONES = ['neutral', 'accent', 'success', 'warning', 'danger', 'dim'] as const;

const renderIcon = (overrides: Partial<IconButtonProps> = {}) =>
  render(<IconButton aria-label="Microphone" icon={<Mic data-testid="icon" />} {...overrides} />);

describe('omni-ui-components/IconButton variations', () => {
  describe('tone', () => {
    TONES.forEach((tone) => {
      it(`tone=${tone} tints with the ${tone} tokens`, () => {
        renderIcon({ tone });
        const btn = screen.getByRole('button', { name: 'Microphone' });
        expect(btn).toHaveAttribute('data-tone', tone);
        expect(btn).toHaveClass(`bg-[color:var(--oui-tone-${tone}-bg)]`);
        expect(btn).toHaveClass(`text-[color:var(--oui-tone-${tone}-fg)]`);
        expect(btn).toHaveClass(`border-[color:var(--oui-tone-${tone}-border)]`);
      });
    });

    it('sits on the quiet secondary variant unless a variant is passed', () => {
      renderIcon({ tone: 'danger' });
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'secondary');
    });

    it('keeps the default look and no data-tone without a tone', () => {
      renderIcon();
      const btn = screen.getByRole('button');
      expect(btn).not.toHaveAttribute('data-tone');
      expect(btn).toHaveAttribute('data-variant', 'outline');
    });

    it('does not leak tone / badge / tooltip / pressed props as DOM attributes', () => {
      renderIcon({ tone: 'accent', badge: { tone: 'warning', label: '!' }, tooltip: 'Tip', pressed: true, disabledReason: undefined });
      const btn = screen.getByRole('button');
      ['tone', 'badge', 'tooltip', 'pressed', 'disabledreason', 'disabledReason'].forEach((a) => expect(btn).not.toHaveAttribute(a));
    });
  });

  describe('control sizes', () => {
    it('control is the 36px token square with the control radius and 20px icon', () => {
      renderIcon({ iconSize: 'control' });
      const btn = screen.getByRole('button');
      expect(btn).toHaveAttribute('data-icon-size', 'control');
      expect(btn).toHaveClass('h-[var(--oui-control-height)]');
      expect(btn).toHaveClass('w-[var(--oui-control-height)]');
      expect(btn).toHaveClass('rounded-[var(--oui-control-radius)]');
      expect(btn).toHaveClass('[&_svg]:size-[var(--oui-control-icon)]');
    });

    it('control-labelled is the 52px token square', () => {
      renderIcon({ iconSize: 'control-labelled' });
      expect(screen.getByRole('button')).toHaveClass('h-[var(--oui-control-height-labelled)]');
    });
  });

  describe('pressed', () => {
    it('sets aria-pressed true / false and nothing when unset', () => {
      const { rerender } = renderIcon({ pressed: true });
      expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument();
      rerender(<IconButton aria-label="Microphone" icon={<Mic />} pressed={false} />);
      expect(screen.getByRole('button', { pressed: false })).toBeInTheDocument();
      rerender(<IconButton aria-label="Microphone" icon={<Mic />} />);
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
    });
  });

  describe('badge', () => {
    it('renders the badge top-right inside the button with its label', () => {
      renderIcon({ badge: { tone: 'warning', label: '!' } });
      const badge = screen.getByRole('button').querySelector('[data-slot="icon-button-badge"]');
      expect(badge).toHaveTextContent('!');
      expect(badge).toHaveAttribute('data-tone', 'warning');
      expect(badge).toHaveAttribute('aria-hidden', 'true');
      expect(badge).toHaveClass('top-[var(--oui-badge-offset)]');
      expect(badge).toHaveClass('right-[var(--oui-badge-offset)]');
      expect(badge).toHaveClass('bg-[color:var(--oui-tone-warning-solid-bg)]');
      expect(screen.getByRole('button')).toHaveClass('relative');
    });

    it('renders a plain dot when there is no label', () => {
      renderIcon({ badge: { tone: 'danger' } });
      expect(screen.getByRole('button').querySelector('[data-slot="icon-button-badge"]')).toBeEmptyDOMElement();
    });

    it('describes the badge to assistive tech via aria-describedby', () => {
      renderIcon({ badge: { tone: 'warning', label: '!', description: 'Microphone lost' } });
      const btn = screen.getByRole('button', { name: 'Microphone' });
      expect(btn).toHaveAccessibleDescription('Microphone lost');
    });

    it('has no badge element and is not positioned without one', () => {
      renderIcon();
      expect(screen.getByRole('button').querySelector('[data-slot="icon-button-badge"]')).toBeNull();
      expect(screen.getByRole('button')).not.toHaveClass('relative');
    });
  });

  describe('tooltip', () => {
    it('shows the tooltip content on keyboard focus and drops the native title', async () => {
      const user = userEvent.setup();
      renderIcon({ tooltip: 'Listening' });
      const btn = screen.getByRole('button', { name: 'Microphone' });
      expect(btn).not.toHaveAttribute('title');
      await user.tab();
      expect(btn).toHaveFocus();
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Listening');
    });

    it('shows the tooltip on hover', async () => {
      const user = userEvent.setup();
      renderIcon({ tooltip: 'Listening' });
      await user.hover(screen.getByRole('button'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Listening');
    });

    it('keeps the native title fallback when there is no tooltip', () => {
      renderIcon();
      expect(screen.getByRole('button')).toHaveAttribute('title', 'Microphone');
    });
  });

  describe('disabledReason', () => {
    it('renders aria-disabled, not the native disabled attribute, and keeps it focusable', async () => {
      renderIcon({ disabledReason: 'Resume to capture' });
      const btn = screen.getByRole('button', { name: 'Microphone' });
      expect(btn).toHaveAttribute('aria-disabled', 'true');
      expect(btn).not.toBeDisabled();
      expect(btn).not.toHaveAttribute('disabled');
      await userEvent.setup().tab();
      expect(btn).toHaveFocus();
    });

    it('does not pass pointer-events-none so hover still reaches it', () => {
      renderIcon({ disabledReason: 'Resume to capture' });
      expect(screen.getByRole('button')).not.toHaveClass('pointer-events-none');
    });

    it('swallows the click', async () => {
      const onClick = jest.fn();
      renderIcon({ disabledReason: 'Resume to capture', onClick });
      await userEvent.setup().click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
    });

    it('shows the reason as the tooltip on hover (even when a tooltip is also given)', async () => {
      const user = userEvent.setup();
      renderIcon({ disabledReason: 'Resume to capture', tooltip: 'Capture' });
      await user.hover(screen.getByRole('button'));
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Resume to capture');
    });

    it('shows the reason on keyboard focus', async () => {
      const user = userEvent.setup();
      renderIcon({ disabledReason: 'Resume to capture' });
      await user.tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Resume to capture');
    });

    it('a plain disabled button still uses the native attribute and no aria-disabled', () => {
      renderIcon({ disabled: true });
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled');
    });

    it('still fires onClick when no reason is given', async () => {
      const onClick = jest.fn();
      renderIcon({ onClick });
      await userEvent.setup().click(screen.getByRole('button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('focus ring', () => {
    it('keeps the focus-visible ring on tone and control buttons', () => {
      renderIcon({ tone: 'warning', iconSize: 'control' });
      expect(screen.getByRole('button')).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('factories', () => {
    it('every tone has a matrix entry and the size matrix has both control sizes', () => {
      expect(iconButtonToneVariants.map((v) => v.args.tone)).toEqual([...TONES]);
      expect(iconButtonSizeVariants.map((v) => v.args.iconSize)).toEqual(expect.arrayContaining(['control', 'control-labelled']));
    });

    [...iconButtonToneVariants, ...iconButtonStateVariants].forEach((variant) => {
      it(`renders the "${variant.name}" matrix entry`, () => {
        const { container } = render(<IconButton {...iconButtonPropsFactory(variant.args)} />);
        expect(container.querySelector('[data-slot="icon-button"]')).not.toBeNull();
      });
    });
  });
});
