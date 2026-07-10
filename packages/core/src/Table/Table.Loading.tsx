/**
 * Loading state — base contract shared by every loading variant.
 *
 * The Table's `loading` prop accepts `boolean | TableLoadingVariantName |
 * TableLoadingProps`. `resolveLoading` normalizes that to a plain
 * `{ active, variant, props }` shape, and `getLoadingVariant` returns the
 * handler that renders the skeleton rows or the overlay spinner.
 */

import * as React from 'react';

import type { TableColumn, TableLoadingProps } from './Table.types';
import { TableLoadingSkeletonVariant } from './Table.Loading.Skeleton';
import { TableLoadingSpinnerVariant } from './Table.Loading.Spinner';

export type TableLoadingVariantName = 'skeleton' | 'spinner';

export interface TableLoadingContext<TRecord = unknown, TRowData = unknown> {
  /** Number of skeleton rows to render (or ignore). */
  rowCount: number;
  /** Column count including drag/select/expand shims. Used for `colSpan`. */
  columnCount: number;
  /** Leaf columns to walk when rendering per-column placeholders. */
  columns: TableColumn<TRecord, TRowData>[];
  /** Prefix for `data-testid` stability. */
  testIdPrefix: string;
  /** Consumer-supplied props (`spinning`, `text`, …). */
  props?: TableLoadingProps;
  /** Spinner component from the Table registry. */
  Spinner: React.ComponentType<TableLoadingProps>;
}

export interface TableLoadingVariant {
  readonly name: TableLoadingVariantName;
  /** Rendered inside `<tbody>` in place of real rows. Return `null` to skip. */
  renderRows?: <TRecord, TRowData>(ctx: TableLoadingContext<TRecord, TRowData>) => React.ReactNode | null;
  /** Rendered as an absolute overlay outside `<tbody>`. Return `null` to skip. */
  renderOverlay?: <TRecord, TRowData>(ctx: TableLoadingContext<TRecord, TRowData>) => React.ReactNode | null;
  /** When true, Table skips rendering the real body rows while loading. */
  readonly replacesBody: boolean;
}

const VARIANTS: Record<TableLoadingVariantName, TableLoadingVariant> = {
  skeleton: TableLoadingSkeletonVariant,
  spinner: TableLoadingSpinnerVariant,
};

export interface ResolvedLoadingState {
  active: boolean;
  variant: TableLoadingVariantName;
  props?: TableLoadingProps;
}

export function resolveLoading(
  loading: boolean | TableLoadingVariantName | TableLoadingProps | undefined,
  defaultVariant: TableLoadingVariantName = 'skeleton',
): ResolvedLoadingState {
  if (!loading) return { active: false, variant: defaultVariant };
  if (loading === true) return { active: true, variant: defaultVariant };
  if (typeof loading === 'string') return { active: true, variant: loading };
  return { active: true, variant: loading.variant ?? defaultVariant, props: loading };
}

export function getLoadingVariant(name: TableLoadingVariantName): TableLoadingVariant {
  return VARIANTS[name] ?? TableLoadingSkeletonVariant;
}
