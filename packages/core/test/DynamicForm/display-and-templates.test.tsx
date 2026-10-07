import '@testing-library/jest-dom';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FieldProps, WidgetProps, WrapIfAdditionalTemplateProps } from '@rjsf/utils';
import { ADDITIONAL_PROPERTY_FLAG } from '@rjsf/utils';
import { vi } from 'vitest';

import { StaticPanelField } from '../../src/dynamic-form/fields/StaticPanelField';
import { useStableRjsfCallbacks } from '../../src/dynamic-form/lib/useStableRjsfCallbacks';
import { WrapIfAdditionalTemplate } from '../../src/dynamic-form/templates/WrapIfAdditionalTemplate';
import { DerivedTextWidget } from '../../src/dynamic-form/widgets/DerivedTextWidget';
import { IconToolbarWidget } from '../../src/dynamic-form/widgets/IconToolbarWidget';
import { makeWidgetProps } from './widgetProps';

const registryWith = (derived: Record<string, unknown>) => ({ formContext: { derived, optionSets: {}, actions: {}, locale: 'en' } }) as never;

describe('dynamic-form DerivedTextWidget', () => {
  it('renders the derived string for its key, in the default tone', () => {
    const { props } = makeWidgetProps({ options: { derivedKey: 'total' }, registry: registryWith({ total: '$12.00' }) });
    render(<DerivedTextWidget {...props} />);
    const node = screen.getByTestId('root_field-derived');
    expect(node).toHaveTextContent('$12.00');
    expect(node).toHaveClass('text-foreground');
  });

  it.each([
    ['muted', 'text-muted-foreground'],
    ['success', 'text-emerald-500'],
    ['danger', 'text-destructive'],
    ['loud', 'text-foreground'],
  ])('tone %s maps to %s', (tone, cls) => {
    const { props } = makeWidgetProps({ options: { derivedKey: 'k', tone }, registry: registryWith({ k: 'v' }) });
    render(<DerivedTextWidget {...props} />);
    expect(screen.getByTestId('root_field-derived')).toHaveClass(cls);
  });

  it('renders nothing for a missing key, a non-string value, or no form context', () => {
    const noKey = makeWidgetProps({ options: {}, registry: registryWith({ k: 'v' }) });
    const first = render(<DerivedTextWidget {...noKey.props} />);
    expect(screen.getByTestId('root_field-derived')).toBeEmptyDOMElement();
    first.unmount();

    const nonString = makeWidgetProps({ options: { derivedKey: 'k' }, registry: registryWith({ k: 12 }) });
    const second = render(<DerivedTextWidget {...nonString.props} />);
    expect(screen.getByTestId('root_field-derived')).toBeEmptyDOMElement();
    second.unmount();

    const noContext = makeWidgetProps({ options: { derivedKey: 'k' }, registry: undefined as never });
    render(<DerivedTextWidget {...noContext.props} />);
    expect(screen.getByTestId('root_field-derived')).toBeEmptyDOMElement();
  });
});

describe('dynamic-form StaticPanelField', () => {
  const fieldProps = (overrides: Partial<FieldProps>) => ({ registry: registryWith({}), ...overrides }) as unknown as FieldProps;

  it('renders the derived panel value and stacked lines', () => {
    render(
      <StaticPanelField
        {...fieldProps({
          idSchema: { $id: 'root_timer' } as never,
          uiSchema: { 'ui:options': { panelKey: 'elapsed', lines: ['title', 'status', 'absent'] } } as never,
          registry: registryWith({ elapsed: '12h 21m', title: 'Timer', status: 'Running' }),
        })}
      />,
    );
    expect(screen.getByTestId('root_timer-panel-elapsed')).toHaveTextContent('12h 21m');
    expect(screen.getByTestId('root_timer-panel-title')).toHaveTextContent('Timer');
    expect(screen.getByTestId('root_timer-panel-status')).toHaveTextContent('Running');
    expect(screen.getByTestId('root_timer-panel-absent')).toBeEmptyDOMElement();
  });

  it('derives its id from the field name, or a fixed fallback', () => {
    const named = render(<StaticPanelField {...fieldProps({ name: 'summary', uiSchema: {} as never })} />);
    expect(screen.getByTestId('root_summary-static-panel')).toBeInTheDocument();
    named.unmount();

    const emptyId = render(<StaticPanelField {...fieldProps({ idSchema: { $id: '' } as never, name: 'x' })} />);
    expect(screen.getByTestId('root_x-static-panel')).toBeInTheDocument();
    emptyId.unmount();

    render(<StaticPanelField {...fieldProps({})} />);
    expect(screen.getByTestId('static-panel-static-panel')).toBeInTheDocument();
  });

  it('renders no panel blocks without options, and tolerates a missing form context', () => {
    render(<StaticPanelField {...(({ idSchema: { $id: 'p' } }) as unknown as FieldProps)} />);
    const root = screen.getByTestId('p-static-panel');
    expect(root).toBeEmptyDOMElement();
  });

  it('ignores non-string panelKey and non-array lines', () => {
    render(<StaticPanelField {...fieldProps({ idSchema: { $id: 'p' } as never, uiSchema: { 'ui:options': { panelKey: 3, lines: 'no' } } as never })} />);
    expect(screen.getByTestId('p-static-panel')).toBeEmptyDOMElement();
  });
});

describe('dynamic-form IconToolbarWidget', () => {
  it('renders one labelled button per action and wires onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { props } = makeWidgetProps({
      options: {
        actions: [
          { icon: 'trash', label: 'Delete', onClick },
          { icon: 'copy', label: 'Duplicate' },
          { icon: 'move-up', label: 'Up', variant: 'ghost' },
          { icon: 'move-down', label: 'Down' },
          { icon: 'x', label: 'Clear' },
        ],
      },
    });
    render(<IconToolbarWidget {...props} />);
    expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual(['Delete', 'Duplicate', 'Up', 'Down', 'Clear']);
    await user.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is empty without actions and disables every button when disabled or readonly', () => {
    const empty = makeWidgetProps({ options: {} });
    const first = render(<IconToolbarWidget {...empty.props} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    first.unmount();

    const locked = makeWidgetProps({ readonly: true, options: { actions: [{ icon: 'copy', label: 'Duplicate' }] } });
    render(<IconToolbarWidget {...locked.props} />);
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeDisabled();
  });
});

describe('dynamic-form useStableRjsfCallbacks', () => {
  const base = (over: Partial<WidgetProps> = {}) => makeWidgetProps(over).props;

  it('keeps handler identity across renders while calling the latest RJSF callbacks', () => {
    const first = base();
    const { result, rerender } = renderHook(({ props }) => useStableRjsfCallbacks<string>(props), { initialProps: { props: first } });
    const handlers = result.current;
    const second = base({ id: 'root_other' });
    rerender({ props: second });
    expect(result.current.onChange).toBe(handlers.onChange);
    expect(result.current.onBlur).toBe(handlers.onBlur);
    expect(result.current.onFocus).toBe(handlers.onFocus);

    result.current.onChange('hello');
    expect(first.onChange).not.toHaveBeenCalled();
    expect(second.onChange).toHaveBeenCalledWith('hello');
    const target = { value: 'v' } as HTMLInputElement;
    result.current.onBlur({ target } as never);
    result.current.onFocus({ target } as never);
    expect(second.onBlur).toHaveBeenCalledWith('root_other', 'v');
    expect(second.onFocus).toHaveBeenCalledWith('root_other', 'v');
  });

  it('substitutes the empty value for an empty string only, using "" when none is given', () => {
    const withEmpty = base({ options: { emptyValue: 'N/A' } });
    const a = renderHook(() => useStableRjsfCallbacks<string>(withEmpty));
    a.result.current.onChange('');
    a.result.current.onChange('x');
    expect(withEmpty.onChange).toHaveBeenNthCalledWith(1, 'N/A');
    expect(withEmpty.onChange).toHaveBeenNthCalledWith(2, 'x');

    const without = base();
    const b = renderHook(() => useStableRjsfCallbacks<string>(without));
    b.result.current.onChange('');
    expect(without.onChange).toHaveBeenCalledWith('');
  });

  it('honours an explicit null emptyValue (clearing the field stores null)', () => {
    const props = base({ options: { emptyValue: null } });
    const { result } = renderHook(() => useStableRjsfCallbacks<string>(props));
    result.current.onChange('');
    expect(props.onChange).toHaveBeenCalledWith(null);
  });

  it('applies a custom transform', () => {
    const props = base();
    const { result } = renderHook(() => useStableRjsfCallbacks<number>(props, (n) => n * 2));
    result.current.onChange(21);
    expect(props.onChange).toHaveBeenCalledWith(42);
  });

  it('does not throw when onBlur or onFocus are absent', () => {
    const props = { ...base(), onBlur: undefined, onFocus: undefined } as unknown as WidgetProps;
    const { result } = renderHook(() => useStableRjsfCallbacks<string>(props));
    expect(() => result.current.onBlur({ target: { value: '' } } as never)).not.toThrow();
    expect(() => result.current.onFocus({ target: { value: '' } } as never)).not.toThrow();
  });
});

describe('dynamic-form WrapIfAdditionalTemplate', () => {
  const buttons = () => {
    const RemoveButton = ({ onClick, disabled, id }: { onClick: () => void; disabled?: boolean; id: string }) => (
      <button type="button" id={id} disabled={disabled} onClick={onClick}>
        remove
      </button>
    );
    return RemoveButton;
  };

  const make = (over: Partial<WrapIfAdditionalTemplateProps> = {}): WrapIfAdditionalTemplateProps =>
    ({
      classNames: 'row-class',
      style: { color: 'red' },
      children: <span>value-field</span>,
      disabled: false,
      id: 'root_extra',
      label: 'color',
      displayLabel: true,
      onRemoveProperty: vi.fn(),
      onKeyRenameBlur: vi.fn(),
      rawDescription: undefined,
      readonly: false,
      required: false,
      schema: { type: 'string', [ADDITIONAL_PROPERTY_FLAG]: true },
      uiSchema: {},
      registry: {
        templates: { ButtonTemplates: { RemoveButton: buttons() } },
        translateString: (_key: unknown, params: string[] = []) => `Key ${params[0] ?? ''}`,
      },
      ...over,
    }) as unknown as WrapIfAdditionalTemplateProps;

  it('renders the plain wrapper for ordinary properties', () => {
    const { container } = render(<WrapIfAdditionalTemplate {...make({ schema: { type: 'string' } })} />);
    expect(screen.getByText('value-field')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="wrap-if-additional"]')).toBeNull();
    expect(container.firstChild).toHaveClass('row-class');
  });

  it('renders a rename input, the value and a remove button for additional properties', () => {
    const props = make({ rawDescription: 'Pick a key' });
    render(<WrapIfAdditionalTemplate {...props} />);
    const key = screen.getByLabelText('Key color') as HTMLInputElement;
    expect(key.value).toBe('color');
    expect(key).toHaveAttribute('id', 'root_extra-key');
    expect(screen.getByText('value-field')).toBeInTheDocument();
    expect(screen.getByText('Pick a key')).toBeInTheDocument();
    fireEvent.blur(key);
    expect(props.onKeyRenameBlur).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    expect(props.onRemoveProperty).toHaveBeenCalledTimes(1);
  });

  it('hides the key label when displayLabel is false and omits the description when absent', () => {
    render(<WrapIfAdditionalTemplate {...make({ displayLabel: false })} />);
    expect(screen.queryByText('Key color')).not.toBeInTheDocument();
    expect(screen.queryByText('Pick a key')).not.toBeInTheDocument();
  });

  it('is read-only: no rename handler, key and remove disabled', () => {
    const props = make({ readonly: true });
    render(<WrapIfAdditionalTemplate {...props} />);
    const key = screen.getByLabelText('Key color');
    expect(key).toBeDisabled();
    fireEvent.blur(key);
    expect(props.onKeyRenameBlur).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'remove' })).toBeDisabled();
  });

  it('marks the key required and disabled when the form is disabled', () => {
    render(<WrapIfAdditionalTemplate {...make({ required: true, disabled: true, classNames: undefined })} />);
    expect(screen.getByLabelText('Key color')).toBeRequired();
    expect(screen.getByLabelText('Key color')).toBeDisabled();
  });
});
