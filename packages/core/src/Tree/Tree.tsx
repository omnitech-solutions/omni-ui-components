import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from 'lib/utils';

export interface TreeNode {
  key: string;
  title: React.ReactNode;
  children?: TreeNode[];
}

export interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  treeData: TreeNode[];
}

function TreeBranch({ node, level = 1 }: { node: TreeNode; level?: number }) {
  const [open, setOpen] = React.useState(true);
  const hasChildren = Boolean(node.children?.length);

  return (
    <div role="treeitem" aria-expanded={hasChildren ? open : undefined} aria-level={level} className="space-y-1">
      <button
        type="button"
        onClick={() => {
          if (hasChildren) setOpen((value) => !value);
        }}
        className={cn(
          'group flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-sm transition-colors',
          'hover:border-[var(--oui-border-field)] hover:bg-muted/30',
          hasChildren ? 'text-[var(--oui-foreground)]' : 'text-[var(--oui-foreground-muted)]',
        )}
      >
        <span
          className={cn(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[var(--oui-foreground-muted)] transition-colors',
            hasChildren && 'group-hover:bg-background group-hover:text-[var(--oui-foreground)]',
          )}
          aria-hidden="true"
        >
          {hasChildren ? open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-[var(--oui-border-field)]" />}
        </span>
        <span className="truncate">{node.title}</span>
      </button>
      {hasChildren && open ? (
        <div role="group" className="ml-4 border-l border-[var(--oui-border-field)] pl-3">
          <div className="space-y-1">
            {node.children!.map((child) => (
              <TreeBranch key={child.key} node={child} level={level + 1} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export const Tree = ({ treeData, className, ...props }: TreeProps) => (
  <div
    role="tree"
    className={cn('space-y-1 rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-2 shadow-xs', className)}
    {...props}
  >
    {treeData.map((node) => (
      <TreeBranch key={node.key} node={node} />
    ))}
  </div>
);
