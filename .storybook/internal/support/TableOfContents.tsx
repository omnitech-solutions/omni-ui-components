import * as React from 'react';
import { ArrowUp } from 'lucide-react';

export interface TocItem {
  id: string;
  label: string;
  group?: string;
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
    <nav aria-label={title} className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
        className="mb-3 inline-flex w-full cursor-pointer items-center gap-2 rounded-md bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <ArrowUp aria-hidden="true" className="size-3.5" />
        Top of page
      </button>
      <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">{title}</div>
      <div className="flex flex-col">
        {grouped.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4 last:mb-0">
            {group.group ? <div className="mb-1 px-3 text-xs font-semibold text-sky-200">{group.group}</div> : null}
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
                        'block rounded-md border-l-2 px-3 py-1 text-sm no-underline transition-colors',
                        isActive
                          ? 'border-sky-400 bg-sky-500/10 text-sky-300'
                          : 'border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground',
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
