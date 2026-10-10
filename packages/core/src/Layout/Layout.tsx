import { cn } from 'lib/utils';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import * as React from 'react';
import { useControllableState } from '../lib/use-controllable-state';
import type {
  ContentProps,
  HeaderLevel,
  HeaderProps,
  LayoutProps,
  LayoutSectionProps,
  SiderLabels,
  SiderProps,
  SiderSlot,
} from './Layout.types';

/** The thin scrollbar of `Panel`, from the same tokens. */
const thinScrollbar =
  '[scrollbar-color:var(--oui-panel-scrollbar-thumb)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[var(--oui-panel-scrollbar-size)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[color:var(--oui-panel-scrollbar-thumb)] [&::-webkit-scrollbar-track]:bg-transparent';

/**
 * Omni Layout: the frame of a page. `direction="row"` lays a `Sider` beside the rest; `fill` makes it the height
 * of the viewport, so a `Content scroll` scrolls and the page does not.
 *
 * @example
 * <Layout direction="row" fill>
 *   <Sider collapsible label="Main navigation" header={brand}><Menu appearance="plain" items={items} /></Sider>
 *   <Layout>
 *     <Header title="Reports" actions={<Button>New</Button>} level={1} />
 *     <Content scroll maxWidth="lg">{page}</Content>
 *   </Layout>
 * </Layout>
 */
const LayoutInner = React.forwardRef<HTMLElement, LayoutProps>(
  ({ className, direction, fill, ...props }, ref) => (
    <section
      ref={ref}
      data-direction={direction}
      data-fill={fill ? 'true' : undefined}
      className={cn(
        'flex min-h-0 flex-col',
        direction === 'row' && 'flex-row [&>section]:min-w-0 [&>section]:flex-1',
        fill && 'h-dvh w-full overflow-hidden',
        className,
      )}
      {...props}
    />
  ),
);
LayoutInner.displayName = 'Layout';
export const Layout = React.memo(LayoutInner) as typeof LayoutInner;

const headerPadding = { none: 'p-0', sm: 'px-4 py-2', md: 'px-6 py-4' } as const;
const headingSize: Record<HeaderLevel, string> = {
  1: 'text-2xl',
  2: 'text-xl',
  3: 'text-base',
};

/**
 * Omni Header: a plain `<header>`, or with `title` a page header (eyebrow, a heading of `level`, description,
 * then `meta` and `actions` at the end). Children still render, under the row.
 *
 * Slots: `data-slot="header-row" | "header-eyebrow" | "header-title" | "header-description" | "header-meta" | "header-actions"`.
 */
const HeaderInner = React.forwardRef<HTMLElement, HeaderProps>(
  (
    {
      className,
      title,
      description,
      eyebrow,
      meta,
      actions,
      level = 2,
      bordered = true,
      padding = 'md',
      children,
      ...props
    },
    ref,
  ) => {
    const structured =
      title != null || description != null || eyebrow != null || meta != null || actions != null;
    const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
    return (
      <header
        ref={ref}
        className={cn('border-b', headerPadding[padding], !bordered && 'border-b-0', className)}
        {...props}
      >
        {structured ? (
          <div
            data-slot="header-row"
            className="flex min-w-0 flex-wrap items-start gap-x-4 gap-y-2"
          >
            <div className="min-w-0 flex-1 font-[family-name:var(--oui-font-sans)]">
              {eyebrow != null ? (
                <div
                  data-slot="header-eyebrow"
                  className="text-xs font-medium text-[var(--oui-foreground-muted)]"
                >
                  {eyebrow}
                </div>
              ) : null}
              {title != null ? (
                <Heading
                  data-slot="header-title"
                  className={cn(
                    'm-0 font-semibold tracking-tight text-balance text-[var(--oui-foreground)]',
                    headingSize[level],
                  )}
                >
                  {title}
                </Heading>
              ) : null}
              {description != null ? (
                <p
                  data-slot="header-description"
                  className="m-0 mt-1 text-sm text-[var(--oui-foreground-muted)]"
                >
                  {description}
                </p>
              ) : null}
            </div>
            {meta != null ? (
              <div
                data-slot="header-meta"
                className="flex flex-none items-center gap-2 self-center text-sm text-[var(--oui-foreground-muted)]"
              >
                {meta}
              </div>
            ) : null}
            {actions != null ? (
              <div
                data-slot="header-actions"
                className="flex flex-none items-center gap-2 self-center"
              >
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}
        {children}
      </header>
    );
  },
);
HeaderInner.displayName = 'Header';
export const Header = React.memo(HeaderInner) as typeof HeaderInner;

const contentPadding = { none: 'p-0', sm: 'px-4 py-2', md: 'px-6 py-4', lg: 'px-8 py-6' } as const;
const contentMaxWidth = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
} as const;

/**
 * Omni Content: the main region. `maxWidth` is the page container (the content is centred under that width),
 * `center` centres one child both ways, `scroll` scrolls inside, `as` picks the element when a page has a second
 * content region.
 */
const ContentInner = React.forwardRef<HTMLElement, ContentProps>(
  (
    {
      className,
      maxWidth = 'full',
      padding = 'md',
      center,
      scroll,
      as = 'main',
      children,
      ...props
    },
    ref,
  ) => {
    const limited = maxWidth !== 'full';
    return React.createElement(
      as,
      {
        ref,
        className: cn(
          'min-h-0 flex-1',
          contentPadding[padding],
          center && 'grid place-items-center',
          scroll && 'overflow-y-auto',
          scroll && thinScrollbar,
          className,
        ),
        ...props,
      },
      limited ? (
        <div
          data-slot="content-container"
          className={cn('mx-auto w-full', contentMaxWidth[maxWidth])}
        >
          {children}
        </div>
      ) : (
        children
      ),
    );
  },
);
ContentInner.displayName = 'Content';
export const Content = React.memo(ContentInner) as typeof ContentInner;

const FooterInner = React.forwardRef<HTMLElement, LayoutSectionProps>(
  ({ className, ...props }, ref) => (
    <footer ref={ref} className={cn('border-t px-6 py-4', className)} {...props} />
  ),
);
FooterInner.displayName = 'Footer';
export const Footer = React.memo(FooterInner) as typeof FooterInner;

const defaultSiderLabels: SiderLabels = { collapse: 'Collapse sidebar', expand: 'Expand sidebar' };
const slot = (value: SiderSlot, collapsed: boolean) =>
  typeof value === 'function' ? value({ collapsed }) : value;

/**
 * Omni Sider: a plain `<aside>`, or with any of `header`, `footer`, `scroll`, `collapsible`, `collapsed` and
 * `defaultCollapsed` a side column with a pinned header and footer around a body. Collapsed, it is
 * `collapsedWidth` wide and carries `data-collapsed`; the control is drawn only when `collapsible`. The host
 * passes the same state on to what it holds (`<Menu collapsed>`).
 *
 * Slots: `data-slot="sider-header" | "sider-body" | "sider-footer" | "sider-collapse"`.
 */
const SiderInner = React.forwardRef<HTMLElement, SiderProps>(
  (
    {
      className,
      style,
      width,
      collapsedWidth,
      collapsible,
      collapsed: collapsedProp,
      defaultCollapsed,
      onCollapsedChange,
      header,
      footer,
      scroll,
      label,
      side = 'start',
      collapseIcon,
      expandIcon,
      labels,
      children,
      ...props
    },
    ref,
  ) => {
    const [collapsed, setCollapsed] = useControllableState(
      collapsedProp,
      defaultCollapsed ?? false,
      onCollapsedChange,
    );
    const bodyId = React.useId();
    const structured =
      header != null ||
      footer != null ||
      scroll != null ||
      collapsible != null ||
      collapsedProp != null ||
      defaultCollapsed != null;
    const edge = side === 'end' && 'border-r-0 border-l';

    if (!structured) {
      return (
        <aside
          ref={ref}
          aria-label={label}
          className={cn('min-h-0 border-r px-4 py-4', edge, className)}
          style={width == null ? style : { width, flex: 'none', ...style }}
          {...props}
        >
          {children}
        </aside>
      );
    }

    const text = { ...defaultSiderLabels, ...labels };
    const currentWidth = collapsed ? (collapsedWidth ?? 56) : (width ?? 240);
    return (
      <aside
        ref={ref}
        aria-label={label}
        data-collapsed={collapsed ? 'true' : undefined}
        className={cn(
          'flex min-h-0 flex-none flex-col border-r transition-[width] duration-150 motion-reduce:transition-none',
          edge,
          className,
        )}
        style={{ width: currentWidth, ...style }}
        {...props}
      >
        {header != null ? (
          <div
            data-slot="sider-header"
            className={cn('flex-none py-3', collapsed ? 'px-2' : 'px-4')}
          >
            {slot(header, collapsed)}
          </div>
        ) : null}
        <div
          id={bodyId}
          data-slot="sider-body"
          className={cn(
            'min-h-0 flex-1 py-2',
            collapsed ? 'px-2' : 'px-3',
            scroll ? 'overflow-y-auto' : 'overflow-hidden',
            scroll && thinScrollbar,
          )}
        >
          {children}
        </div>
        {footer != null ? (
          <div
            data-slot="sider-footer"
            className={cn('flex-none py-3', collapsed ? 'px-2' : 'px-4')}
          >
            {slot(footer, collapsed)}
          </div>
        ) : null}
        {collapsible ? (
          <div
            className={cn(
              'flex flex-none border-t p-2',
              collapsed ? 'justify-center' : 'justify-end',
            )}
          >
            <button
              type="button"
              data-slot="sider-collapse"
              aria-label={collapsed ? text.expand : text.collapse}
              aria-expanded={!collapsed}
              aria-controls={bodyId}
              onClick={() => setCollapsed(!collapsed)}
              className="inline-flex size-8 appearance-none items-center justify-center rounded-md border-0 bg-transparent text-[var(--oui-foreground-muted)] outline-none transition-colors hover:bg-muted/40 hover:text-[var(--oui-foreground)] focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4"
            >
              <span aria-hidden="true" className="inline-flex">
                {collapsed
                  ? (expandIcon ?? (side === 'end' ? <ChevronsLeft /> : <ChevronsRight />))
                  : (collapseIcon ?? (side === 'end' ? <ChevronsRight /> : <ChevronsLeft />))}
              </span>
            </button>
          </div>
        ) : null}
      </aside>
    );
  },
);
SiderInner.displayName = 'Sider';
export const Sider = React.memo(SiderInner) as typeof SiderInner;
