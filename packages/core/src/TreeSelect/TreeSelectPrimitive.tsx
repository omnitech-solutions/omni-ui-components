import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { cn } from 'lib/utils';
import { Check, ChevronDown, ChevronRight, X } from 'lucide-react';
import * as React from 'react';
import { inputVariants } from '../Input/Input.variants';
import { useControllableState } from '../lib/use-controllable-state';
import { useStableId } from '../lib/use-stable-id';
import {
  DEFAULT_TREE_SELECT_LABELS,
  type TreeSelectNode,
  type TreeSelectPrimitiveProps,
} from './TreeSelect.types';
import { treeSelectItemVariants, treeSelectTriggerClasses } from './TreeSelect.variants';

interface IndexEntry<T> {
  node: T;
  parent: string | null;
}

interface Row<T> {
  node: T;
  key: string;
  level: number;
  parent: string | null;
  hasChildren: boolean;
  expanded: boolean;
  posInSet: number;
  setSize: number;
}

const childrenOf = <T extends TreeSelectNode>(node: T): T[] => (node.children ?? []) as T[];

/** Every node by value, with its parent's value, for lookups that do not depend on what is open. */
function indexTree<T extends TreeSelectNode>(
  nodes: T[],
  parent: string | null = null,
  into: Map<string, IndexEntry<T>> = new Map(),
): Map<string, IndexEntry<T>> {
  for (const node of nodes) {
    into.set(node.value, { node, parent });
    indexTree(childrenOf(node), node.value, into);
  }
  return into;
}

/** The rows on screen, in order: a node, then its children when it is open. */
function visibleRows<T extends TreeSelectNode>(
  nodes: T[],
  expanded: Set<string>,
  level = 1,
  parent: string | null = null,
): Row<T>[] {
  return nodes.flatMap((node, position) => {
    const children = childrenOf(node);
    const isOpen = children.length > 0 && expanded.has(node.value);
    const row: Row<T> = {
      node,
      key: node.value,
      level,
      parent,
      hasChildren: children.length > 0,
      expanded: isOpen,
      posInSet: position + 1,
      setSize: nodes.length,
    };
    return isOpen ? [row, ...visibleRows(children, expanded, level + 1, node.value)] : [row];
  });
}

function TreeSelectPrimitiveRender<T extends TreeSelectNode = TreeSelectNode>(
  props: TreeSelectPrimitiveProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const {
    id,
    name,
    treeData,
    placeholder,
    disabled,
    readOnly,
    required,
    invalid,
    variant,
    inputSize,
    expandedKeys,
    defaultExpandedKeys,
    onExpandedChange,
    defaultExpandAll = false,
    selectableParents = true,
    allowClear = false,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    container,
    labels: labelsProp,
    chevronIcon = <ChevronDown />,
    toggleIcon = <ChevronRight />,
    checkIcon = <Check />,
    clearIcon = <X />,
    className,
    'data-testid': dataTestId,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  } = props;
  const multiple = props.mode === 'multiple';
  const labels = { ...DEFAULT_TREE_SELECT_LABELS, ...labelsProp };
  const testId = dataTestId || id;
  const treeId = useStableId('oui-tree-select-tree');
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>());

  // Value: one string or a list, kept as a list of chosen values inside.
  const [rawValue, setRawValue] = useControllableState<string | string[]>(
    props.value,
    props.defaultValue ?? (multiple ? [] : ''),
  );
  const selectedKeys = React.useMemo(
    () => (Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : []),
    [rawValue],
  );
  const selectedSet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const index = React.useMemo(() => indexTree(treeData), [treeData]);
  const nodesOf = (keys: string[]): T[] =>
    keys.flatMap((key) => {
      const entry = index.get(key);
      return entry ? [entry.node] : [];
    });

  // Open parents: by default only what is needed to show the current value.
  const [initialExpanded] = React.useState<string[]>(() => {
    if (defaultExpandedKeys) return defaultExpandedKeys;
    if (defaultExpandAll) {
      return [...index.values()]
        .filter((entry) => childrenOf(entry.node).length > 0)
        .map((entry) => entry.node.value);
    }
    const ancestors = new Set<string>();
    for (const key of selectedKeys) {
      let parent = index.get(key)?.parent ?? null;
      while (parent !== null) {
        ancestors.add(parent);
        parent = index.get(parent)?.parent ?? null;
      }
    }
    return [...ancestors];
  });
  const [expandedList, setExpandedList] = useControllableState<string[]>(
    expandedKeys,
    initialExpanded,
  );
  const rows = React.useMemo(
    () => visibleRows(treeData, new Set(expandedList)),
    [treeData, expandedList],
  );

  // The one row in the tab order: the last focused row, else the chosen one, else the first.
  const [activeState, setActiveState] = React.useState<string | null>(null);
  const activeKey = rows.some((row) => row.key === activeState)
    ? activeState
    : ((rows.find((row) => selectedSet.has(row.key)) ?? rows[0])?.key ?? null);

  const [open, setOpenState] = useControllableState<boolean>(openProp, defaultOpen, onOpenChange);
  const locked = Boolean(disabled) || Boolean(readOnly);
  const isOpen = open && !locked;
  const setOpen = (next: boolean) => {
    if (next && locked) return;
    if (next) setActiveState(null);
    setOpenState(next);
  };

  const commit = (next: string[]) => {
    if (props.mode === 'multiple') {
      setRawValue(next);
      props.onChange?.(next, nodesOf(next));
      return;
    }
    const key = next[0] ?? '';
    setRawValue(key);
    props.onChange?.(key, index.get(key)?.node);
  };

  const setExpanded = (row: Row<T>, expand: boolean) => {
    const next = expand
      ? [...expandedList.filter((key) => key !== row.key), row.key]
      : expandedList.filter((key) => key !== row.key);
    setExpandedList(next);
    onExpandedChange?.(next, row.node);
  };

  const focusRow = (row: Row<T> | undefined) => {
    if (!row) return;
    setActiveState(row.key);
    itemRefs.current.get(row.key)?.focus();
  };

  const choose = (row: Row<T>) => {
    if (row.node.disabled) return;
    if (row.hasChildren && !selectableParents) {
      setExpanded(row, !row.expanded);
      return;
    }
    if (multiple) {
      commit(
        selectedSet.has(row.key)
          ? selectedKeys.filter((key) => key !== row.key)
          : [...selectedKeys, row.key],
      );
      return;
    }
    commit([row.key]);
    setOpen(false);
  };

  const onTreeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const position = rows.findIndex((row) => row.key === activeKey);
    const row = rows[position];
    if (!row) return;
    switch (event.key) {
      case 'ArrowDown':
        focusRow(rows[position + 1]);
        break;
      case 'ArrowUp':
        focusRow(rows[position - 1]);
        break;
      case 'Home':
        focusRow(rows[0]);
        break;
      case 'End':
        focusRow(rows[rows.length - 1]);
        break;
      case 'ArrowRight':
        if (!row.hasChildren) break;
        if (row.expanded) focusRow(rows[position + 1]);
        else setExpanded(row, true);
        break;
      case 'ArrowLeft':
        if (row.expanded) setExpanded(row, false);
        else focusRow(rows.find((candidate) => candidate.key === row.parent));
        break;
      case 'Enter':
      case ' ':
        choose(row);
        break;
      case 'Tab':
        // The popover is portalled: Tab would leave to an unrelated place, so it closes back to the trigger.
        setOpen(false);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const chosenNodes = nodesOf(selectedKeys);
  const showClear = allowClear && selectedKeys.length > 0 && !locked;
  const setTriggerRef = (element: HTMLButtonElement | null) => {
    triggerRef.current = element;
    if (typeof ref === 'function') ref(element);
    else if (ref) ref.current = element;
  };

  return (
    <div data-slot="tree-select" className="relative w-full min-w-0">
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={setTriggerRef}
            type="button"
            id={id}
            role="combobox"
            aria-haspopup="tree"
            aria-expanded={isOpen}
            aria-controls={isOpen ? treeId : undefined}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-readonly={readOnly || undefined}
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            disabled={disabled}
            data-slot="tree-select-trigger"
            data-testid={testId}
            data-placeholder={chosenNodes.length === 0 ? 'true' : undefined}
            className={cn(
              inputVariants({ variant, inputSize }),
              treeSelectTriggerClasses,
              className,
            )}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
              event.preventDefault();
              setOpen(true);
            }}
          >
            <span data-slot="tree-select-value" className="min-w-0 flex-1 truncate">
              {chosenNodes.length === 0
                ? (placeholder ?? labels.placeholder)
                : chosenNodes.map((node, position) => (
                    <React.Fragment key={node.value}>
                      {position > 0 ? ', ' : null}
                      {node.title}
                    </React.Fragment>
                  ))}
            </span>
            {showClear ? <span aria-hidden="true" className="w-5 shrink-0" /> : null}
            <span
              aria-hidden="true"
              data-slot="tree-select-chevron"
              className="shrink-0 text-[var(--oui-foreground-muted)] [&_svg]:size-4"
            >
              {chevronIcon}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          // The tree is the popup: the surface itself carries no dialog role.
          role="presentation"
          align="start"
          container={container}
          data-slot="tree-select-content"
          className="w-[var(--radix-popover-trigger-width)] min-w-48 p-1 motion-reduce:animate-none motion-reduce:transition-none"
          onOpenAutoFocus={(event) => {
            const target = activeKey === null ? undefined : itemRefs.current.get(activeKey);
            if (!target) return;
            event.preventDefault();
            target.focus();
          }}
        >
          {rows.length === 0 ? (
            <p
              data-slot="tree-select-empty"
              className="px-2 py-1.5 font-[family-name:var(--oui-font-sans)] text-sm text-[var(--oui-foreground-muted)]"
            >
              {labels.empty}
            </p>
          ) : (
            <div
              role="tree"
              id={treeId}
              aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? labels.tree)}
              aria-labelledby={ariaLabelledBy}
              aria-multiselectable={multiple || undefined}
              data-slot="tree-select-tree"
              data-testid={testId ? `${testId}-tree` : undefined}
              className="max-h-64 overflow-y-auto"
              onKeyDown={onTreeKeyDown}
            >
              {rows.map((row) => {
                const chosen = selectedSet.has(row.key);
                const choosable = !row.node.disabled && (selectableParents || !row.hasChildren);
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard is handled once, on the tree
                  <div
                    key={row.key}
                    ref={(element) => {
                      if (element) itemRefs.current.set(row.key, element);
                      else itemRefs.current.delete(row.key);
                    }}
                    role="treeitem"
                    tabIndex={row.key === activeKey ? 0 : -1}
                    aria-level={row.level}
                    aria-posinset={row.posInSet}
                    aria-setsize={row.setSize}
                    aria-expanded={row.hasChildren ? row.expanded : undefined}
                    aria-selected={multiple || !choosable ? undefined : chosen}
                    aria-checked={multiple && choosable ? chosen : undefined}
                    aria-disabled={row.node.disabled || undefined}
                    data-slot="tree-select-item"
                    data-value={row.key}
                    data-testid={testId ? `${testId}-option-${row.key}` : undefined}
                    className={treeSelectItemVariants({ chosen: chosen && !multiple })}
                    style={{
                      paddingInlineStart: `calc(${row.level - 1} * var(--oui-field-padding-x) * 1.5 + 0.25rem)`,
                    }}
                    onFocus={() => setActiveState(row.key)}
                    onClick={() => {
                      setActiveState(row.key);
                      choose(row);
                    }}
                  >
                    {/* Pointer shortcut only: the keyboard uses ArrowRight and ArrowLeft on the row. */}
                    <span
                      aria-hidden="true"
                      data-slot="tree-select-toggle"
                      data-testid={testId ? `${testId}-toggle-${row.key}` : undefined}
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center text-[var(--oui-foreground-muted)] [&_svg]:size-4',
                        'transition-transform duration-[var(--oui-transition-duration)] motion-reduce:transition-none',
                        row.expanded && 'rotate-90',
                        !row.hasChildren && 'invisible',
                      )}
                      onClick={(event) => {
                        if (!row.hasChildren) return;
                        event.stopPropagation();
                        setExpanded(row, !row.expanded);
                      }}
                    >
                      {toggleIcon}
                    </span>
                    {multiple ? (
                      <span
                        aria-hidden="true"
                        data-slot="tree-select-checkbox"
                        className={cn(
                          'flex size-4 shrink-0 items-center justify-center rounded-[var(--oui-radius-field)] border border-[var(--oui-border-field)] [&_svg]:size-3',
                          chosen && 'border-primary bg-primary text-primary-foreground',
                          !choosable && 'invisible',
                        )}
                      >
                        {chosen ? checkIcon : null}
                      </span>
                    ) : null}
                    <span data-slot="tree-select-title" className="min-w-0 flex-1 truncate">
                      {row.node.title}
                    </span>
                    {!multiple && chosen ? (
                      <span
                        aria-hidden="true"
                        data-slot="tree-select-check"
                        className="shrink-0 [&_svg]:size-4"
                      >
                        {checkIcon}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </PopoverContent>
      </Popover>
      {showClear ? (
        <button
          type="button"
          aria-label={labels.clear}
          data-slot="tree-select-clear"
          data-testid={testId ? `${testId}-clear` : undefined}
          className={cn(
            'absolute right-8 top-1/2 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center',
            'rounded-[var(--oui-radius-field)] text-[var(--oui-foreground-muted)] outline-none [&_svg]:size-3.5',
            'hover:text-[var(--oui-foreground)]',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--oui-border-interactive)]',
          )}
          onClick={() => {
            commit([]);
            triggerRef.current?.focus();
          }}
        >
          {clearIcon}
        </button>
      ) : null}
      {name
        ? selectedKeys.map((key) => <input key={key} type="hidden" name={name} value={key} />)
        : null}
    </div>
  );
}

/**
 * Bare tree select: a field-like trigger (`role="combobox"`) that opens a popover holding a `role="tree"`.
 * Single mode commits one value and closes; multiple mode checks nodes independently and stays open.
 * Keyboard follows the WAI-ARIA tree pattern (arrows, Home, End, Enter, Space, Escape).
 */
export const TreeSelectPrimitive = React.forwardRef(TreeSelectPrimitiveRender) as (<
  T extends TreeSelectNode = TreeSelectNode,
>(
  props: TreeSelectPrimitiveProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null) & { displayName?: string };
TreeSelectPrimitive.displayName = 'TreeSelectPrimitive';
