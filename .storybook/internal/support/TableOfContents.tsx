import * as React from 'react';
import { ArrowUp } from 'lucide-react';

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

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, title = 'Content' }) => {
  const [active, setActive] = React.useState<string | undefined>(items[0]?.id);

  React.useEffect(() => {
    if (!items.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );
    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  const grouped = React.useMemo(() => {
    const groups: Array<{ group?: string; items: TocItem[] }> = [];
    for (const item of items) {
      const last = groups[groups.length - 1];
      if (last && last.group === item.group) last.items.push(item);
      else groups.push({ group: item.group, items: [item] });
    }
    return groups;
  }, [items]);

  return (
    <nav aria-label={title} className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto pr-2">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
        className="mb-6 inline-flex w-full cursor-pointer items-center gap-2 rounded-md bg-transparent px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowUp aria-hidden="true" className="size-3.5" />
        Top of page
      </button>
      <div className="mb-4 px-3 text-[11px] font-mono uppercase tracking-[0.28em] text-muted-foreground/75">{title}</div>
      <div className="flex flex-col">
        {grouped.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-5 last:mb-0">
            {group.group ? <div className="mb-2 px-3 text-[13px] font-semibold text-[var(--color-primary)]">{group.group}</div> : null}
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {group.items.map((item) => {
                const isActive = item.id === active;
                return (
                  <li key={item.id} className="m-0 p-0">
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
                        setActive(item.id);
                      }}
                      className={[
                        'block rounded-xl px-4 py-2 text-[13px] leading-5 no-underline transition-colors',
                        item.nested ? 'pl-6 text-[12px]' : '',
                        isActive
                          ? 'border-l-2 border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_18%,transparent)] text-[var(--color-primary)]'
                          : 'border-l-2 border-transparent text-muted-foreground hover:text-foreground',
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
    </nav>
  );
};
