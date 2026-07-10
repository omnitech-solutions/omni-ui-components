import * as React from 'react';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type AnyProps = Record<string, unknown>;

export interface ControlContractArgs<P extends AnyProps> {
  name: string;
  Component: React.ComponentType<P>;
  baseProps: P;
  controlSelector: string;
  readValue?: (control: Element) => string | undefined;
  typeValue?: (user: ReturnType<typeof userEvent.setup>, control: Element, next: string) => Promise<void>;
  sampleValue?: string;
  supports?: Partial<{
    typing: boolean;
    controlled: boolean;
    disabled: boolean;
    readOnly: boolean;
    ariaInvalid: boolean;
    idLabelLink: boolean;
  }>;
}

export function runControlContract<P extends AnyProps>({
  name,
  Component,
  baseProps,
  controlSelector,
  readValue,
  typeValue,
  sampleValue,
  supports,
}: ControlContractArgs<P>) {
  const features = {
    typing: false,
    controlled: true,
    disabled: true,
    readOnly: false,
    ariaInvalid: true,
    idLabelLink: true,
    ...(supports ?? {}),
  };

  const renderWith = (extra: Partial<P>) => render(<Component {...(baseProps as P)} {...(extra as P)} />);

  const getControl = (container?: HTMLElement): Element => {
    const root: ParentNode = container ?? document.body;
    const el = root.querySelector(controlSelector);
    if (!el) throw new Error(`runControlContract(${name}): no control matched ${controlSelector}`);
    return el;
  };

  describe(`${name} — control contract`, () => {
    it('renders without crashing', () => {
      renderWith({});
      getControl();
    });

    if (features.idLabelLink) {
      it('wires label htmlFor to the control id', () => {
        const { container } = renderWith({ label: 'My label' } as Partial<P>);
        const label = container.querySelector('label[for]') as HTMLLabelElement | null;
        if (!label) {
          const ctrl = getControl(container);
          expect(ctrl.id).toBeTruthy();
          return;
        }
        const ctrl = getControl(container);
        expect(ctrl.id).toBeTruthy();
        expect(label.getAttribute('for')).toBe(ctrl.id);
      });
    }

    if (features.ariaInvalid) {
      it('threads error through to aria-invalid', () => {
        const { container } = renderWith({ error: 'Oops' } as Partial<P>);
        const ctrl = getControl(container);
        expect(ctrl.getAttribute('aria-invalid')).toBe('true');
      });
    }

    if (features.disabled) {
      it('reflects disabled to the control', () => {
        const { container } = renderWith({ disabled: true } as Partial<P>);
        const ctrl = getControl(container);
        const ariaDisabled = ctrl.getAttribute('aria-disabled') === 'true';
        const propDisabled = (ctrl as HTMLInputElement).disabled === true;
        expect(ariaDisabled || propDisabled).toBe(true);
      });
    }

    if (features.readOnly) {
      it('reflects readOnly to the control', () => {
        const { container } = renderWith({ readOnly: true } as Partial<P>);
        const ctrl = getControl(container);
        const readOnly = (ctrl as HTMLInputElement).readOnly === true || ctrl.getAttribute('aria-readonly') === 'true' || ctrl.hasAttribute('readonly');
        expect(readOnly).toBe(true);
      });
    }

    if (features.typing) {
      if (!typeValue) throw new Error(`runControlContract(${name}): typing enabled but no typeValue adapter`);
      if (!sampleValue) throw new Error(`runControlContract(${name}): typing enabled but no sampleValue`);

      it('calls onChange with the raw value on user input', async () => {
        const user = userEvent.setup();
        const onChange = jest.fn();
        const { container } = renderWith({ onChange } as Partial<P>);
        await typeValue(user, getControl(container), sampleValue);
        expect(onChange).toHaveBeenCalled();
        const lastArg = onChange.mock.calls[onChange.mock.calls.length - 1][0];
        expect(typeof lastArg).not.toBe('object');
      });

      if (features.controlled) {
        it('is controlled by the value prop', () => {
          const { rerender, container } = render(<Component {...(baseProps as P)} value={sampleValue} />);
          if (readValue) expect(readValue(getControl(container))).toBe(sampleValue);
          act(() => {
            rerender(<Component {...(baseProps as P)} value={`${sampleValue}!`} />);
          });
          if (readValue) expect(readValue(getControl(container))).toBe(`${sampleValue}!`);
        });
      }
    }
  });
}
