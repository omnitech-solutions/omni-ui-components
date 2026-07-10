import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';
import { companyScenarioFixture, NEW_CONTACT_OPTION, type CompanyScenarioFormData } from 'factories/dynamic-form/DynamicForm/companyScenario.factories';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function Harness({ onSubmit, onError }: { onSubmit: (data: CompanyScenarioFormData) => void; onError?: (errs: unknown) => void }) {
  const fixture = companyScenarioFixture();
  const [formData, setFormData] = React.useState<CompanyScenarioFormData>(fixture.defaults);
  return (
    <DynamicForm
      schema={fixture.schema}
      uiSchema={fixture.uiSchema}
      zodSchema={fixture.zodSchema}
      formData={formData}
      formContext={buildFormContext(fixture.formContext, fixture.derive(formData))}
      onChange={(next) => setFormData(next as CompanyScenarioFormData)}
      onSubmit={onSubmit}
      onError={onError}
    >
      <button type="submit" data-testid="submit-btn">
        Add Company
      </button>
    </DynamicForm>
  );
}

describe('NewCompany scenario', () => {
  it('renders the core form fields including the contact combobox', () => {
    render(<Harness onSubmit={jest.fn()} />);
    expect(screen.getByLabelText(/^Company Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Domain/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Primary Contact/ })).toBeInTheDocument();
  });

  it('lists the "+ New Contact" sentinel option in the contact picker', async () => {
    const user = userEvent.setup();
    render(<Harness onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /Primary Contact/ }));
    expect(screen.getByTestId(`root_primaryContactId-option-${NEW_CONTACT_OPTION}`)).toHaveTextContent('+ New Contact');
  });

  it('submits when only Company Name is set and primaryContact is left blank', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^Company Name/), 'Acme Inc.');
    await user.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].name).toBe('Acme Inc.');
  });

  it('errors when "+ New Contact" is picked but contact fields are blank', async () => {
    const onError = jest.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={jest.fn()} onError={onError} />);

    await user.type(screen.getByLabelText(/^Company Name/), 'Acme Inc.');
    await user.click(screen.getByRole('button', { name: /Primary Contact/ }));
    await user.click(screen.getByTestId(`root_primaryContactId-option-${NEW_CONTACT_OPTION}`));
    await user.click(screen.getByTestId('submit-btn'));

    expect(onError).toHaveBeenCalled();
  });
});
