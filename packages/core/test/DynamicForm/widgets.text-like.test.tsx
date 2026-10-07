import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { HiddenWidget } from '../../src/dynamic-form/widgets/HiddenWidget';
import { TextareaWidget } from '../../src/dynamic-form/widgets/TextareaWidget';
import { TextWidget } from '../../src/dynamic-form/widgets/TextWidget';
import { makeWidgetProps } from './widgetProps';

describe('dynamic-form TextWidget', () => {
  it('emits the typed text and forwards blur and focus with the field id and value', () => {
    const { props, onChange, onBlur, onFocus } = makeWidgetProps({ value: 'abc' });
    render(<TextWidget {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('abc');
    fireEvent.change(input, { target: { value: 'abcd' } });
    expect(onChange).toHaveBeenCalledWith('abcd');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledWith('root_field', 'abc');
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledWith('root_field', 'abc');
  });

  it('turns an emptied field into options.emptyValue, or an empty string by default', () => {
    const withEmpty = makeWidgetProps({ value: 'x', options: { emptyValue: undefined } });
    const { unmount } = render(<TextWidget {...withEmpty.props} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(withEmpty.onChange).toHaveBeenCalledWith('');
    unmount();

    const custom = makeWidgetProps({ value: 'x', options: { emptyValue: null } });
    render(<TextWidget {...custom.props} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } });
    expect(custom.onChange).toHaveBeenCalledWith(null);
  });

  it.each([
    [{ schema: { type: 'string', format: 'email' } }, 'email'],
    [{ schema: { type: 'string', format: 'uri' } }, 'url'],
    [{ schema: { type: 'string', format: 'url' } }, 'url'],
    [{ schema: { type: 'string', format: 'date' } }, 'date'],
    [{ schema: { type: 'string', format: 'date-time' } }, 'datetime-local'],
    [{ schema: { type: 'string', format: 'time' } }, 'time'],
    [{ schema: { type: 'string', format: 'unknown' } }, 'text'],
    [{ schema: { type: 'string' } }, 'text'],
    [{ schema: { type: 'string', format: 'email' }, type: 'tel' }, 'tel'],
    [{ schema: { type: 'string', format: 'email' }, type: 'tel', options: { inputType: 'search' } }, 'search'],
  ])('resolves the input type for %j to %s', (overrides, expected) => {
    const { props } = makeWidgetProps(overrides as never);
    const { container } = render(<TextWidget {...props} />);
    expect(container.querySelector('input')).toHaveAttribute('type', expected);
  });

  it('uses the placeholder, falling back to the schema title', () => {
    const first = makeWidgetProps({ placeholder: 'Your name', schema: { type: 'string', title: 'Name' } });
    const { unmount } = render(<TextWidget {...first.props} />);
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    unmount();
    const second = makeWidgetProps({ placeholder: undefined as never, schema: { type: 'string', title: 'Name' } });
    render(<TextWidget {...second.props} />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });

  it('maps required, disabled, readonly, rawErrors and maxLength onto the input', () => {
    const { props } = makeWidgetProps({ required: true, readonly: true, rawErrors: ['bad'], schema: { type: 'string', maxLength: 5 } });
    render(<TextWidget {...props} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('maxlength', '5');
  });

  it('disables the input', () => {
    const { props } = makeWidgetProps({ disabled: true });
    render(<TextWidget {...props} />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('commitOnEnter blurs the field on Enter', async () => {
    const user = userEvent.setup();
    const { props } = makeWidgetProps({ options: { commitOnEnter: true }, value: 'x' });
    render(<TextWidget {...props} />);
    const input = screen.getByRole('textbox');
    await user.click(input);
    expect(input).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(input).not.toHaveFocus();
  });
});

describe('dynamic-form TextareaWidget', () => {
  it('emits text, forwards focus/blur and honours rows and maxLength', () => {
    const { props, onChange, onBlur, onFocus } = makeWidgetProps({ value: 'hi', placeholder: undefined as never, options: { rows: 8 }, schema: { type: 'string', maxLength: 20, title: 'Notes' } });
    render(<TextareaWidget {...props} />);
    const area = screen.getByRole('textbox');
    expect(area).toHaveAttribute('rows', '8');
    expect(area).toHaveAttribute('maxlength', '20');
    expect(area).toHaveAttribute('placeholder', 'Notes');
    fireEvent.change(area, { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
    fireEvent.focus(area);
    fireEvent.blur(area);
    expect(onFocus).toHaveBeenCalledWith('root_field', 'hi');
    expect(onBlur).toHaveBeenCalledWith('root_field', 'hi');
  });

  it('defaults to five rows and maps readonly, required and errors', () => {
    const { props } = makeWidgetProps({ required: true, readonly: true, rawErrors: ['x'], placeholder: 'Write' });
    render(<TextareaWidget {...props} />);
    const area = screen.getByPlaceholderText('Write');
    expect(area).toHaveAttribute('rows', '5');
    expect(area).toBeRequired();
    expect(area).toHaveAttribute('readonly');
    expect(area).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form HiddenWidget', () => {
  it('renders a read-only hidden input carrying the value', () => {
    const { props } = makeWidgetProps({ value: 42 });
    const { container } = render(<HiddenWidget {...props} />);
    const input = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(input.value).toBe('42');
    expect(input).toHaveAttribute('data-slot', 'hidden-widget');
    expect(input).toHaveAttribute('id', 'root_field');
  });

  it('is empty when there is no value', () => {
    const { props } = makeWidgetProps();
    const { container } = render(<HiddenWidget {...props} />);
    expect((container.querySelector('input') as HTMLInputElement).value).toBe('');
  });
});
