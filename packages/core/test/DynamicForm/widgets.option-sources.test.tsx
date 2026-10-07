import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { ComboboxWidget } from '../../src/dynamic-form/widgets/ComboboxWidget';
import { FileUploadWidget } from '../../src/dynamic-form/widgets/FileUploadWidget';
import { MultiSelectWidget } from '../../src/dynamic-form/widgets/MultiSelectWidget';
import { SelectWidget } from '../../src/dynamic-form/widgets/SelectWidget';
import { makeWidgetProps } from './widgetProps';

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
  Element.prototype.scrollIntoView ??= () => undefined;
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => undefined;
  Element.prototype.releasePointerCapture ??= () => undefined;
});

const enumOptions = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

const contextWith = (extra: Record<string, unknown>) => ({ formContext: { derived: {}, optionSets: {}, actions: {}, locale: 'en', ...extra } }) as never;

const optionSet = [
  { value: 'x', label: 'Xavier', description: null, avatarUrl: null, initials: null, color: null, group: null, disabled: false },
  { value: 'y', label: 'Yara', description: null, avatarUrl: null, initials: null, color: null, group: null, disabled: false },
];

describe.each([
  ['SelectWidget', SelectWidget, 'Select'],
  ['ComboboxWidget', ComboboxWidget, 'Find'],
] as const)('dynamic-form %s', (_name, Widget, verb) => {
  const open = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByTestId('root_field'));
    return user;
  };

  it('lists schema enum options and emits the chosen value', async () => {
    const { props, onChange } = makeWidgetProps({ options: { enumOptions }, value: 'a' });
    render(<Widget {...props} />);
    const user = await open();
    await user.click(await screen.findByRole('option', { name: 'Beta' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('prefers the option set named by ui:options.optionSetKey from formContext', async () => {
    const { props } = makeWidgetProps({
      options: { enumOptions, optionSetKey: 'people' },
      registry: contextWith({ optionSets: { people: optionSet } }),
    });
    render(<Widget {...props} />);
    await open();
    expect(await screen.findByRole('option', { name: /Xavier/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Alpha' })).not.toBeInTheDocument();
  });

  it('falls back to the enum when the option set key is unknown', async () => {
    const { props } = makeWidgetProps({ options: { enumOptions, optionSetKey: 'missing' }, registry: contextWith({}) });
    render(<Widget {...props} />);
    await open();
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('renders no options when neither source exists', async () => {
    const { props } = makeWidgetProps({ options: {} });
    render(<Widget {...props} />);
    await open();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('shows the explicit placeholder, then the schema title, then the generic text', () => {
    const explicit = makeWidgetProps({ options: { placeholder: 'Pick me' }, schema: { type: 'string', title: 'Owner' } });
    const first = render(<Widget {...explicit.props} />);
    expect(screen.getByTestId('root_field')).toHaveTextContent('Pick me');
    first.unmount();

    const fromProp = makeWidgetProps({ placeholder: 'Prop text', schema: { type: 'string', title: 'Owner' } });
    const second = render(<Widget {...fromProp.props} />);
    expect(screen.getByTestId('root_field')).toHaveTextContent('Prop text');
    second.unmount();

    const fromTitle = makeWidgetProps({ placeholder: undefined as never, schema: { type: 'string', title: 'Owner' } });
    const third = render(<Widget {...fromTitle.props} />);
    expect(screen.getByTestId('root_field')).toHaveTextContent(`${verb} owner…`);
    third.unmount();

    const generic = makeWidgetProps({ placeholder: undefined as never });
    render(<Widget {...generic.props} />);
    expect(screen.getByTestId('root_field')).toHaveTextContent(verb === 'Select' ? 'Select…' : 'Search…');
  });

  it('adds a footer action from formContext.actions and navigates to its href when selected', async () => {
    const assign = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, assign }, configurable: true });
    try {
      const { props } = makeWidgetProps({
        options: { enumOptions, footerActionKey: 'add' },
        registry: contextWith({ actions: { add: { label: 'Add new owner', href: '/owners/new', actionId: 'add' } } }),
      });
      render(<Widget {...props} />);
      const user = await open();
      await user.click(await screen.findByText('Add new owner'));
      expect(assign).toHaveBeenCalledWith('/owners/new');
    } finally {
      Object.defineProperty(window, 'location', { value: original, configurable: true });
    }
  });

  it('shows a footer action without an href and does not navigate', async () => {
    const assign = vi.fn();
    const original = window.location;
    Object.defineProperty(window, 'location', { value: { ...original, assign }, configurable: true });
    try {
      const { props } = makeWidgetProps({
        options: { enumOptions, footerActionKey: 'noop' },
        registry: contextWith({ actions: { noop: { label: 'Do thing', href: null, actionId: 'noop' } } }),
      });
      render(<Widget {...props} />);
      const user = await open();
      await user.click(await screen.findByText('Do thing'));
      expect(assign).not.toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, 'location', { value: original, configurable: true });
    }
  });

  it('ignores an unknown footer action key', async () => {
    const { props } = makeWidgetProps({ options: { enumOptions, footerActionKey: 'nope' }, registry: contextWith({}) });
    render(<Widget {...props} />);
    await open();
    expect(await screen.findByRole('option', { name: 'Alpha' })).toBeInTheDocument();
  });

  it('is disabled for readonly and flags errors and required', () => {
    const { props } = makeWidgetProps({ readonly: true, rawErrors: ['bad'], required: true, options: { enumOptions } });
    render(<Widget {...props} />);
    const trigger = screen.getByTestId('root_field');
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
  });

  it('works without a registry form context', () => {
    const { props } = makeWidgetProps({ options: { enumOptions }, registry: undefined as never });
    expect(() => render(<Widget {...props} />)).not.toThrow();
  });
});

describe('dynamic-form SelectWidget specifics', () => {
  it('hands multiple selects to the MultiSelect widget', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({ multiple: true, value: ['a'], options: { enumOptions } });
    render(<SelectWidget {...props} />);
    expect(screen.getByTestId('root_field')).toHaveAttribute('data-slot', 'multi-select');
    await user.click(screen.getByTestId('root_field'));
    await user.click(screen.getByTestId('root_field-option-b'));
    expect(onChange).toHaveBeenCalledWith(['a', 'b']);
  });

  it('forwards focus and blur with the field id and value', async () => {
    const user = userEvent.setup();
    const { props, onFocus, onBlur } = makeWidgetProps({ options: { enumOptions }, value: 'a' });
    render(<SelectWidget {...props} />);
    await user.click(screen.getByTestId('root_field'));
    expect(onFocus).toHaveBeenCalled();
    expect(onFocus.mock.calls[0][0]).toBe('root_field');
    await user.keyboard('{Escape}');
    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('offers search when options.searchable is set', async () => {
    const { props } = makeWidgetProps({ options: { enumOptions, searchable: true } });
    render(<SelectWidget {...props} />);
    const user = userEvent.setup();
    await user.click(screen.getByTestId('root_field'));
    expect(await screen.findByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});

describe('dynamic-form MultiSelectWidget', () => {
  it('shows stored values as chips, stringifies them and emits the new list', async () => {
    const user = userEvent.setup();
    const { props, onChange } = makeWidgetProps({
      value: [1, 'b'],
      options: { enumOptions: [{ value: 1, label: 'One' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }] },
    });
    render(<MultiSelectWidget {...props} />);
    expect(screen.getByRole('button', { name: 'Remove One' })).toBeInTheDocument();
    await user.click(screen.getByTestId('root_field'));
    await user.click(screen.getByTestId('root_field-option-c'));
    expect(onChange).toHaveBeenCalledWith(['1', 'b', 'c']);
  });

  it('treats a non-array value as empty, supports search and locks when readonly', async () => {
    const user = userEvent.setup();
    const { props } = makeWidgetProps({ value: 'x' as never, options: { enumOptions, searchable: true }, placeholder: 'Choose' });
    const { unmount } = render(<MultiSelectWidget {...props} />);
    expect(screen.getByTestId('root_field')).toHaveTextContent('Choose');
    await user.click(screen.getByTestId('root_field'));
    expect(within(screen.getByTestId('root_field-popover')).getByPlaceholderText('Search…')).toBeInTheDocument();
    unmount();

    const locked = makeWidgetProps({ readonly: true, rawErrors: ['x'], required: true, options: {} });
    render(<MultiSelectWidget {...locked.props} />);
    expect(screen.getByTestId('root_field')).toBeDisabled();
    expect(screen.getByTestId('root_field')).toHaveAttribute('aria-invalid', 'true');
  });
});

describe('dynamic-form FileUploadWidget', () => {
  it('shows an explanatory note until ui:options.mode is "name"', () => {
    const { props } = makeWidgetProps();
    render(<FileUploadWidget {...props} />);
    expect(screen.getByRole('note')).toHaveTextContent(/not wired for upload/);
    expect(document.querySelector('input[type="file"]')).toBeNull();
  });

  it('emits the single picked file name for a string field', () => {
    const { props, onChange } = makeWidgetProps({ options: { mode: 'name' }, schema: { type: 'string' } });
    render(<FileUploadWidget {...props} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toHaveAttribute('multiple');
    const file = new File(['x'], 'a.txt');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('a.txt');
  });

  it('emits every picked name for an array field and forwards the limits', () => {
    const { props, onChange } = makeWidgetProps({
      options: { mode: 'name', accept: '.txt', maxSize: 100, maxFiles: 2 },
      schema: { type: 'array' },
      required: true,
      rawErrors: ['x'],
    });
    render(<FileUploadWidget {...props} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('multiple');
    expect(input).toHaveAttribute('accept', '.txt');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const files = [new File(['x'], 'a.txt'), new File(['y'], 'b.txt')];
    Object.defineProperty(input, 'files', { value: files, configurable: true });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith(['a.txt', 'b.txt']);
  });

  it('disables the picker for readonly', () => {
    const { props } = makeWidgetProps({ options: { mode: 'name' }, readonly: true });
    render(<FileUploadWidget {...props} />);
    expect(document.querySelector('input[type="file"]')).toBeDisabled();
  });
});
