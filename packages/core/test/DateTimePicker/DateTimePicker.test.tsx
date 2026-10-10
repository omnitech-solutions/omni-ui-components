import '@testing-library/jest-dom';

import {
  DateTimePicker,
  DateTimePickerPrimitive,
} from '@oc-tech/omni-ui-components/DateTimePicker';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/DateTimePicker', () => {
  it('names the date button by the label and its own date, and the time field by the label', () => {
    render(
      <DateTimePicker
        id="starts"
        label="Starts at"
        description="Local time"
        value="2026-10-09T09:30"
      />,
    );
    const date = document.querySelector('[data-slot="date-picker"]') as HTMLElement;
    expect(date).toHaveAccessibleName(/^Starts at .*2026/);
    expect(date).toHaveAccessibleDescription('Local time');
    const time = document.querySelector('[data-slot="time-picker"]') as HTMLElement;
    expect(time).toHaveAccessibleName('Starts at');
    expect(time).toHaveAccessibleDescription('Local time');
    expect(time).toHaveValue('09:30');
  });

  it('without a label the time field still has a name', () => {
    const { rerender } = render(<DateTimePickerPrimitive id="when" value="2026-10-09T09:30" />);
    expect(document.querySelector('[data-slot="time-picker"]')).toHaveAccessibleName('Time');
    rerender(<DateTimePickerPrimitive id="when" value="2026-10-09T09:30" timeLabel="Uhrzeit" />);
    expect(document.querySelector('[data-slot="time-picker"]')).toHaveAccessibleName('Uhrzeit');
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });
});
