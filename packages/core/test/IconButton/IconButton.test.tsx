import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Trash2 } from 'lucide-react';

import { IconButton, type IconButtonProps } from '@omnitech/omni-ui-core/IconButton';

const renderIconButton = (overrides: Partial<IconButtonProps> = {}) =>
  render(<IconButton aria-label="Remove" icon={<Trash2 data-testid="icon" />} {...overrides} />);

describe('omni-ui-components/IconButton', () => {
  describe('render shape', () => {
    it('renders a <button> with the icon node inside', () => {
      renderIconButton();
      const btn = screen.getByRole('button', { name: 'Remove' });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('data-slot', 'icon-button');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('defaults to type="button" so it does not submit forms', () => {
      renderIconButton();
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('type', 'button');
    });

    it('accepts `label` as an alias for aria-label', () => {
      render(<IconButton label="Copy" icon={<Trash2 />} />);
      expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    });

    it('sets title to aria-label when title is not supplied', () => {
      renderIconButton();
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('title', 'Remove');
    });

    it('honors an explicit title prop', () => {
      renderIconButton({ title: 'Delete forever' });
      expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('title', 'Delete forever');
    });
  });

  describe('variants + sizes', () => {
    (['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).forEach((variant) => {
      it(`renders variant=${variant}`, () => {
        renderIconButton({ variant });
        expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('data-variant', variant);
      });
    });

    (['sm', 'default', 'md', 'lg'] as const).forEach((iconSize) => {
      it(`renders iconSize=${iconSize}`, () => {
        renderIconButton({ iconSize });
        expect(screen.getByRole('button', { name: 'Remove' })).toHaveAttribute('data-icon-size', iconSize);
      });
    });
  });

  describe('interaction', () => {
    it('fires onClick when clicked', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderIconButton({ onClick: handle });
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      expect(handle).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when disabled', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderIconButton({ onClick: handle, disabled: true });
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      expect(handle).not.toHaveBeenCalled();
    });
  });
});
