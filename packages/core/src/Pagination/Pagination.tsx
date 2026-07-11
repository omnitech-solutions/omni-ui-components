import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from 'lib/utils';

type PageEntry = number | 'ellipsis';

function buildPageWindow(current: number, pageCount: number): PageEntry[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const entries: PageEntry[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(pageCount - 1, current + 1);
  if (start > 2) entries.push('ellipsis');
  for (let page = start; page <= end; page += 1) entries.push(page);
  if (end < pageCount - 1) entries.push('ellipsis');
  entries.push(pageCount);
  return entries;
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  current?: number;
  total: number;
  pageSize?: number;
  disabled?: boolean;
  showPrevNext?: boolean;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (page: number, pageSize: number) => void;
  testIdPrefix?: string;
}

export const Pagination = ({
  current = 1,
  total,
  pageSize = 10,
  disabled = false,
  showPrevNext = true,
  showSizeChanger = false,
  pageSizeOptions = [10, 20, 50, 100],
  onChange,
  onShowSizeChange,
  className,
  testIdPrefix,
  ...props
}: PaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(current, 1), pageCount);
  const pages = buildPageWindow(currentPage, pageCount);
  const prevDisabled = disabled || currentPage <= 1;
  const nextDisabled = disabled || currentPage >= pageCount;

  const emitPageChange = React.useCallback(
    (page: number) => {
      if (disabled) return;
      const nextPage = Math.min(Math.max(page, 1), pageCount);
      onChange?.(nextPage, pageSize);
    },
    [disabled, onChange, pageCount, pageSize],
  );

  const handlePageSizeChange = React.useCallback(
    (value: string) => {
      if (disabled) return;
      const nextPageSize = Number(value);
      onShowSizeChange?.(1, nextPageSize);
      onChange?.(1, nextPageSize);
    },
    [disabled, onChange, onShowSizeChange],
  );

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex flex-wrap items-center justify-between gap-3', className)}
      data-testid={testIdPrefix ? `${testIdPrefix}-pagination-root` : undefined}
      {...props}
    >
      <div
        className="inline-flex items-center gap-1 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-1 shadow-xs"
        data-testid={testIdPrefix ? `${testIdPrefix}-pagination-pages` : undefined}
      >
        {showPrevNext ? (
          <button
            type="button"
            className={cn(
              'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-sm text-[var(--oui-foreground-muted)] transition-colors',
              'hover:border-[var(--oui-border-field)] hover:bg-muted/30 hover:text-[var(--oui-foreground)]',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              prevDisabled && 'pointer-events-none opacity-45',
            )}
            aria-label="Previous page"
            disabled={prevDisabled}
            onClick={() => emitPageChange(currentPage - 1)}
            data-testid={testIdPrefix ? `${testIdPrefix}-pagination-prev` : undefined}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
        {pages.map((entry, index) =>
          entry === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 min-w-9 items-center justify-center text-[var(--oui-foreground-muted)]"
              data-testid={testIdPrefix ? `${testIdPrefix}-pagination-ellipsis-${index}` : undefined}
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              className={cn(
                'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
                currentPage === entry
                  ? 'border-[var(--oui-border-interactive)] bg-[var(--oui-foreground)] text-[var(--oui-background)] shadow-xs'
                  : 'border-transparent bg-transparent text-[var(--oui-foreground-muted)] hover:border-[var(--oui-border-field)] hover:bg-muted/30 hover:text-[var(--oui-foreground)]',
                disabled && 'pointer-events-none opacity-45',
              )}
              aria-current={currentPage === entry ? 'page' : undefined}
              disabled={disabled}
              onClick={() => emitPageChange(entry)}
              data-testid={testIdPrefix ? `${testIdPrefix}-pagination-item-${entry}` : undefined}
            >
              {entry}
            </button>
          ),
        )}
        {showPrevNext ? (
          <button
            type="button"
            className={cn(
              'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-sm text-[var(--oui-foreground-muted)] transition-colors',
              'hover:border-[var(--oui-border-field)] hover:bg-muted/30 hover:text-[var(--oui-foreground)]',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              nextDisabled && 'pointer-events-none opacity-45',
            )}
            aria-label="Next page"
            disabled={nextDisabled}
            onClick={() => emitPageChange(currentPage + 1)}
            data-testid={testIdPrefix ? `${testIdPrefix}-pagination-next` : undefined}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {showSizeChanger ? (
        <div className="flex items-center gap-2" data-testid={testIdPrefix ? `${testIdPrefix}-pagination-size` : undefined}>
          <span className="text-xs font-medium uppercase tracking-wide text-[var(--oui-foreground-muted)]">Rows</span>
          <Select value={String(pageSize)} disabled={disabled} onValueChange={handlePageSizeChange}>
            <SelectTrigger
              aria-label="Rows per page"
              className="h-9 min-w-[5.5rem] rounded-xl border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] text-[var(--oui-foreground)] shadow-xs"
              data-testid={testIdPrefix ? `${testIdPrefix}-pagination-size-changer` : undefined}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-[var(--oui-border-field)] bg-[var(--oui-surface-field)]">
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </nav>
  );
};
