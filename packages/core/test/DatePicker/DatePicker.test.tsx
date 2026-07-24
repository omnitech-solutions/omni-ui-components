import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

beforeAll(() => {
  if (!('hasPointerCapture' in Element.prototype)) {
    Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
    Element.prototype.setPointerCapture = jest.fn();
    Element.prototype.releasePointerCapture = jest.fn();
  }
});

import { DatePicker, type DatePickerProps } from '@oc-tech/omni-ui-components/DatePicker';

const renderPicker = (overrides: Partial<DatePickerProps> = {}) => render(<DatePicker data-testid="dp" label="Due date" {...overrides} />);

describe('omni-ui-components/DatePicker', () => {
  it('renders the trigger + label', () => {
    renderPicker();
    expect(screen.getByTestId('dp')).toBeInTheDocument();
    expect(screen.getByText('Due date')).toBeInTheDocument();
  });

  it('shows placeholder when value is null', () => {
    renderPicker({ placeholder: 'Pick a date' });
    expect(screen.getByTestId('dp')).toHaveTextContent('Pick a date');
    expect(screen.getByTestId('dp')).toHaveAttribute('data-placeholder', 'true');
  });

  it('shows the formatted value when a Date is set', () => {
    renderPicker({ value: new Date(2026, 6, 15) });
    expect(screen.getByTestId('dp')).not.toHaveAttribute('data-placeholder');
    expect(screen.getByTestId('dp').textContent).toMatch(/2026/);
  });

  it('renders the range separator when a range is set', () => {
    renderPicker({ mode: 'range', value: { from: new Date(2026, 6, 1), to: new Date(2026, 6, 15) } });
    expect(screen.getByTestId('dp').textContent).toMatch(/–/);
  });

  it('flags aria-invalid when error is present', () => {
    renderPicker({ error: 'Pick a future date' });
    expect(screen.getByTestId('dp')).toHaveAttribute('aria-invalid', 'true');
  });

  it('disables the trigger when disabled', () => {
    renderPicker({ disabled: true });
    expect(screen.getByTestId('dp')).toBeDisabled();
  });
});
