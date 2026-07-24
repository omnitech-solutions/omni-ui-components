import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '@oc-tech/omni-ui-components/Table';
import type { TableColumn } from '@oc-tech/omni-ui-components/Table';
import { ShowcaseShell } from './ShowcaseShell';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Editor' | 'Viewer';
  billable: boolean;
  hourlyRate: number;
  status: 'Active' | 'Invited' | 'Deactivated';
}

const roster: TeamMember[] = [
  { id: 'u-1', name: 'Amelia Reyes', email: 'amelia@omni.example', role: 'Owner', billable: true, hourlyRate: 165, status: 'Active' },
  { id: 'u-2', name: 'Bao Nguyen', email: 'bao@omni.example', role: 'Editor', billable: true, hourlyRate: 120, status: 'Active' },
  { id: 'u-3', name: 'Corey Hicks', email: 'corey@omni.example', role: 'Editor', billable: false, hourlyRate: 0, status: 'Invited' },
  { id: 'u-4', name: 'Devi Ramanathan', email: 'devi@omni.example', role: 'Viewer', billable: false, hourlyRate: 0, status: 'Deactivated' },
  { id: 'u-5', name: 'Emil Larsson', email: 'emil@omni.example', role: 'Editor', billable: true, hourlyRate: 95, status: 'Active' },
];

const rosterColumns: TableColumn<TeamMember>[] = [
  { key: 'name', dataIndex: 'name', title: 'Member', sorter: (a, b) => a.name.localeCompare(b.name) },
  { key: 'email', dataIndex: 'email', title: 'Email' },
  {
    key: 'role',
    dataIndex: 'role',
    title: 'Role',
    filters: [
      { text: 'Owner', value: 'Owner' },
      { text: 'Editor', value: 'Editor' },
      { text: 'Viewer', value: 'Viewer' },
    ],
    onFilter: (value, record) => record.role === value,
  },
  { key: 'billable', dataIndex: 'billable', title: 'Billable', render: (v: boolean) => (v ? 'Yes' : 'No') },
  {
    key: 'hourlyRate',
    dataIndex: 'hourlyRate',
    title: 'Rate',
    align: 'right',
    render: (v: number) => (v ? `$${v.toFixed(2)}/hr` : '—'),
  },
  {
    key: 'status',
    dataIndex: 'status',
    title: 'Status',
    filters: [
      { text: 'Active', value: 'Active' },
      { text: 'Invited', value: 'Invited' },
      { text: 'Deactivated', value: 'Deactivated' },
    ],
    onFilter: (value, record) => record.status === value,
  },
];

const meta: Meta = {
  title: 'omni-ui-components/Table/Showcase/Team roster',
  parameters: { layout: 'fullscreen' },
};
export default meta;

const CODE = `interface TeamMember { id: string; name: string; email: string; role: 'Owner' | 'Editor' | 'Viewer'; billable: boolean; hourlyRate: number; status: 'Active' | 'Invited' | 'Deactivated'; }

const rosterColumns: TableColumn<TeamMember>[] = [
  { key: 'name', dataIndex: 'name', title: 'Member', sorter: (a, b) => a.name.localeCompare(b.name) },
  { key: 'email', dataIndex: 'email', title: 'Email' },
  { key: 'role', dataIndex: 'role', title: 'Role', filters: [...], onFilter: (v, r) => r.role === v },
  { key: 'billable', dataIndex: 'billable', title: 'Billable', render: (v) => (v ? 'Yes' : 'No') },
  { key: 'hourlyRate', dataIndex: 'hourlyRate', title: 'Rate', align: 'right', render: (v) => v ? \`$\${v.toFixed(2)}/hr\` : '—' },
  { key: 'status', dataIndex: 'status', title: 'Status', filters: [...], onFilter: (v, r) => r.status === v },
];

<Table<TeamMember>
  columns={rosterColumns}
  dataSource={roster}
  rowKey="id"
  rowSelection={{ selections: true }}
  pagination={{ defaultPageSize: 10, placement: 'bottomEnd' }}
  testIdPrefix="showcase-team-roster"
/>`;

export const Default: StoryObj = {
  render: () => (
    <ShowcaseShell
      title="Team roster"
      scenario="A settings page's team roster with mixed states (Active / Invited / Deactivated), billable flag, right-aligned money column, sortable name, and filterable role + status columns. Realistic data shape for a Company > Team view."
      code={CODE}
    >
      <Table<TeamMember>
        columns={rosterColumns}
        dataSource={roster}
        rowKey="id"
        rowSelection={{ selections: true }}
        pagination={{ defaultPageSize: 10, placement: ['bottomEnd'] }}
        testIdPrefix="showcase-team-roster"
      />
    </ShowcaseShell>
  ),
};
