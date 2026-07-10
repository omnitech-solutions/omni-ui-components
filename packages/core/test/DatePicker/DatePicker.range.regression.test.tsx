import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DatePicker, type DateRange } from '@omnitech/omni-ui-core/DatePicker';

describe('DatePicker range-mode regressions', () => {
  it('exports DateRange and accepts it as value', () => {
    const range: DateRange = { from: new Date(2026, 5, 1), to: new Date(2026, 5, 5) };
    const onChange = jest.fn();
    render(<DatePicker id="dp" label="Range" mode="range" value={range} onChange={onChange} />);
    expect(screen.getByLabelText('Range')).toBeInTheDocument();
  });

  it('renders an X clear button that fires onChange(null) without opening the popover', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<DatePicker id="dp" label="Range" mode="range" value={{ from: new Date(2026, 5, 1), to: new Date(2026, 5, 5) }} onChange={onChange} />);
    const clear = screen.getByLabelText('Clear date');
    await user.click(clear);
    expect(onChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
