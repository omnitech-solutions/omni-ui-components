import * as React from 'react';
import classNames from 'classnames';
import { useTable } from '../hooks/useTable';
import { AppendControlButton } from '../Table.append';
import type { TableLoadingVariant } from '../Table.Loading';
import { defaultRootClass } from '../internal';
import { Title } from './Title';
import { Footer } from './Footer';
import type { TableDataRow, TableLoadingProps, TableProps } from '../Table.types';

export interface TableRootProps<TRecord, TRowData> {
  rootRef: React.RefObject<HTMLDivElement | null>;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  className: string | undefined;
  style: React.CSSProperties | undefined;
  rootStyle: React.CSSProperties;
  appearance: NonNullable<TableProps<TRecord, TRowData>['appearance']>;
  borders: TableProps<TRecord, TRowData>['appearance'] extends infer A ? (A extends { borders?: infer B } ? B : never) : never;
  showHeader: boolean;
  size: TableProps<TRecord, TRowData>['size'];
  rowHoverable: boolean;
  scroll: TableProps<TRecord, TRowData>['scroll'];
  sticky: TableProps<TRecord, TRowData>['sticky'];
  stickyContainer: HTMLElement | undefined;
  enableVirtualRows: boolean;
  virtual: TableProps<TRecord, TRowData>['virtual'];
  onScroll: React.UIEventHandler<HTMLDivElement> | undefined;
  title: TableProps<TRecord, TRowData>['title'];
  footer: TableProps<TRecord, TRowData>['footer'];
  currentData: TRecord[];
  currentRows: TableDataRow<TRecord, TRowData>[];
  resolvedExtendable: { controls?: boolean; rows?: unknown | null; columns?: unknown | null };
  handleAppendRow: () => Promise<TableDataRow<TRecord, TRowData>>;
  handleAppendColumn: () => Promise<void>;
  loadingState: { active: boolean; props?: TableLoadingProps };
  loadingVariant: TableLoadingVariant;
  renderRows: unknown[];
  hasDraggableRows: boolean;
  rowSelection: TableProps<TRecord, TRowData>['rowSelection'];
  expandable: TableProps<TRecord, TRowData>['expandable'];
  treeMode: boolean;
  tableContent: React.ReactNode;
  bulkActionsBar: React.ReactNode;
  topPagination: React.ReactNode;
  bottomPagination: React.ReactNode;
}

export function TableRoot<TRecord, TRowData>({
  rootRef,
  scrollRef,
  className,
  style: _style,
  rootStyle,
  appearance,
  borders,
  showHeader,
  size,
  rowHoverable,
  scroll,
  sticky,
  stickyContainer,
  enableVirtualRows,
  virtual,
  onScroll,
  resolvedExtendable,
  handleAppendRow,
  handleAppendColumn,
  loadingState,
  loadingVariant,
  renderRows,
  hasDraggableRows,
  rowSelection,
  expandable,
  treeMode,
  tableContent,
  bulkActionsBar,
  topPagination,
  bottomPagination,
  title,
  footer,
  currentData,
  currentRows,
}: TableRootProps<TRecord, TRowData>) {
  const { table, props, registry, testIdPrefix, classMap, styleMap, renderedLeafColumns } = useTable<TRecord, TRowData>();
  const { Root, Content, Section, Loading } = registry.components;

  return (
    <Root
      table={table}
      props={props}
      registry={registry}
      className={classNames(defaultRootClass, classMap.root, className)}
      style={rootStyle}
      data-theme={props.theme && props.theme !== 'auto' ? props.theme : undefined}
      data-borders={borders}
      data-striped-rows={appearance.stripedRows ? 'true' : 'false'}
      data-header-row={appearance.headerRow ? 'true' : 'false'}
      data-header-column={appearance.headerColumn ? 'true' : 'false'}
      data-show-header={showHeader ? 'true' : 'false'}
      data-row-hoverable={rowHoverable ? 'true' : 'false'}
      data-size={size}
      data-scroll-x={scroll?.x == null ? undefined : String(scroll.x)}
      data-scroll-y={scroll?.y == null ? undefined : String(scroll.y)}
      data-sticky={sticky ? 'true' : 'false'}
      data-virtual-rows={enableVirtualRows ? 'true' : 'false'}
      data-virtual-columns={typeof virtual === 'object' && virtual.columns ? 'true' : 'false'}
      ref={rootRef as React.Ref<HTMLDivElement>}
      data-testid={`${testIdPrefix}-root`}
    >
      {title ? <Title render={title} data={currentData} rows={currentRows} className={classMap.title} style={styleMap.title} /> : null}
      {bulkActionsBar}
      {topPagination}
      <Content table={table} props={props} registry={registry} className={classMap.content} style={styleMap.content} data-testid={`${testIdPrefix}-content`}>
        <Section
          table={table}
          props={props}
          registry={registry}
          className={classNames(classMap.section)}
          style={{ ...styleMap.section }}
          data-testid={`${testIdPrefix}-section`}
        >
          <div
            ref={scrollRef as React.Ref<HTMLDivElement>}
            className="bui-table-scroll-body"
            onScroll={onScroll}
            style={{ height: scroll?.y, maxHeight: scroll?.y, overflow: scroll?.y || scroll?.x ? 'auto' : undefined }}
            data-testid={`${testIdPrefix}-scroll-body`}
          >
            {resolvedExtendable.controls && (resolvedExtendable.rows || resolvedExtendable.columns) ? (
              <div className="bui-table-extend-wrapper">
                {tableContent}
                {Boolean(resolvedExtendable.rows) && (
                  <AppendControlButton
                    label="Append row"
                    onClick={handleAppendRow}
                    testId={`${testIdPrefix}-append-row`}
                    className="bui-table-append-control--row"
                  />
                )}
                {Boolean(resolvedExtendable.columns) && (
                  <AppendControlButton
                    label="Append column"
                    onClick={handleAppendColumn}
                    testId={`${testIdPrefix}-append-column`}
                    className="bui-table-append-control--column"
                  />
                )}
              </div>
            ) : (
              tableContent
            )}
            {loadingState.active &&
              loadingVariant.renderOverlay?.({
                rowCount: renderRows.length,
                columnCount:
                  renderedLeafColumns.length +
                  (hasDraggableRows ? 1 : 0) +
                  (rowSelection ? 1 : 0) +
                  (!treeMode && expandable && expandable.showExpandColumn !== false ? 1 : 0),
                columns: renderedLeafColumns,
                testIdPrefix,
                props: loadingState.props,
                Spinner: Loading,
              })}
          </div>
          {scroll?.x && (
            <div
              className="pointer-events-none sticky z-[2] h-2"
              style={{ bottom: typeof sticky === 'object' ? (sticky.offsetScroll ?? 0) : 0 }}
              data-testid={`${testIdPrefix}-sticky-scrollbar`}
              data-sticky-container={stickyContainer ? 'true' : undefined}
            >
              <div
                className="h-full"
                style={{ background: 'var(--bui-table-sticky-scrollbar-bg)', borderRadius: 'var(--bui-table-sticky-scrollbar-radius)' }}
                data-testid={`${testIdPrefix}-sticky-scrollbar-thumb`}
              />
            </div>
          )}
        </Section>
      </Content>
      {footer ? <Footer render={footer} data={currentData} rows={currentRows} className={classMap.footer} style={styleMap.footer} /> : null}
      {bottomPagination}
    </Root>
  );
}
