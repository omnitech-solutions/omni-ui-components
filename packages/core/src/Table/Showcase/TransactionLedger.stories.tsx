import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Table } from '@omnitech/omni-ui-core/Table';
import type { TableColumn } from '@omnitech/omni-ui-core/Table';
import { ShowcaseShell } from './ShowcaseShell';

interface LedgerEntry {
  id: string;
  postedOn: string;
  description: string;
  category: 'Income' | 'Expense' | 'Transfer';
  method: 'Card' | 'ACH' | 'Wire' | 'Check';
  reconciled: boolean;
  amount: number;
  currency: 'USD' | 'GBP' | 'EUR';
}

const entries: LedgerEntry[] = Array.from({ length: 48 }, (_, index) => {
  const isIncome = index % 3 === 0;
  const isTransfer = index % 7 === 0;
  const amount = isIncome ? 1200 + index * 37 : -(180 + (index % 9) * 24);
  return {
    id: `t-${index + 1}`,
    postedOn: `2026-05-${String((index % 28) + 1).padStart(2, '0')}`,
    description: isIncome ? `Retainer invoice #${1200 + index}` : `Software subscription ${index}`,
    category: isTransfer ? 'Transfer' : isIncome ? 'Income' : 'Expense',
    method: (['Card', 'ACH', 'Wire', 'Check'] as const)[index % 4],
    reconciled: index % 5 !== 0,
    amount,
    currency: (['USD', 'GBP', 'EUR'] as const)[index % 3],
  };
});

const currencyFormatter: Record<LedgerEntry['currency'], Intl.NumberFormat> = {
  USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }),
  GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }),
  EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }),
};

const ledgerColumns: TableColumn<LedgerEntry>[] = [
  { key: 'postedOn', dataIndex: 'postedOn', title: 'Posted', sorter: (a, b) => a.postedOn.localeCompare(b.postedOn) },
  { key: 'description', dataIndex: 'description', title: 'Description' },
  {
    key: 'category',
    dataIndex: 'category',
    title: 'Category',
    filters: [
      { text: 'Income', value: 'Income' },
      { text: 'Expense', value: 'Expense' },
      { text: 'Transfer', value: 'Transfer' },
    ],
    onFilter: (value, record) => record.category === value,
  },
  { key: 'method', dataIndex: 'method', title: 'Method' },
  { key: 'reconciled', dataIndex: 'reconciled', title: 'Reconciled', render: (v: boolean) => (v ? '✓' : '—') },
  {
    key: 'amount',
    dataIndex: 'amount',
    title: 'Amount',
    align: 'right',
    sorter: (a, b) => a.amount - b.amount,
    render: (_: unknown, record) => currencyFormatter[record.currency].format(record.amount),
  },
];

const meta: Meta = {
  title: 'omni-ui-components/Table/Showcase/Transaction ledger',
  parameters: { layout: 'fullscreen' },
};
export default meta;

const CODE = `<Table<LedgerEntry>
  columns={ledgerColumns}
  dataSource={entries}
  rowKey="id"
  pagination={{ defaultPageSize: 12, placement: ['bottomEnd'] }}
  scroll={{ x: 900 }}
  testIdPrefix="showcase-ledger"
/>`;

export const Default: StoryObj = {
  render: () => (
    <ShowcaseShell
      title="Transaction ledger"
      scenario="A finance-view ledger with 48 entries, mixed currencies formatted per locale, negative amounts for expenses, filterable category, and paginated scrolling. Same component, different domain."
      code={CODE}
    >
      <Table<LedgerEntry>
        columns={ledgerColumns}
        dataSource={entries}
        rowKey="id"
        pagination={{ defaultPageSize: 12, placement: ['bottomEnd'] }}
        scroll={{ x: 900 }}
        testIdPrefix="showcase-ledger"
      />
    </ShowcaseShell>
  ),
};
