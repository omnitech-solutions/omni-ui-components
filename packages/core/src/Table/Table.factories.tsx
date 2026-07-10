import * as React from 'react';
import { ArrowDownUp, ImageIcon, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import { getDefaultTableRegistry, mergeTableRegistry, type TableCellOverride, type TableColumn, type TableDataRow, type TableProps } from './index';

export interface ProjectRecord {
  id: string;
  name: string;
  client: string;
  status: 'Discovery' | 'Design' | 'Build' | 'Sent' | 'Paid';
  phase: 'Phase 1' | 'Phase 2' | 'Phase 3';
  owner: string;
  budget: number;
  margin: number;
  dueDate: string;
  description?: string;
  disabled?: boolean;
  children?: ProjectRecord[];
}

export interface DocCellData {
  id: string;
  text?: string;
  src?: string;
  alt?: string;
  items?: string[];
  level?: 1 | 2 | 3;
}

export interface InvoiceLineRecord {
  id: string;
  item: string;
  detail: string;
  quantity: number;
  amount: number;
}

export const invoiceLines: InvoiceLineRecord[] = [
  { id: 'line-1', item: 'Discovery phase', detail: 'Kickoff + research', quantity: 1, amount: 3800 },
  { id: 'line-2', item: 'Identity system', detail: 'Logo, type, palette', quantity: 1, amount: 8200 },
  { id: 'line-3', item: 'Packaging suite', detail: 'Primary SKU art', quantity: 1, amount: 5400 },
  { id: 'line-4', item: 'Project management', detail: '10% flat', quantity: 1, amount: 1000 },
];

export const invoiceColumns: TableColumn<InvoiceLineRecord>[] = [
  {
    key: 'item',
    title: 'Item',
    dataIndex: 'item',
    render: (value, record) => (
      <span className="inline-flex min-w-0 flex-col gap-1">
        <span className="font-medium">{String(value)}</span>
        <span className="text-sm text-muted-foreground">{record.detail}</span>
      </span>
    ),
  },
  { key: 'quantity', title: 'Qty', dataIndex: 'quantity', valueType: 'number', align: 'right', width: 120 },
  {
    key: 'amount',
    title: 'Amount',
    dataIndex: 'amount',
    valueType: 'money',
    align: 'right',
    width: 180,
    render: (value) => {
      const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/[^0-9+-.]/g, ''));
      if (!Number.isFinite(parsed)) return String(value ?? '');
      return `$${parsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
  },
];

export const projects: ProjectRecord[] = [
  {
    id: 'p-1',
    name: 'Brand refresh',
    client: 'Acme Coffee',
    status: 'Discovery',
    phase: 'Phase 1',
    owner: 'Nora Nunes',
    budget: 3800,
    margin: 0.36,
    dueDate: '2026-07-15',
    description: 'Kickoff, stakeholder interviews, and visual research.',
  },
  {
    id: 'p-2',
    name: 'Identity system',
    client: 'Northstar',
    status: 'Design',
    phase: 'Phase 2',
    owner: 'Mae Cooper',
    budget: 8200,
    margin: 0.42,
    dueDate: '2026-08-02',
    description: 'Logo, type system, color palette, and guidelines.',
    disabled: true,
  },
  {
    id: 'p-3',
    name: 'Packaging suite',
    client: 'Field Goods',
    status: 'Build',
    phase: 'Phase 3',
    owner: 'Iris Chen',
    budget: 5400,
    margin: 0.31,
    dueDate: '2026-08-17',
    description: 'Primary SKU artwork and dieline handoff.',
  },
  {
    id: 'p-4',
    name: 'Launch assets',
    client: 'Acme Coffee',
    status: 'Sent',
    phase: 'Phase 3',
    owner: 'Nora Nunes',
    budget: 2100,
    margin: 0.28,
    dueDate: '2026-08-24',
    description: 'Campaign handoff kit and production exports.',
  },
  {
    id: 'p-5',
    name: 'Retainer invoice',
    client: 'Northstar',
    status: 'Paid',
    phase: 'Phase 1',
    owner: 'Mae Cooper',
    budget: 1200,
    margin: 0.5,
    dueDate: '2026-07-08',
    description: 'Monthly strategy and support retainer.',
  },
];

export const treeProjects: ProjectRecord[] = [
  {
    id: 'phase-1',
    name: 'Phase 1',
    client: 'Acme Coffee',
    status: 'Discovery',
    phase: 'Phase 1',
    owner: 'Nora Nunes',
    budget: 3800,
    margin: 0.36,
    dueDate: '2026-07-15',
    children: [
      {
        id: 'phase-1-a',
        name: 'Research',
        client: 'Acme Coffee',
        status: 'Discovery',
        phase: 'Phase 1',
        owner: 'Nora Nunes',
        budget: 1200,
        margin: 0.3,
        dueDate: '2026-07-08',
      },
      {
        id: 'phase-1-b',
        name: 'Audit',
        client: 'Acme Coffee',
        status: 'Discovery',
        phase: 'Phase 1',
        owner: 'Iris Chen',
        budget: 2600,
        margin: 0.39,
        dueDate: '2026-07-15',
      },
    ],
  },
  projects[1],
  projects[2],
];

export const largeProjects: ProjectRecord[] = Array.from({ length: 150 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `Project ${index + 1}`,
  client: index % 3 === 0 ? 'Acme Coffee' : index % 3 === 1 ? 'Northstar' : 'Field Goods',
  status: index % 5 === 0 ? 'Discovery' : index % 5 === 1 ? 'Design' : index % 5 === 2 ? 'Build' : index % 5 === 3 ? 'Sent' : 'Paid',
  phase: index % 3 === 0 ? 'Phase 1' : index % 3 === 1 ? 'Phase 2' : 'Phase 3',
  owner: index % 2 === 0 ? 'Nora Nunes' : 'Mae Cooper',
  budget: 1000 + index * 125,
  margin: 0.2 + (index % 6) / 20,
  dueDate: `2026-09-${String((index % 26) + 1).padStart(2, '0')}`,
  description: `Generated project row ${index + 1}`,
}));

export const appearanceVariantProjects: ProjectRecord[] = [projects[2], projects[0], projects[1]];

export const statusFilters = [
  { text: 'Discovery', value: 'Discovery' },
  { text: 'Design', value: 'Design' },
  { text: 'Build', value: 'Build' },
  { text: 'Sent', value: 'Sent' },
  { text: 'Paid', value: 'Paid' },
];

export const clientFilters = [
  { text: 'Acme Coffee', value: 'Acme Coffee' },
  { text: 'Northstar', value: 'Northstar' },
  { text: 'Field Goods', value: 'Field Goods' },
];

export const phaseTreeFilters = [
  {
    text: 'Active phases',
    value: 'active',
    children: [
      { text: 'Phase 1', value: 'Phase 1' },
      { text: 'Phase 2', value: 'Phase 2' },
      { text: 'Phase 3', value: 'Phase 3' },
    ],
  },
];

export const defaultColumns: TableColumn<ProjectRecord>[] = [
  { key: 'name', title: 'Project', dataIndex: 'name' },
  { key: 'client', title: 'Client', dataIndex: 'client' },
  { key: 'status', title: 'Status', dataIndex: 'status' },
  { key: 'owner', title: 'Owner', dataIndex: 'owner' },
  { key: 'budget', title: 'Budget', dataIndex: 'budget', align: 'right' },
];

export const wideProjectColumns: TableColumn<ProjectRecord>[] = [
  { ...defaultColumns[0], fixed: 'start', width: 220 },
  { ...defaultColumns[1], width: 180 },
  { ...defaultColumns[2], width: 140 },
  { ...defaultColumns[3], width: 160 },
  { key: 'phase', title: 'Phase', dataIndex: 'phase', width: 140 },
  {
    key: 'margin',
    title: 'Margin',
    dataIndex: 'margin',
    valueType: 'number',
    width: 140,
    align: 'right',
    render: (value) => `${Math.round(Number(value) * 100)}%`,
  },
  { key: 'dueDate', title: 'Due', dataIndex: 'dueDate', valueType: 'date', width: 160 },
  { ...defaultColumns[4], fixed: 'end', width: 160 },
];

export const groupedProjectColumns: TableColumn<ProjectRecord>[] = [
  {
    key: 'project-group',
    title: 'Project',
    children: [defaultColumns[0], defaultColumns[1], defaultColumns[2]],
  },
  {
    key: 'commercial-group',
    title: 'Commercials',
    children: [defaultColumns[3], defaultColumns[4]],
  },
];

export const matrixRows: TableDataRow<ProjectRecord, DocCellData>[] = [
  {
    key: 'row-1',
    title: 'Scope',
    record: {
      id: 'row-1',
      name: 'Scope of work',
      client: 'Service Agreement',
      status: 'Build',
      phase: 'Phase 1',
      owner: 'Nora',
      budget: 18400,
      margin: 0.36,
      dueDate: '2026-07-15',
    },
    cells: {
      name: { value: 'Scope of work', kind: 'paragraph' },
      client: { value: 'Service Agreement', kind: 'paragraph' },
      status: { value: 'Ready', kind: 'paragraph' },
      owner: { value: 'Nora', kind: 'paragraph' },
      budget: { value: { amount: 18400, currency: 'USD' }, kind: 'money', align: 'right' },
    },
  },
  {
    key: 'row-2',
    title: 'Payment',
    record: {
      id: 'row-2',
      name: 'Payment terms',
      client: 'Net 15',
      status: 'Design',
      phase: 'Phase 2',
      owner: 'Mae',
      budget: 9200,
      margin: 0.42,
      dueDate: '2026-08-02',
    },
    cells: {
      name: { value: 'Payment terms', kind: 'paragraph' },
      client: { value: 'Net 15', kind: 'paragraph' },
      status: { value: 'Draft', kind: 'paragraph' },
      owner: { value: 'Mae', kind: 'paragraph' },
      budget: { value: { amount: 9200, currency: 'USD' }, kind: 'money', align: 'right' },
    },
  },
];

export const spanRows: TableDataRow<ProjectRecord, DocCellData>[] = [
  {
    key: 'summary',
    record: {
      id: 'summary',
      name: 'Project summary across two columns',
      client: 'Summary',
      status: 'Discovery',
      phase: 'Phase 1',
      owner: 'Nora',
      budget: 18400,
      margin: 0.36,
      dueDate: '2026-07-15',
    },
    cells: {
      name: { value: 'Project summary across two columns', colSpan: 2 },
      client: { value: 'Hidden by colSpan', colSpan: 0 },
      status: { value: 'Ready' },
      owner: { value: 'Nora' },
      budget: { value: { amount: 18400, currency: 'USD' }, kind: 'money', align: 'right' },
    },
  },
  ...matrixRows,
];

export const registryRows: TableDataRow<ProjectRecord, DocCellData>[] = [
  {
    key: 'registry-1',
    record: {
      id: 'registry-1',
      name: 'Service Agreement',
      client: 'Acme Coffee',
      status: 'Discovery',
      phase: 'Phase 1',
      owner: 'Nora',
      budget: 18400,
      margin: 0.36,
      dueDate: '2026-07-15',
    },
    cells: {
      name: { kind: 'heading', value: { id: 'h-1', text: 'Service Agreement', level: 3 } },
      client: { kind: 'pill', value: { id: 'pill-1', text: 'Acme Coffee' } },
      status: { kind: 'bulletList', value: { id: 'list-1', items: ['Discovery', 'Identity', 'Packaging'] } },
      owner: { kind: 'image', value: { id: 'img-1', src: '/images/empty-states/forms.svg', alt: 'Document illustration' } },
      budget: { kind: 'money', value: { id: 'amount-1', amount: 18400, currency: 'USD' }, align: 'right' },
    },
  },
  {
    key: 'registry-2',
    record: {
      id: 'registry-2',
      name: 'Paragraph renderer through TableRegistry.',
      client: 'Divider',
      status: 'Design',
      phase: 'Phase 2',
      owner: 'Mae',
      budget: 9200,
      margin: 0.42,
      dueDate: '2026-08-02',
    },
    cells: {
      name: { kind: 'paragraph', value: { id: 'p-1', text: 'Paragraph renderer through TableRegistry.' } },
      client: { kind: 'divider', value: { id: 'divider-1' } },
      status: { kind: 'orderedList', value: { id: 'ordered-1', items: ['Draft', 'Review', 'Send'] } },
      owner: { kind: 'actions', value: { id: 'actions-1', text: 'Actions' } },
      budget: { kind: 'money', value: { id: 'amount-2', amount: 9200, currency: 'USD' }, align: 'right' },
    },
  },
];

const getCellData = (cell?: TableCellOverride<ProjectRecord, DocCellData>): DocCellData | undefined => {
  if (!cell) return undefined;
  if (typeof cell.value === 'object' && cell.value !== null) return cell.value as DocCellData;
  return { id: 'inline', text: String(cell.value ?? '') };
};

export const storyTableRegistry = mergeTableRegistry(getDefaultTableRegistry<ProjectRecord, DocCellData>(), {
  fields: {
    paragraph: ({ row, column }) => <p className="m-0">{getCellData(row.cells?.[column.key])?.text}</p>,
    heading: ({ row, column }) => {
      const value = getCellData(row.cells?.[column.key]);
      return <strong className="text-sm">{value?.text}</strong>;
    },
    pill: ({ row, column }) => {
      const value = getCellData(row.cells?.[column.key]);
      return <span className="rounded-full bg-[var(--bui-table-header-bg)] px-2 py-1 text-xs font-medium">{value?.text}</span>;
    },
    image: ({ row, column }) => {
      const value = getCellData(row.cells?.[column.key]);
      return (
        <span className="inline-flex items-center gap-2">
          <ImageIcon size={14} aria-hidden />
          {value?.alt ?? 'Image'}
        </span>
      );
    },
    divider: () => <hr className="border-[var(--bui-table-border-color)]" />,
    bulletList: ({ row, column }) => {
      const value = getCellData(row.cells?.[column.key]);
      return (
        <ul className="m-0 list-disc pl-4">
          {(value?.items ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    },
    orderedList: ({ row, column }) => {
      const value = getCellData(row.cells?.[column.key]);
      return (
        <ol className="m-0 list-decimal pl-4">
          {(value?.items ?? []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    },
    actions: () => (
      <span className="inline-flex items-center gap-2">
        <Pencil size={14} aria-label="Edit" />
        <Trash2 size={14} aria-label="Delete" />
        <MoreHorizontal size={14} aria-label="More" />
      </span>
    ),
  },
});

export const editableRows: TableDataRow<ProjectRecord, DocCellData>[] = projects.slice(0, 3).map((project) => ({
  key: project.id,
  record: project,
  editable: {
    mode: 'row',
    initialValues: (record) => ({ name: record.name, owner: record.owner, budget: record.budget }),
  },
}));

export const draggableRows: TableDataRow<ProjectRecord, DocCellData>[] = projects.slice(0, 4).map((project) => ({
  key: project.id,
  record: project,
  draggable: !project.disabled,
  disabled: project.disabled,
}));

export const dragHandleColumn: TableColumn<ProjectRecord> = {
  key: 'drag',
  title: <ArrowDownUp size={14} aria-label="Reorder" />,
  render: () => 'Drag',
  width: 72,
};

export const basicDataSourceTableFactory = (props: Partial<TableProps<ProjectRecord, DocCellData>> = {}): TableProps<ProjectRecord, DocCellData> => ({
  columns: defaultColumns as TableColumn<ProjectRecord, DocCellData>[],
  dataSource: projects,
  ...props,
});
