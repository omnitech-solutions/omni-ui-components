import { z } from 'zod';

import type { FormFixture } from '@oc-tech/omni-ui-components/Form/Form.types';
import { SHOWCASE_MEMBERS, SHOWCASE_PROJECTS, SHOWCASE_TASKS } from '../../showcase/entities';

/**
 * New Timesheet scenario — canonical source for both Form and RJSF.
 *
 * Mirrors POST /api/v1/time_entries time_entries params:
 *   { seconds, date, notes, task_uuid, start_time, end_time,
 *     project_title, client_organization_id, client_organization_type,
 *     project_public_url_token, owner_id, timetracker_entry,
 *     timesheet_id, company_tag_ids, meeting_id, rate, non_billable }
 *
 * Visible fields match the modal screenshots. Hidden fields are
 * carried through `initial` + Zod + (RJSF) `ui:widget: 'hidden'`.
 */
export interface TimesheetScenarioFormData {
  /* Visible */
  seconds: number;
  date: string;
  clientOrganizationId: string;
  ownerId: string;
  taskUuid: string;
  notes: string;
  companyTagIds: string[];
  nonBillable: boolean;
  rate: number;
  /* Hidden API parity */
  startTime: string;
  endTime: string;
  projectTitle: string;
  clientOrganizationType: string;
  projectPublicUrlToken: string;
  timetrackerEntry: boolean;
  timesheetId: string;
  meetingId: string;
}

export interface TimesheetHeader {
  durationLabel: string;
  dateLabel: string;
  statusLabel: string;
}

export const TIMESHEET_HEADER: TimesheetHeader = {
  durationLabel: '00h 00m 00s',
  dateLabel: 'Mon, Jun 29, 2026',
  statusLabel: 'Unbilled',
};

export const timesheetScenarioInitial: TimesheetScenarioFormData = {
  seconds: 0,
  date: '2026-06-29',
  clientOrganizationId: '',
  ownerId: '',
  taskUuid: '',
  notes: '',
  companyTagIds: [],
  nonBillable: false,
  rate: 0,
  startTime: '',
  endTime: '',
  projectTitle: '',
  clientOrganizationType: 'Connection',
  projectPublicUrlToken: '',
  timetrackerEntry: false,
  timesheetId: '',
  meetingId: '',
};

export const timesheetScenarioZod = z.object({
  seconds: z.number().min(0),
  date: z.string().min(1, 'Date is required'),
  clientOrganizationId: z.string().optional().default(''),
  ownerId: z.string().optional().default(''),
  taskUuid: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  companyTagIds: z.array(z.string()).optional().default([]),
  nonBillable: z.boolean(),
  rate: z.number().min(0),
  startTime: z.string().optional().default(''),
  endTime: z.string().optional().default(''),
  projectTitle: z.string().optional().default(''),
  clientOrganizationType: z.string().optional().default('Connection'),
  projectPublicUrlToken: z.string().optional().default(''),
  timetrackerEntry: z.boolean().optional().default(false),
  timesheetId: z.string().optional().default(''),
  meetingId: z.string().optional().default(''),
}) as unknown as z.ZodType<TimesheetScenarioFormData>;

export const timesheetProjectOptions = () => SHOWCASE_PROJECTS.map((p) => ({ value: p.id, label: `${p.icon} ${p.name}` }));
export const timesheetMemberOptions = () => SHOWCASE_MEMBERS.map((m) => ({ value: m.id, label: m.name }));
export const timesheetTaskOptions = () => SHOWCASE_TASKS.map((t) => ({ value: t.id, label: t.name }));

export const timesheetScenarioFormFactory = (overrides: Partial<TimesheetScenarioFormData> = {}): FormFixture<TimesheetScenarioFormData> => ({
  title: 'Add Time',
  maxWidth: 'max-w-2xl',
  schema: timesheetScenarioZod,
  initial: { ...timesheetScenarioInitial, ...overrides },
  rows: [
    { kind: 'heading', title: TIMESHEET_HEADER.durationLabel, description: `${TIMESHEET_HEADER.dateLabel} · ${TIMESHEET_HEADER.statusLabel}` },
    [
      { name: 'clientOrganizationId', label: 'Project', type: 'select', placeholder: 'Add project', options: timesheetProjectOptions() },
      { name: 'ownerId', label: 'Member', type: 'select', placeholder: 'Select…', options: timesheetMemberOptions() },
    ],
    [{ name: 'taskUuid', label: 'Task', type: 'select', placeholder: 'Select a task or type a new one', options: timesheetTaskOptions() }],
    [{ name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'What are you working on?' }],
    [{ name: 'companyTagIds', label: 'Tags', type: 'tags', placeholder: 'Add tags' }],
    [
      { name: 'nonBillable', label: 'Non-billable', type: 'checkbox' },
      { name: 'rate', label: 'Billable Rate', type: 'currency' },
    ],
    /* startTime, endTime, projectTitle, clientOrganizationType,
     * projectPublicUrlToken, timetrackerEntry, timesheetId, meetingId
     * are accepted by the API but not rendered as Form rows. */
  ],
});
