import type { DynamicFormFixture } from './DynamicForm.factories';
import { SHOWCASE_MEMBERS, SHOWCASE_PROJECTS, SHOWCASE_TASKS } from '../../../showcase/entities';
import { selectOptions } from '../../../helpers/optionMappers';
import {
  TIMESHEET_HEADER,
  timesheetScenarioInitial,
  timesheetScenarioZod,
  type TimesheetScenarioFormData,
} from '../../Form/timesheetScenario.factories';

export type { TimesheetScenarioFormData };

export interface TimesheetScenarioDerived {
  durationLabel: string;
  dateLabel: string;
  statusLabel: string;
  [key: string]: string;
}

const PROJECT_OPTIONS = selectOptions(SHOWCASE_PROJECTS, { value: 'id', label: (p) => `${p.icon} ${p.name}`, description: 'organization', color: 'color' });
const MEMBER_OPTIONS = selectOptions(SHOWCASE_MEMBERS, { value: 'id', label: 'name', group: 'group', color: 'color', initials: 'initials' });
const TASK_OPTIONS = selectOptions(SHOWCASE_TASKS, { value: 'id', label: 'name' });

const deriveTimesheet = (_formData: Readonly<Partial<TimesheetScenarioFormData>>): TimesheetScenarioDerived => ({
  durationLabel: TIMESHEET_HEADER.durationLabel,
  dateLabel: TIMESHEET_HEADER.dateLabel,
  statusLabel: TIMESHEET_HEADER.statusLabel,
});

export const timesheetScenarioFixture = (): DynamicFormFixture<TimesheetScenarioFormData, TimesheetScenarioDerived> => ({
  schema: {
    type: 'object',
    required: ['date'],
    properties: {
      header: { type: 'string', title: '', readOnly: true },
      seconds: { type: 'number', title: 'Seconds' },
      date: { type: 'string', title: 'Date', format: 'date' },
      clientOrganizationId: { type: 'string', title: 'Project' },
      ownerId: { type: 'string', title: 'Member' },
      taskUuid: { type: 'string', title: 'Task' },
      notes: { type: 'string', title: 'Notes' },
      companyTagIds: { type: 'array', title: 'Tags', items: { type: 'string' } },
      nonBillable: { type: 'boolean', title: 'Non-billable' },
      rate: { type: 'number', title: 'Billable Rate' },
      /* Hidden API parity */
      startTime: { type: 'string', title: 'Start Time' },
      endTime: { type: 'string', title: 'End Time' },
      projectTitle: { type: 'string', title: 'Project Title' },
      clientOrganizationType: { type: 'string', title: 'Client Organization Type' },
      projectPublicUrlToken: { type: 'string', title: 'Project Public URL Token' },
      timetrackerEntry: { type: 'boolean', title: 'Timetracker Entry' },
      timesheetId: { type: 'string', title: 'Timesheet Id' },
      meetingId: { type: 'string', title: 'Meeting Id' },
    },
  },
  uiSchema: {
    'ui:rows': [
      [{ value: 'header', span: 2 }],
      ['clientOrganizationId', 'ownerId'],
      [{ value: 'taskUuid', span: 2 }],
      [{ value: 'notes', span: 2 }],
      [{ value: 'companyTagIds', span: 2 }],
      ['nonBillable', 'rate'],
    ],
    header: { 'ui:field': 'staticPanel', 'ui:options': { panelKey: 'durationLabel', lines: ['dateLabel', 'statusLabel'] } },
    seconds: { 'ui:widget': 'hidden' },
    date: { 'ui:widget': 'hidden' },
    clientOrganizationId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'projects', placeholder: 'Add project' } },
    ownerId: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'members', placeholder: 'Select…' } },
    taskUuid: { 'ui:widget': 'combobox', 'ui:options': { optionSetKey: 'tasks', placeholder: 'Select a task or type a new one', labelActionKey: 'viewTask' } },
    notes: { 'ui:widget': 'textarea', 'ui:placeholder': 'What are you working on?' },
    companyTagIds: { 'ui:widget': 'tags', 'ui:placeholder': 'Add tags' },
    nonBillable: { 'ui:widget': 'switch' },
    rate: { 'ui:widget': 'currency' },
    /* Hidden API parity */
    startTime: { 'ui:widget': 'hidden' },
    endTime: { 'ui:widget': 'hidden' },
    projectTitle: { 'ui:widget': 'hidden' },
    clientOrganizationType: { 'ui:widget': 'hidden' },
    projectPublicUrlToken: { 'ui:widget': 'hidden' },
    timetrackerEntry: { 'ui:widget': 'hidden' },
    timesheetId: { 'ui:widget': 'hidden' },
    meetingId: { 'ui:widget': 'hidden' },
  },
  zodSchema: timesheetScenarioZod,
  defaults: { ...timesheetScenarioInitial },
  derive: deriveTimesheet,
  formContext: {
    optionSets: { projects: PROJECT_OPTIONS, members: MEMBER_OPTIONS, tasks: TASK_OPTIONS },
    actions: { viewTask: { label: 'View Task', href: '/tasks/resourcing-evaluation', actionId: 'viewTask' } },
    locale: 'en-GB',
  },
});
