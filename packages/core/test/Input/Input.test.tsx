import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input, type InputProps, type InputSize, type InputVariant } from '@oc-tech/omni-ui-components/Input';
import { runFieldChromeContract } from '../__support__/runFieldChromeContract';

const renderInput = (overrides: Partial<InputProps> = {}) => render(<Input data-testid="i" {...overrides} />);

runFieldChromeContract<InputProps>({
  name: 'Input',
  Component: Input,
  baseProps: { 'data-testid': 'i' } as unknown as InputProps,
  primitiveSelector: '[data-testid="i"]',
});

describe('omni-ui-components/Input', () => {
  describe('variants × sizes (data-driven)', () => {
    const variants: InputVariant[] = ['ghost', 'bordered'];
    const sizes: InputSize[] = ['sm', 'default', 'md', 'lg'];
    describe.each(variants)('variant=%s', (variant) => {
      it.each(sizes)('renders an <input> at size=%s', (size) => {
        renderInput({ variant, inputSize: size });
        expect(screen.getByTestId('i')).toBeInTheDocument();
      });
    });
  });

  describe('chrome edge cases', () => {
    it('omits a label element when no label is provided', () => {
      renderInput();
      expect(screen.queryByText(/email/i)).not.toBeInTheDocument();
    });

    it('does not mark aria-invalid when no error', () => {
      renderInput();
      expect(screen.getByTestId('i')).not.toHaveAttribute('aria-invalid');
    });

    it('omits * when not required', () => {
      renderInput({ label: 'Email' });
      expect(screen.queryByText('*')).not.toBeInTheDocument();
    });
  });

  describe('disabled flag (data-driven)', () => {
    it.each([true] as const)('disabled=%s → input is disabled', (disabled) => {
      renderInput({ disabled });
      expect(screen.getByTestId('i')).toBeDisabled();
    });
    it.each([false, undefined] as const)('disabled=%s → input is enabled', (disabled) => {
      renderInput({ disabled });
      expect(screen.getByTestId('i')).not.toBeDisabled();
    });
  });

  describe('readOnly flag (data-driven)', () => {
    it.each([true] as const)('readOnly=%s → input has readonly', (readOnly) => {
      renderInput({ readOnly });
      expect(screen.getByTestId('i')).toHaveAttribute('readonly');
    });
    it.each([false, undefined] as const)('readOnly=%s → no readonly attr', (readOnly) => {
      renderInput({ readOnly });
      expect(screen.getByTestId('i')).not.toHaveAttribute('readonly');
    });
  });

  describe('onChange — emits string value, not event', () => {
    it('fires per keystroke with the cumulative typed character', async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      renderInput({ onChange });
      await user.type(screen.getByTestId('i'), 'abc');
      expect(onChange).toHaveBeenNthCalledWith(1, 'a');
      expect(onChange).toHaveBeenNthCalledWith(2, 'b');
      expect(onChange).toHaveBeenNthCalledWith(3, 'c');
    });
  });

  describe('commitOnEnter — blurs on Enter/Escape (data-driven keys)', () => {
    it.each(['{Enter}', '{Escape}'])('blurs on %s', async (key) => {
      const onBlur = jest.fn();
      const user = userEvent.setup();
      renderInput({ commitOnEnter: true, onBlur });
      const input = screen.getByTestId('i');
      await user.click(input);
      expect(input).toHaveFocus();
      await user.keyboard(key);
      expect(input).not.toHaveFocus();
      expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('keeps focus on Enter when commitOnEnter is false', async () => {
      const onBlur = jest.fn();
      const user = userEvent.setup();
      renderInput({ commitOnEnter: false, onBlur });
      const input = screen.getByTestId('i');
      await user.click(input);
      await user.keyboard('{Enter}');
      expect(input).toHaveFocus();
    });

    it('does not call onBlur on Enter when commitOnEnter is false', async () => {
      const onBlur = jest.fn();
      const user = userEvent.setup();
      renderInput({ commitOnEnter: false, onBlur });
      await user.click(screen.getByTestId('i'));
      await user.keyboard('{Enter}');
      expect(onBlur).not.toHaveBeenCalled();
    });
  });

  describe('placeholder + maxLength + value', () => {
    it('forwards placeholder', () => {
      renderInput({ placeholder: 'hi' });
      expect(screen.getByTestId('i')).toHaveAttribute('placeholder', 'hi');
    });

    it('forwards maxLength', () => {
      renderInput({ maxLength: 5 });
      expect(screen.getByTestId('i')).toHaveAttribute('maxLength', '5');
    });

    it('treats undefined value as empty string (controlled)', () => {
      renderInput({ value: undefined });
      expect(screen.getByTestId('i')).toHaveValue('');
    });
  });

  describe('id + aria-describedby wiring', () => {
    it('references the error id in aria-describedby', () => {
      renderInput({ id: 'subject', label: 'Subject', error: 'required' });
      const describedBy = screen.getByTestId('i').getAttribute('aria-describedby') ?? '';
      expect(describedBy).toContain('subject-error');
    });

    it('auto-generates an id when none is provided', () => {
      renderInput();
      expect(screen.getByTestId('i').id).toMatch(/^oui-input-/);
    });
  });
});
