import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Form, FormActions, FormField, FormRow } from '@oc-tech/omni-ui-components';
import type { FormFixture } from '@oc-tech/omni-ui-components/Form/Form.types';
import { addressFormFactory, contactFormFactory, type AddressFormData } from 'factories/omni-ui-components/Form/Form.factories';
import { FormDemo } from 'storybook-helpers/FormDemo';
import { FormStoryShell } from 'storybook-helpers/FormStoryShell';

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const setupContact = (overrides: Partial<React.ComponentProps<typeof Form>> = {}) => {
  const onSubmit = jest.fn();
  const onError = jest.fn();
  const onChange = jest.fn();
  const fixture = contactFormFactory();
  const user = userEvent.setup();
  render(
    <Form zodSchema={fixture.schema as any} formData={fixture.initial} onSubmit={onSubmit} onError={onError} onChange={onChange} {...overrides}>
      <FormField name="name">
        {({ id, value, onChange: oc, error }) => (
          <>
            <input data-testid="name" id={id} value={(value as string) ?? ''} onChange={(e) => oc(e.target.value)} />
            {error ? <span data-testid="name-error">{error}</span> : null}
          </>
        )}
      </FormField>
      <FormField name="email">
        {({ id, value, onChange: oc, error }) => (
          <>
            <input data-testid="email" id={id} value={(value as string) ?? ''} onChange={(e) => oc(e.target.value)} />
            {error ? <span data-testid="email-error">{error}</span> : null}
          </>
        )}
      </FormField>
      <button type="submit">Save</button>
    </Form>,
  );
  return { onSubmit, onError, onChange, user };
};

/* -------------------------------------------------------------------------- */
/* Form — submit contract                                                      */
/* -------------------------------------------------------------------------- */

describe('Form — submit contract', () => {
  it('forwards onChange with new formData as user types', async () => {
    const { onChange, user } = setupContact();
    await user.type(screen.getByTestId('name'), 'Ada');
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ name: 'Ada' }));
  });

  it('blocks onSubmit and surfaces Zod errors when invalid', async () => {
    const { onSubmit, onError, user } = setupContact();
    await user.click(screen.getByText('Save'));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: ['name'], source: 'zod' }), expect.objectContaining({ path: ['email'], source: 'zod' })]),
    );
    expect(screen.getByTestId('name-error')).toHaveTextContent('Name is required');
  });

  it('clears a field error once that field is edited', async () => {
    const { user } = setupContact();
    await user.click(screen.getByText('Save'));
    expect(screen.getByTestId('name-error')).toBeInTheDocument();
    await user.type(screen.getByTestId('name'), 'A');
    await waitFor(() => expect(screen.queryByTestId('name-error')).not.toBeInTheDocument());
  });

  it('calls onSubmit with the parsed value when valid', async () => {
    const { onSubmit, onError, user } = setupContact();
    await user.type(screen.getByTestId('name'), 'Ada');
    await user.type(screen.getByTestId('email'), 'ada@example.com');
    await user.click(screen.getByText('Save'));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada', email: 'ada@example.com' });
    expect(onError).not.toHaveBeenCalled();
  });

  it('routes an onSubmit rejection through onError as source: api', async () => {
    const onSubmit = jest.fn(() => Promise.reject(new Error('network down')));
    const onError = jest.fn();
    const { user } = setupContact({ onSubmit, onError });
    await user.type(screen.getByTestId('name'), 'Ada');
    await user.type(screen.getByTestId('email'), 'ada@example.com');
    await user.click(screen.getByText('Save'));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onError).toHaveBeenCalledWith([{ path: [], message: 'network down', source: 'api' }]);
  });

  it('routes a non-Error throw through onError using String(err) as message', async () => {
    const onSubmit = jest.fn(() => Promise.reject('boom'));
    const onError = jest.fn();
    const { user } = setupContact({ onSubmit, onError });
    await user.type(screen.getByTestId('name'), 'Ada');
    await user.type(screen.getByTestId('email'), 'ada@example.com');
    await user.click(screen.getByText('Save'));
    await waitFor(() => expect(onError).toHaveBeenCalledWith([{ path: [], message: 'boom', source: 'api' }]));
  });

  it('does NOT submit while disabled', async () => {
    const onSubmit = jest.fn();
    const { user } = setupContact({ onSubmit, disabled: true });
    await user.type(screen.getByTestId('name'), 'Ada');
    await user.type(screen.getByTestId('email'), 'ada@example.com');
    await user.click(screen.getByText('Save'));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does NOT submit while readOnly', async () => {
    const onSubmit = jest.fn();
    const { user } = setupContact({ onSubmit, readOnly: true });
    await user.type(screen.getByTestId('name'), 'Ada');
    await user.type(screen.getByTestId('email'), 'ada@example.com');
    await user.click(screen.getByText('Save'));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/* FormField — render-prop contract                                            */
/* -------------------------------------------------------------------------- */

describe('FormField', () => {
  it('propagates disabled and readOnly from Form context', () => {
    const fixture = contactFormFactory();
    const seen: { disabled: boolean; readOnly: boolean }[] = [];
    render(
      <Form zodSchema={fixture.schema as any} formData={fixture.initial} onSubmit={() => undefined} disabled readOnly>
        <FormField name="name">
          {({ disabled, readOnly }) => {
            seen.push({ disabled, readOnly });
            return <input data-testid="name" />;
          }}
        </FormField>
      </Form>,
    );
    expect(seen.at(-1)).toEqual({ disabled: true, readOnly: true });
  });

  it('exposes `required` to the render fn', () => {
    const fixture = contactFormFactory();
    let captured: { required: boolean } | null = null;
    render(
      <Form zodSchema={fixture.schema as any} formData={fixture.initial} onSubmit={() => undefined}>
        <FormField name="name" required>
          {(p) => {
            captured = { required: p.required };
            return <input />;
          }}
        </FormField>
      </Form>,
    );
    expect(captured).toEqual({ required: true });
  });

  it('throws when used outside <Form>', () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(<FormField name="x">{() => <input />}</FormField>)).toThrow(/FormField must be rendered inside <Form>/);
    err.mockRestore();
  });
});

/* -------------------------------------------------------------------------- */
/* FormRow / FormActions — layout primitives                                   */
/* -------------------------------------------------------------------------- */

describe('FormRow', () => {
  it('renders 2 columns by default', () => {
    const { container } = render(
      <FormRow>
        <span data-testid="a">a</span>
        <span>b</span>
      </FormRow>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(2/);
  });

  it('pads trailing empty cells when child count < cols', () => {
    const { container } = render(
      <FormRow cols={2}>
        <span>a</span>
      </FormRow>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.children.length).toBe(2);
    expect(grid.children[1].getAttribute('aria-hidden')).toBe('true');
  });

  it('does NOT pad when row is already full', () => {
    const { container } = render(
      <FormRow cols={2}>
        <span>a</span>
        <span>b</span>
      </FormRow>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.children.length).toBe(2);
    expect(grid.querySelector('[aria-hidden="true"]')).toBeNull();
  });

  it('honors cols=3 (3 col grid)', () => {
    const { container } = render(
      <FormRow cols={3}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </FormRow>,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.style.gridTemplateColumns).toMatch(/repeat\(3/);
  });
});

describe('FormActions', () => {
  it('renders the divider by default', () => {
    const { container } = render(
      <FormActions>
        <button>Save</button>
      </FormActions>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/border-t/);
  });

  it('drops the divider when divider=false', () => {
    const { container } = render(
      <FormActions divider={false}>
        <button>Save</button>
      </FormActions>,
    );
    expect((container.firstChild as HTMLElement).className).not.toMatch(/border-t/);
  });

  it('aligns according to `align`', () => {
    const { rerender, container } = render(
      <FormActions align="start">
        <button>x</button>
      </FormActions>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/justify-start/);
    rerender(
      <FormActions align="between">
        <button>x</button>
      </FormActions>,
    );
    expect((container.firstChild as HTMLElement).className).toMatch(/justify-between/);
  });
});

/* -------------------------------------------------------------------------- */
/* End-to-end via FormDemo + fixtures                                          */
/* -------------------------------------------------------------------------- */

describe('FormDemo — end-to-end', () => {
  const setupAddressDemo = (props: Partial<React.ComponentProps<typeof FormDemo>> = {}) => {
    const user = userEvent.setup();
    const fixture = addressFormFactory();
    const onSubmit = jest.fn();
    const onError = jest.fn();
    render(<FormDemo fixture={fixture} onSubmit={onSubmit} onError={onError} {...props} />);
    return { user, fixture, onSubmit, onError };
  };

  it('renders all 7 fields with correct labels in 4 rows', () => {
    setupAddressDemo();
    ['Label', 'Address 1', 'Address 2', 'City', 'Postal Code', 'Country', 'Region / State'].forEach((label) =>
      expect(screen.getByLabelText(new RegExp(label))).toBeInTheDocument(),
    );
  });

  it('shows required asterisks only on required fields', () => {
    setupAddressDemo();
    const required = ['Label', 'Address 1', 'City', 'Postal Code', 'Country'];
    const optional = ['Address 2', 'Region / State'];
    required.forEach((label) => {
      const input = screen.getByLabelText(new RegExp(label));
      expect(input).toHaveAttribute('aria-required', 'true');
    });
    optional.forEach((label) => {
      const input = screen.getByLabelText(new RegExp(label));
      expect(input).not.toHaveAttribute('aria-required');
    });
  });

  it('submits the parsed payload when all required fields are filled', async () => {
    const { user, onSubmit } = setupAddressDemo();
    await user.type(screen.getByLabelText(/^Label/), 'HQ');
    await user.type(screen.getByLabelText(/^Address 1/), '123 Main St');
    await user.type(screen.getByLabelText(/^City/), 'SF');
    await user.type(screen.getByLabelText(/^Postal Code/), '94105');
    await user.type(screen.getByLabelText(/^Country/), 'US');
    await user.click(screen.getByRole('button', { name: /Save Address/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ label: 'HQ', address1: '123 Main St', city: 'SF', postal_code: '94105', country: 'US' }));
  });

  it('emits FormError[] with one entry per failed required field on empty submit', async () => {
    const { user, onSubmit, onError } = setupAddressDemo();
    await user.click(screen.getByRole('button', { name: /Save Address/i }));
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(onError).toHaveBeenCalled());
    const errors = onError.mock.calls[0][0];
    const paths = errors.map((e: any) => e.path.join('.'));
    expect(paths).toEqual(expect.arrayContaining(['label', 'address1', 'city', 'postal_code', 'country']));
  });

  it('passes a custom submit label via fixture override', () => {
    const fixture: FormFixture<AddressFormData> = {
      ...addressFormFactory(),
      submitLabel: 'Ship It',
    };
    render(<FormDemo fixture={fixture} />);
    expect(screen.getByRole('button', { name: 'Ship It' })).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- */
/* FormStoryShell — submitted / errors panels                                  */
/* -------------------------------------------------------------------------- */

describe('FormStoryShell', () => {
  it('renders the submitted panel after a successful submit', async () => {
    const fixture = addressFormFactory();
    const user = userEvent.setup();
    render(<FormStoryShell fixture={fixture} />);
    await user.type(screen.getByLabelText(/^Label/), 'HQ');
    await user.type(screen.getByLabelText(/^Address 1/), '123 Main St');
    await user.type(screen.getByLabelText(/^City/), 'SF');
    await user.type(screen.getByLabelText(/^Postal Code/), '94105');
    await user.type(screen.getByLabelText(/^Country/), 'US');
    await user.click(screen.getByRole('button', { name: /Save Address/i }));
    await waitFor(() => expect(screen.getByTestId('submitted')).toBeInTheDocument());
    expect(screen.queryByTestId('errors')).not.toBeInTheDocument();
  });

  it('renders the errors panel after a blocked submit', async () => {
    const fixture = addressFormFactory();
    const user = userEvent.setup();
    render(<FormStoryShell fixture={fixture} />);
    await user.click(screen.getByRole('button', { name: /Save Address/i }));
    await waitFor(() => expect(screen.getByTestId('errors')).toBeInTheDocument());
    expect(screen.queryByTestId('submitted')).not.toBeInTheDocument();
  });

  it('hides the submitted panel when showSubmitted=false', async () => {
    const fixture = addressFormFactory();
    const user = userEvent.setup();
    render(<FormStoryShell fixture={fixture} showSubmitted={false} />);
    await user.type(screen.getByLabelText(/^Label/), 'HQ');
    await user.type(screen.getByLabelText(/^Address 1/), '123 Main St');
    await user.type(screen.getByLabelText(/^City/), 'SF');
    await user.type(screen.getByLabelText(/^Postal Code/), '94105');
    await user.type(screen.getByLabelText(/^Country/), 'US');
    await user.click(screen.getByRole('button', { name: /Save Address/i }));
    await waitFor(() => expect(screen.queryByTestId('submitted')).not.toBeInTheDocument());
  });
});
