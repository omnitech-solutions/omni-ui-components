import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NumberInput, type NumberInputProps } from '@oc-tech/omni-ui-components/NumberInput';

const renderNI = (overrides: Partial<NumberInputProps> = {}) => render(<NumberInput data-testid="n" label="Amount" {...overrides} />);

describe('omni-ui-components/NumberInput', () => {
  it('renders an input with the label', () => {
    renderNI();
    expect(screen.getByTestId('n')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('formats with thousand separators when prop is set', () => {
    renderNI({ value: 12345, thousandSeparator: true, locale: 'en-US' });
    expect(screen.getByTestId('n')).toHaveValue('12,345');
  });

  it('renders prefix + suffix', () => {
    renderNI({ value: 10, prefix: '$', suffix: '/mo' });
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('/mo')).toBeInTheDocument();
  });

  it('emits parsed number on change', async () => {
    const handle = jest.fn();
    const user = userEvent.setup();
    renderNI({ onChange: handle });
    const input = screen.getByTestId('n');
    await user.type(input, '42');
    expect(handle).toHaveBeenLastCalledWith(42);
  });

  it('clamps to max', async () => {
    const handle = jest.fn();
    const user = userEvent.setup();
    renderNI({ onChange: handle, max: 50 });
    await user.type(screen.getByTestId('n'), '99');
    expect(handle).toHaveBeenLastCalledWith(50);
  });
});
