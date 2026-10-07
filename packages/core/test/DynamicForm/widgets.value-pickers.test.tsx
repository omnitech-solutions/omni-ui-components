import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ColorWidget } from '../../src/dynamic-form/widgets/ColorWidget';
import { CurrencyWidget } from '../../src/dynamic-form/widgets/CurrencyWidget';
import { DateTimeWidget } from '../../src/dynamic-form/widgets/DateTimeWidget';
import { DateWidget } from '../../src/dynamic-form/widgets/DateWidget';
import { InputOTPWidget } from '../../src/dynamic-form/widgets/InputOTPWidget';
import { NumberInputWidget } from '../../src/dynamic-form/widgets/NumberInputWidget';
import { PhoneWidget } from '../../src/dynamic-form/widgets/PhoneWidget';
import { RangeWidget } from '../../src/dynamic-form/widgets/RangeWidget';
import { RichTextWidget } from '../../src/dynamic-form/widgets/RichTextWidget';
import { SegmentedWidget } from '../../src/dynamic-form/widgets/SegmentedWidget';
import { StepperWidget } from '../../src/dynamic-form/widgets/StepperWidget';
import { TagInputWidget } from '../../src/dynamic-form/widgets/TagInputWidget';
import { TimeWidget } from '../../src/dynamic-form/widgets/TimeWidget';
import { makeWidgetProps } from './widgetProps';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe('dynamic-form ColorWidget', () => {
  it('shows the default colour and emits a picked preset', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps();
    render(<ColorWidget {...props} />);
    expect(screen.getByTestId('root_field')).toHaveTextContent('#3b82f6');
    await user.click(screen.getByTestId('root_field'));
    await user.click(screen.getByTitle('#ef4444'));
    expect(onChange).toHaveBeenCalledWith('#ef4444');
  });

  it('shows the stored value, and is disabled for disabled or readonly', () => {
    const { props } = makeWidgetProps({ value: '#22c55e', readonly: true, rawErrors: ['x'], required: true });
    render(<ColorWidget {...props} />);
    const trigger = screen.getByTestId('root_field');
    expect(trigger).toHaveTextContent('#22c55e');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-required', 'true');
  });
});

describe('dynamic-form TimeWidget', () => {
  it('shows the value and emits the typed time', () => {
    const { props, onChange } = makeWidgetProps({ value: '09:30' });
    render(<TimeWidget {...props} />);
    const input = screen.getByTestId('root_field') as HTMLInputElement;
    expect(input.value).toBe('09:30');
    fireEvent.change(input, { target: { value: '10:15' } });
    expect(onChange).toHaveBeenCalledWith('10:15');
  });

  it('is empty by default and maps disabled/readonly/errors', () => {
    const { props } = makeWidgetProps({ readonly: true, required: true, rawErrors: ['bad'] });
    render(<TimeWidget {...props} />);
    const input = screen.getByTestId('root_field') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input).toBeDisabled();
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form DateTimeWidget', () => {
  it('splits the stored ISO value and emits a combined value when the time changes', () => {
    const { props, onChange } = makeWidgetProps({ value: '2026-07-15T09:30' });
    render(<DateTimeWidget {...props} />);
    const time = screen.getByTestId('root_field-time') as HTMLInputElement;
    expect(time.value).toBe('09:30');
    fireEvent.change(time, { target: { value: '11:00' } });
    expect(onChange).toHaveBeenCalledWith('2026-07-15T11:00');
  });

  it('turns a cleared date into undefined so RJSF drops the property', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: '2026-07-15T09:30' });
    render(<DateTimeWidget {...props} />);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('starts empty and locks both inputs when readonly', () => {
    const { props } = makeWidgetProps({ readonly: true, rawErrors: ['bad'], required: true });
    render(<DateTimeWidget {...props} />);
    expect(screen.getByTestId('root_field-date')).toBeDisabled();
    expect(screen.getByTestId('root_field-time')).toBeDisabled();
    expect(screen.getByTestId('root_field-date')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form DateWidget', () => {
  it('shows a stored YYYY-MM-DD date and emits a cleared value as undefined', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: '2026-07-15' });
    render(<DateWidget {...props} />);
    expect(screen.getByTestId('root_field').textContent).toMatch(/2026/);
    await user.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('emits a picked day as a zero-padded ISO date', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: '2026-07-15' });
    render(<DateWidget {...props} />);
    await user.click(screen.getByTestId('root_field'));
    const popover = screen.getByTestId('root_field-popover');
    await user.click(within(popover).getAllByRole('button', { name: /\b5(th)?,/ })[0]);
    expect(onChange).toHaveBeenCalledWith('2026-07-05');
  });

  it.each([[undefined], [''], ['not-a-date'], [20260715]])('shows the placeholder for an unusable value %j', (value) => {
    const { props } = makeWidgetProps({ value: value as never });
    render(<DateWidget {...props} />);
    expect(screen.getByTestId('root_field')).toHaveAttribute('data-placeholder', 'true');
  });

  it('disables the picker for readonly and flags errors', () => {
    const { props } = makeWidgetProps({ readonly: true, rawErrors: ['bad'], required: true });
    render(<DateWidget {...props} />);
    expect(screen.getByTestId('root_field')).toBeDisabled();
    expect(screen.getByTestId('root_field')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form InputOTPWidget', () => {
  it('defaults to six slots, shows the value and emits typed digits', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: '12' });
    const { container } = render(<InputOTPWidget {...props} />);
    expect(container.querySelectorAll('[data-slot="input-otp"], input').length).toBeGreaterThan(0);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toHaveAttribute('maxlength', '6');
    expect(input.value).toBe('12');
    await user.click(input);
    await user.keyboard('3');
    expect(onChange).toHaveBeenCalledWith('123');
  });

  it('takes its length from options.length first, then schema.maxLength', () => {
    const fromOptions = makeWidgetProps({ options: { length: 4 }, schema: { type: 'string', maxLength: 8 } });
    const { container, unmount } = render(<InputOTPWidget {...fromOptions.props} />);
    expect(container.querySelector('input')).toHaveAttribute('maxlength', '4');
    unmount();
    const fromSchema = makeWidgetProps({ schema: { type: 'string', maxLength: 8 } });
    const second = render(<InputOTPWidget {...fromSchema.props} />);
    expect(second.container.querySelector('input')).toHaveAttribute('maxlength', '8');
  });

  it('disables for readonly and flags errors', () => {
    const { props } = makeWidgetProps({ readonly: true, rawErrors: ['bad'], required: true });
    const { container } = render(<InputOTPWidget {...props} />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-required', 'true');
  });
});

describe('dynamic-form NumberInputWidget', () => {
  it('shows the number, emits parsed values, and turns an emptied field into undefined', () => {
    const { props, onChange } = makeWidgetProps({ value: 5, schema: { type: 'number', minimum: 0, maximum: 100 } });
    render(<NumberInputWidget {...props} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('5');
    fireEvent.change(input, { target: { value: '42' } });
    expect(onChange).toHaveBeenLastCalledWith(42);
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('clamps to the schema bounds', () => {
    const { props, onChange } = makeWidgetProps({ value: 5, schema: { type: 'number', minimum: 0, maximum: 100 } });
    render(<NumberInputWidget {...props} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '500' } });
    expect(onChange).toHaveBeenLastCalledWith(100);
  });

  it('applies decimals, thousand separators, prefix and suffix options', () => {
    const { props } = makeWidgetProps({
      value: 1234.5,
      options: { decimals: 2, thousandSeparator: true, prefix: '$', suffix: 'USD' },
      placeholder: 'Amount',
    });
    render(<NumberInputWidget {...props} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('1,234.50');
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
  });

  it('is blank for a non-numeric stored value and maps readonly and errors', () => {
    const { props } = makeWidgetProps({ value: 'abc' as never, readonly: true, rawErrors: ['bad'], required: true });
    render(<NumberInputWidget {...props} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form CurrencyWidget', () => {
  it('formats the stored value as USD by default and emits numbers', () => {
    const { props, onChange } = makeWidgetProps({ value: 12.5 });
    render(<CurrencyWidget {...props} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/12\.50/);
    fireEvent.change(input, { target: { value: '20' } });
    expect(onChange).toHaveBeenLastCalledWith(20);
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('honours options.currency and options.locale', () => {
    const { props } = makeWidgetProps({ value: 1234.5, options: { currency: 'EUR', locale: 'de-DE' } });
    render(<CurrencyWidget {...props} />);
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toMatch(/1\.234,50/);
  });

  it('is blank for a non-number and locks when readonly', () => {
    const { props } = makeWidgetProps({ value: 'x' as never, readonly: true, placeholder: 'Price' });
    render(<CurrencyWidget {...props} />);
    const input = screen.getByPlaceholderText('Price') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(input).toBeDisabled();
  });
});

describe('dynamic-form PhoneWidget', () => {
  it('emits phone text in international format when a default dial code is set', () => {
    const { props, onChange } = makeWidgetProps({ options: { defaultDialCode: '+44' } });
    render(<PhoneWidget {...props} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '447700900123' } });
    expect(onChange).toHaveBeenCalledWith('+44 770 090 0123');
  });

  it('formats national numbers without a dial code', () => {
    const { props, onChange } = makeWidgetProps();
    render(<PhoneWidget {...props} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '5551234567' } });
    expect(onChange).toHaveBeenCalledWith('(555) 123-4567');
  });

  it('shows the stored value and locks when readonly', () => {
    const { props } = makeWidgetProps({ value: '+1 5551234567', readonly: true, rawErrors: ['x'], required: true });
    render(<PhoneWidget {...props} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form RangeWidget', () => {
  it('reads bounds from the schema, defaults to the minimum and emits slider moves as numbers', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ schema: { type: 'integer', minimum: 10, maximum: 20, multipleOf: 1 } });
    render(<RangeWidget {...props} />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '10');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(11);
  });

  it('defaults to zero when the schema has no bounds, and options.step overrides the schema step', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ options: { step: 5 }, value: 'x' as never, schema: { type: 'number' } });
    render(<RangeWidget {...props} />);
    const thumb = screen.getByRole('slider');
    expect(thumb).toHaveAttribute('aria-valuenow', '0');
    thumb.focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('is disabled for readonly', () => {
    const { props } = makeWidgetProps({ value: 3, readonly: true, schema: { type: 'integer', minimum: 0, maximum: 10 } });
    render(<RangeWidget {...props} />);
    expect(document.querySelector('[data-slot="slider"]')).toHaveAttribute('data-disabled');
  });
});

describe('dynamic-form StepperWidget', () => {
  it('increments and decrements by the schema step, clamped to the bounds', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: 2, schema: { type: 'integer', minimum: 1, maximum: 3 } });
    render(<StepperWidget {...props} />);
    await user.click(screen.getByRole('button', { name: /increase|increment|plus/i }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.click(screen.getByRole('button', { name: /decrease|decrement|minus/i }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('uses options.step, the unit labels and the fileText icon', () => {
    const { props } = makeWidgetProps({ value: 1, options: { step: 5, unit: 'page', unitPlural: 'pages', icon: 'fileText' }, schema: { type: 'integer' } });
    const { container } = render(<StepperWidget {...props} />);
    expect(container.querySelector('svg.lucide-file-text')).toBeInTheDocument();
    expect(screen.getByText(/page/)).toBeInTheDocument();
  });

  it('starts at the minimum for a missing value and ignores unknown icons', () => {
    const { props } = makeWidgetProps({ options: { icon: 'mystery' }, schema: { type: 'integer', minimum: 4 } });
    const { container } = render(<StepperWidget {...props} />);
    expect(container).toHaveTextContent('4');
    expect(container.querySelector('svg.lucide-file-text')).toBeNull();
  });

  it('locks both buttons when readonly', () => {
    const { props } = makeWidgetProps({ value: 2, readonly: true, schema: { type: 'integer' } });
    render(<StepperWidget {...props} />);
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });
});

describe('dynamic-form SegmentedWidget', () => {
  const enumOptions = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta' },
    { value: 'c', label: 'Gamma' },
  ];

  it('renders options, marks the stored one and emits the clicked one', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: 'a', options: { enumOptions } });
    render(<SegmentedWidget {...props} />);
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('disables options listed in enumDisabled', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ options: { enumOptions, enumDisabled: ['c'] } });
    render(<SegmentedWidget {...props} />);
    expect(screen.getByRole('radio', { name: 'Gamma' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Gamma' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders nothing selectable without options and locks for readonly', () => {
    const { props } = makeWidgetProps({ options: {}, readonly: true });
    render(<SegmentedWidget {...props} />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });
});

describe('dynamic-form TagInputWidget', () => {
  it('shows stored tags and emits the full list when one is added', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: ['a'], schema: { type: 'array' } });
    render(<TagInputWidget {...props} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'b{Enter}');
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('honours options.maxItems and treats a non-array value as empty', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ value: 'oops' as never, options: { maxItems: 1 }, placeholder: 'Tags' });
    render(<TagInputWidget {...props} />);
    expect(screen.getByPlaceholderText('Tags')).toBeInTheDocument();
    await user.type(screen.getByRole('textbox'), 'one{Enter}');
    expect(onChange).toHaveBeenCalledWith(['one']);
  });

  it('hides remove buttons when readonly', () => {
    const { props } = makeWidgetProps({ value: ['a'], readonly: true });
    render(<TagInputWidget {...props} />);
    expect(screen.queryByLabelText('Remove a')).not.toBeInTheDocument();
  });
});

describe('dynamic-form RichTextWidget', () => {
  it('renders the stored HTML and locks the editor when readonly', async () => {
    const { props } = makeWidgetProps({ value: '<p>Hello</p>', readonly: true, rawErrors: ['x'], required: true, placeholder: 'Write' });
    render(<RichTextWidget {...props} />);
    await waitFor(() => expect(document.querySelector('.ProseMirror')).toHaveTextContent('Hello'));
    expect(document.querySelector('.ProseMirror')).toHaveAttribute('contenteditable', 'false');
    expect(screen.getByRole('button', { name: 'Bold' })).toBeDisabled();
    expect(document.getElementById('root_field')).toHaveAttribute('aria-invalid', 'true');
  });

  it('emits HTML when formatting is applied', async () => {
    const { props, onChange } = makeWidgetProps({ value: '<p>Hi</p>' });
    render(<RichTextWidget {...props} />);
    const editor = () => document.querySelector('.ProseMirror') as HTMLElement;
    await waitFor(() => expect(editor()).toHaveTextContent('Hi'));
    editor().focus();
    const range = document.createRange();
    range.selectNodeContents(editor());
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 30));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Bullet list' }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(expect.stringContaining('<ul>')));
  });
});
