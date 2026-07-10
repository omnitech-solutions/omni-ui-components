import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button, type ButtonProps } from '@omnitech/omni-ui-core/Button';

const renderButton = (overrides: Partial<ButtonProps> = {}) => render(<Button {...overrides}>Save</Button>);

describe('omni-ui-components/Button', () => {
  describe('shape', () => {
    it('renders a <button> with the children inside', () => {
      renderButton();
      const btn = screen.getByRole('button', { name: 'Save' });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute('data-slot', 'button');
    });

    it('defaults to type=button', () => {
      renderButton();
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('respects an explicit type="submit"', () => {
      renderButton({ type: 'submit' });
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('renders leading + trailing icons', () => {
      render(
        <Button icon={<span data-testid="lead">L</span>} iconAfter={<span data-testid="trail">T</span>}>
          Go
        </Button>,
      );
      expect(screen.getByTestId('lead')).toBeInTheDocument();
      expect(screen.getByTestId('trail')).toBeInTheDocument();
    });
  });

  describe('variants + sizes', () => {
    (['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).forEach((variant) => {
      it(`renders variant=${variant}`, () => {
        renderButton({ variant });
        expect(screen.getByRole('button')).toHaveAttribute('data-variant', variant);
      });
    });

    (['sm', 'default', 'md', 'lg', 'icon'] as const).forEach((buttonSize) => {
      it(`renders buttonSize=${buttonSize}`, () => {
        renderButton({ buttonSize });
        expect(screen.getByRole('button')).toHaveAttribute('data-button-size', buttonSize);
      });
    });

    it('renders outline with the field surface treatment', () => {
      renderButton({ variant: 'outline' });
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-[var(--oui-border-field)]');
      expect(button).toHaveClass('bg-[var(--oui-surface-field)]');
      expect(button).toHaveClass('shadow-xs');
    });
  });

  describe('interaction', () => {
    it('fires onClick when clicked', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderButton({ onClick: handle });
      await user.click(screen.getByRole('button'));
      expect(handle).toHaveBeenCalledTimes(1);
    });

    it('does not fire onClick when disabled', async () => {
      const handle = jest.fn();
      const user = userEvent.setup();
      renderButton({ onClick: handle, disabled: true });
      await user.click(screen.getByRole('button'));
      expect(handle).not.toHaveBeenCalled();
    });
  });
});
