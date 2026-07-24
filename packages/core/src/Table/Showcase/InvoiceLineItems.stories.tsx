import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '@oc-tech/omni-ui-components/Table';
import { invoiceColumns, invoiceLines, type InvoiceLineRecord } from '../Table.story.fixtures';
import { ShowcaseShell } from './ShowcaseShell';

const meta: Meta = {
  title: 'omni-ui-components/Table/Showcase/Invoice line items',
  parameters: { layout: 'fullscreen' },
};
export default meta;

const formatUsd = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const renderSubtotal = (records: InvoiceLineRecord[]): React.ReactNode => {
  const total = records.reduce((sum, record) => sum + record.amount, 0);
  return (
    <tr>
      <td style={{ padding: '12px 16px', fontWeight: 600 }}>Subtotal</td>
      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{records.length}</td>
      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>{formatUsd(total)}</td>
    </tr>
  );
};

const CODE = `const renderSubtotal = (records) => {
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  return (
    <tr>
      <td>Subtotal</td>
      <td>{records.length}</td>
      <td>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
    </tr>
  );
};

<Table<InvoiceLineRecord>
  columns={invoiceColumns}
  dataSource={invoiceLines}
  rowKey="id"
  pagination={{ placement: ['none'] }}
  summary={renderSubtotal}
  testIdPrefix="showcase-invoice"
/>`;

export const Default: StoryObj = {
  render: () => (
    <ShowcaseShell
      title="Invoice line items"
      scenario="A stripped invoice-detail grid: no pagination, money-typed totals, unbordered rows, and a live subtotal footer computed from the current dataSource via the `summary` prop. This is the shape a Projects billing view drops the Table component into."
      code={CODE}
    >
      <Table<InvoiceLineRecord>
        columns={invoiceColumns}
        dataSource={invoiceLines}
        rowKey="id"
        pagination={{ placement: ['none'] }}
        summary={renderSubtotal}
        testIdPrefix="showcase-invoice"
      />
    </ShowcaseShell>
  ),
};
