import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Textarea, type TextareaProps, type TextareaSize, type TextareaVariant } from '@oc-tech/omni-ui-components/Textarea';
import { runFieldChromeContract } from '../__support__/runFieldChromeContract';

const renderTextarea = (overrides: Partial<TextareaProps> = {}) => render(<Textarea data-testid="t" {...overrides} />);

runFieldChromeContract<TextareaProps>({
  name: 'Textarea',
  Component: Textarea,
  baseProps: { 'data-testid': 't' } as unknown as TextareaProps,
  primitiveSelector: '[data-testid="t"]',
});

describe('omni-ui-components/Textarea', () => {
  describe('variants × sizes (data-driven)', () => {
    const variants: TextareaVariant[] = ['ghost', 'bordered'];
    const sizes: TextareaSize[] = ['sm', 'default', 'md', 'lg'];
    describe.each(variants)('variant=%s', (variant) => {
      it.each(sizes)('renders a <textarea> at size=%s', (size) => {
        renderTextarea({ variant, textareaSize: size });
        const el = screen.getByTestId('t');
        expect(el).toBeInTheDocument();
        expect(el.tagName).toBe('TEXTAREA');
      });
    });
  });

  describe('a11y attributes', () => {
    it('sets aria-required when required', () => {
      renderTextarea({ required: true });
      expect(screen.getByTestId('t')).toHaveAttribute('aria-required', 'true');
    });

    it('binds the label to the textarea via htmlFor / id', () => {
      renderTextarea({ id: 'msg', label: 'Message' });
      expect(screen.getByLabelText('Message')).toHaveAttribute('id', 'msg');
    });
  });

  describe('controlled change', () => {
    it('calls onChange with the new string value as user types', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      renderTextarea({ value: '', onChange: handleChange });
      await user.type(screen.getByTestId('t'), 'hi');
      expect(handleChange).toHaveBeenLastCalledWith('i');
      expect(handleChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('rows prop', () => {
    it('renders 5 rows by default', () => {
      renderTextarea();
      expect(screen.getByTestId('t')).toHaveAttribute('rows', '5');
    });

    it('respects an explicit rows prop', () => {
      renderTextarea({ rows: 8 });
      expect(screen.getByTestId('t')).toHaveAttribute('rows', '8');
    });
  });
});
