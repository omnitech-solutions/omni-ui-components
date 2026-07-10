import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DynamicForm } from 'dynamic-form';
import { buildFormContext } from 'dynamic-form/lib/formContext';
import { timesheetScenarioFixture, type TimesheetScenarioFormData } from 'factories/dynamic-form/DynamicForm/timesheetScenario.factories';

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

function Harness({ onSubmit }: { onSubmit?: (data: TimesheetScenarioFormData) => void }) {
  const fixture = timesheetScenarioFixture();
  const [formData, setFormData] = React.useState<TimesheetScenarioFormData>(fixture.defaults);
  return (
    <DynamicForm
      schema={fixture.schema}
      uiSchema={fixture.uiSchema}
      zodSchema={fixture.zodSchema}
      formData={formData}
      formContext={buildFormContext(fixture.formContext, fixture.derive(formData))}
      onChange={(next) => setFormData(next as TimesheetScenarioFormData)}
      onSubmit={onSubmit ?? jest.fn()}
    >
      <button type="submit" data-testid="submit-btn">
        Add Time
      </button>
    </DynamicForm>
  );
}

describe('NewTimesheet scenario', () => {
  it('renders the timer header through StaticPanelField (no input)', () => {
    render(<Harness />);
    expect(screen.getByTestId('root_header-panel-durationLabel')).toHaveTextContent('00h 00m 00s');
    expect(screen.getByTestId('root_header-panel-dateLabel')).toHaveTextContent('Mon, Jun 29, 2026');
    expect(screen.getByTestId('root_header-panel-statusLabel')).toHaveTextContent('Unbilled');
  });

  it('renders the form fields below the header', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: /^Project$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Member$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Task$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/)).toBeInTheDocument();
  });

  it('hides API parity fields (timetracker_entry, project_public_url_token, etc.)', () => {
    render(<Harness />);
    expect(screen.queryByLabelText(/Project Public URL/)).toBeNull();
    expect(screen.queryByLabelText(/Timesheet Id/)).toBeNull();
    expect(screen.queryByLabelText(/Meeting Id/)).toBeNull();
    expect(screen.queryByLabelText(/Timetracker Entry/)).toBeNull();
  });

  it('groups Member options into PROJECT TEAM and TEAM MEMBERS sections', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /^Member$/ }));
    expect(screen.getByTestId('root_ownerId-group-PROJECT TEAM')).toBeInTheDocument();
    expect(screen.getByTestId('root_ownerId-group-TEAM MEMBERS')).toBeInTheDocument();
  });

  it('renders the View Task label action next to the Task field', () => {
    render(<Harness />);
    const action = screen.getByTestId('root_taskUuid-label-action');
    expect(action.tagName).toBe('A');
    expect(action).toHaveTextContent('View Task');
    expect(action).toHaveAttribute('href', '/tasks/resourcing-evaluation');
  });

  it('renders Project options with description and color dot', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: /^Project$/ }));
    const opt = screen.getByTestId('root_clientOrganizationId-option-bugs-w27');
    expect(opt).toHaveTextContent('Bugs - Week 27');
    expect(opt).toHaveTextContent('Omni Product Development');
    expect(opt.querySelector('span[style*="background-color"]')).not.toBeNull();
  });

  it('submits the canonical payload without derived header text', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);

    await user.click(screen.getByTestId('submit-btn'));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty('durationLabel');
    expect(payload).not.toHaveProperty('dateLabel');
    expect(payload).not.toHaveProperty('statusLabel');
    /* API parity defaults flow through the submit payload */
    expect(payload.clientOrganizationType).toBe('Connection');
    expect(payload.timetrackerEntry).toBe(false);
    expect(payload).toHaveProperty('projectPublicUrlToken');
  });
});
