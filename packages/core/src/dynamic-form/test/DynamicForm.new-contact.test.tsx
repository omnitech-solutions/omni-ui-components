import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';
import { contactScenarioFixture, NEW_COMPANY_OPTION, type ContactScenarioFormData } from 'factories/dynamic-form/DynamicForm/contactScenario.factories';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function Harness({ onSubmit, onError }: { onSubmit: (data: ContactScenarioFormData) => void; onError?: (errs: unknown) => void }) {
  const fixture = contactScenarioFixture();
  const [formData, setFormData] = React.useState<ContactScenarioFormData>(fixture.defaults);
  return (
    <DynamicForm
      schema={fixture.schema}
      uiSchema={fixture.uiSchema}
      zodSchema={fixture.zodSchema}
      formData={formData}
      formContext={buildFormContext(fixture.formContext, fixture.derive(formData))}
      onChange={(next) => setFormData(next as ContactScenarioFormData)}
      onSubmit={onSubmit}
      onError={onError}
    >
      <button type="submit" data-testid="submit-btn">
        Create Contact
      </button>
    </DynamicForm>
  );
}

describe('NewContact scenario', () => {
  it('renders the core form fields', () => {
    render(<Harness onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/^Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Phone/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Company$/ })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Job Title/)).toBeInTheDocument();
  });

  it('lists the "+ New Company" sentinel option in the company picker', async () => {
    const user = userEvent.setup();
    render(<Harness onSubmit={jest.fn()} />);
    await user.click(screen.getByRole('button', { name: /^Company$/ }));
    expect(screen.getByTestId(`root_connectionId-option-${NEW_COMPANY_OPTION}`)).toHaveTextContent('+ New Company');
  });

  it('submits the canonical API payload when an existing company is picked', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^Name/), 'Ada Lovelace');
    await user.type(screen.getByLabelText(/^Email/), 'ada@example.com');
    await user.click(screen.getByRole('button', { name: /^Company$/ }));
    await user.click(screen.getByTestId('root_connectionId-option-northstar'));
    await user.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Ada Lovelace');
    expect(payload.email).toBe('ada@example.com');
    expect(payload.connectionId).toBe('northstar');
    // Hidden API fields carry through with empty defaults
    expect(payload).toHaveProperty('notes');
    expect(payload).toHaveProperty('avatarUrl');
  });

  it('errors when Email is missing the @-symbol', async () => {
    const onError = jest.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={jest.fn()} onError={onError} />);

    await user.type(screen.getByLabelText(/^Name/), 'Ada');
    await user.type(screen.getByLabelText(/^Email/), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /^Company$/ }));
    await user.click(screen.getByTestId('root_connectionId-option-northstar'));
    await user.click(screen.getByTestId('submit-btn'));

    expect(onError).toHaveBeenCalled();
  });
});
