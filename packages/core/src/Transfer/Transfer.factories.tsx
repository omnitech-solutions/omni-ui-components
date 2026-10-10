import type { TransferItem, TransferProps } from '@oc-tech/omni-ui-components/Transfer';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/** A consumer's own item: the base row plus the fields the product needs. */
export interface TeamItem extends TransferItem {
  headcount: number;
}

export const SAMPLE_TEAMS: TeamItem[] = [
  { key: 'finance', title: 'Finance', description: 'Budgets and invoices', headcount: 12 },
  { key: 'engineering', title: 'Engineering', description: 'Product and platform', headcount: 48 },
  { key: 'operations', title: 'Operations', description: 'Facilities and supply', headcount: 9 },
  { key: 'legal', title: 'Legal', description: 'Contracts', headcount: 4, disabled: true },
  { key: 'marketing', title: 'Marketing', description: 'Campaigns and brand', headcount: 15 },
  { key: 'support', title: 'Support', description: 'Customer care', headcount: 21 },
];

/** Build `<Transfer>` props for stories and tests. */
export const transferPropsFactory = (
  overrides: Partial<TransferProps<TeamItem>> = {},
): TransferProps<TeamItem> => ({
  id: 'demo-transfer',
  label: 'Teams with access',
  description: 'Move a team to the right to give it access.',
  dataSource: SAMPLE_TEAMS,
  defaultTargetKeys: ['engineering'],
  labels: { sourceTitle: 'All teams', targetTitle: 'With access' },
  ...overrides,
});

/** Custom move icons, as a consumer passes them. */
export const SAMPLE_MOVE_ICONS: Pick<
  TransferProps<TeamItem>,
  'moveToTargetIcon' | 'moveToSourceIcon'
> = {
  moveToTargetIcon: <ArrowRight aria-hidden="true" />,
  moveToSourceIcon: <ArrowLeft aria-hidden="true" />,
};

/** German strings: every word goes through `labels`. */
export const SAMPLE_TRANSFER_LABELS: TransferProps<TeamItem>['labels'] = {
  sourceTitle: 'Alle Teams',
  targetTitle: 'Mit Zugriff',
  selectedCount: (selected, total) => `${selected} von ${total} gewählt`,
  empty: 'Keine Einträge',
  noMatches: 'Keine Treffer',
  moveToTarget: 'Auswahl hinzufügen',
  moveToSource: 'Auswahl entfernen',
  searchSource: 'Alle Teams filtern',
  searchTarget: 'Teams mit Zugriff filtern',
  searchPlaceholder: 'Filtern',
};
