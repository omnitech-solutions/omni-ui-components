import { Button } from '@oc-tech/omni-ui-components/Button';
import { ArrowUp, ChevronDown, List } from 'lucide-react';
import * as React from 'react';
import './overview.css';

export interface TocItem {
  id: string;
  label: string;
  group?: string;
  nested?: boolean;
}

interface TableOfContentsProps {
  items: TocItem[];
  title?: string;
}

/** Distance from the top of the window at which a section counts as the one being read. */
const READING_LINE = 120;

/** The last item whose section starts at or above the reading line; the first item at the top of the page. */
export const activeItemId = (
  items: TocItem[],
  topOf: (id: string) => number | undefined,
): string | undefined => {
  let active = items[0]?.id;
  for (const item of items) {
    const top = topOf(item.id);
    if (top === undefined) continue;
    if (top <= READING_LINE) active = item.id;
    else break;
  }
  return active;
};

/**
 * Brings a section to the top of the window and keeps it there while examples above it mount and change
 * height (the overview pages mount an example when it comes near the window), until the reader scrolls.
 */
const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  const align = () => target.scrollIntoView({ behavior: 'auto', block: 'start' });
  align();
  const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const until = performance.now() + 1500;
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const name of ['wheel', 'touchstart', 'keydown', 'pointerdown'])
      window.removeEventListener(name, stop);
  };
  const follow = () => {
    if (Math.abs(target.getBoundingClientRect().top - margin) > 2) align();
    if (performance.now() < until) frame = requestAnimationFrame(follow);
    else stop();
  };
  for (const name of ['wheel', 'touchstart', 'keydown', 'pointerdown'])
    window.addEventListener(name, stop, { passive: true, once: true });
  frame = requestAnimationFrame(follow);
};

/**
 * The table of contents of an overview page. Beside the content it stays in view and scrolls on its own; where
 * there is no room beside the content (see `overview.css`) it is a collapsed "Contents" control at the top.
 */
export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, title = 'Content' }) => {
  const [active, setActive] = React.useState<string | undefined>(items[0]?.id);
  const [open, setOpen] = React.useState(false);
  const bodyId = React.useId();
  const body = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!items.length) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      setActive(
        activeItemId(items, (id) => document.getElementById(id)?.getBoundingClientRect().top),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  // The active link is kept in view by scrolling the list only: `scrollIntoView` would move the page too.
  React.useEffect(() => {
    const list = body.current;
    const link = active
      ? list?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`)
      : null;
    if (!list || !link || list.scrollHeight <= list.clientHeight) return;
    const start = link.getBoundingClientRect().top - list.getBoundingClientRect().top;
    const end = start + link.offsetHeight;
    if (start < 0) list.scrollTop += start - 8;
    else if (end > list.clientHeight) list.scrollTop += end - list.clientHeight + 8;
  }, [active]);

  const grouped = React.useMemo(() => {
    const groups: Array<{ group?: string; items: TocItem[] }> = [];
    for (const item of items) {
      const last = groups[groups.length - 1];
      if (last && (!item.group || last.group === item.group)) last.items.push(item);
      else groups.push({ group: item.group, items: [item] });
    }
    return groups;
  }, [items]);

  return (
    <nav aria-label={title} className="pb-toc" data-open={open}>
      <Button
        variant="outline"
        buttonSize="sm"
        className="pb-toc-toggle"
        icon={<List aria-hidden="true" />}
        iconAfter={<ChevronDown aria-hidden="true" className="pb-toc-chevron" />}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((value) => !value)}
      >
        Contents
      </Button>
      <div id={bodyId} ref={body} className="pb-toc-body">
        <Button
          variant="ghost"
          buttonSize="sm"
          className="pb-toc-top"
          icon={<ArrowUp aria-hidden="true" />}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'auto' });
            setOpen(false);
          }}
        >
          Top of page
        </Button>
        <div className="mb-4 px-3 text-[11px] font-mono uppercase tracking-[0.28em] pb-muted">
          {title}
        </div>
        <div className="flex flex-col">
          {grouped.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-5 last:mb-0">
              {group.group ? (
                <div className="mb-2 px-3 text-[13px] font-semibold pb-accent">{group.group}</div>
              ) : null}
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {group.items.map((item) => {
                  const isActive = item.id === active;
                  return (
                    <li key={item.id} className="m-0 p-0">
                      <a
                        href={`#${item.id}`}
                        aria-current={isActive ? 'location' : undefined}
                        onClick={(event) => {
                          event.preventDefault();
                          setOpen(false);
                          scrollToSection(item.id);
                          setActive(item.id);
                        }}
                        className={[
                          'block rounded-xl px-4 py-2 text-[13px] leading-5 no-underline transition-colors',
                          item.nested ? 'pl-6 text-[12px]' : '',
                          isActive
                            ? 'border-l-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] pb-accent'
                            : 'border-l-2 border-transparent pb-muted hover:text-foreground',
                        ].join(' ')}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};
