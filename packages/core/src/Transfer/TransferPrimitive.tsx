import { cn } from 'lib/utils';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import * as React from 'react';
import { IconButton } from '../IconButton';
import { useControllableState } from '../lib/use-controllable-state';
import { useStableId } from '../lib/use-stable-id';
import {
  DEFAULT_TRANSFER_LABELS,
  type TransferDirection,
  type TransferItem,
  type TransferPrimitiveProps,
} from './Transfer.types';
import { TransferPanel } from './TransferPanel';

const NO_KEYS: string[] = [];
const TO_TARGET_ICON = <ChevronRight aria-hidden="true" />;
const TO_SOURCE_ICON = <ChevronLeft aria-hidden="true" />;
const REMOVE_ICON = <X aria-hidden="true" />;

function TransferPrimitiveInner<T extends TransferItem>(
  {
    id: idProp,
    name,
    dataSource,
    targetKeys: targetKeysProp,
    defaultTargetKeys = NO_KEYS,
    onChange,
    searchable,
    filterOption,
    oneWay,
    disabled,
    readOnly,
    required,
    invalid,
    listHeight = '12rem',
    moveToTargetIcon = TO_TARGET_ICON,
    moveToSourceIcon = TO_SOURCE_ICON,
    removeIcon = REMOVE_ICON,
    labels: labelsProp,
    className,
    'data-testid': testIdProp,
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
  }: TransferPrimitiveProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const fallbackId = useStableId('oui-transfer');
  const id = idProp ?? fallbackId;
  const testId = testIdProp || idProp;
  const labels = { ...DEFAULT_TRANSFER_LABELS, ...labelsProp };
  const locked = Boolean(disabled) || Boolean(readOnly);

  const [targetKeys, setTargetKeys] = useControllableState(targetKeysProp, defaultTargetKeys);
  const [pickedSource, setPickedSource] = React.useState<string[]>(NO_KEYS);
  const [pickedTarget, setPickedTarget] = React.useState<string[]>(NO_KEYS);

  // The two lists: the source keeps the data order, the target the order items were moved in.
  const byKey = new Map(dataSource.map((item) => [item.key, item]));
  const inTarget = new Set(targetKeys);
  const sourceItems = dataSource.filter((item) => !inTarget.has(item.key));
  const targetItems = targetKeys.flatMap((key) => byKey.get(key) ?? []);
  // A selection only counts while its row is still in that list and can move.
  const movable = (items: T[], picked: string[]) =>
    items.filter((item) => !item.disabled && picked.includes(item.key));
  const movingRight = movable(sourceItems, pickedSource);
  const movingLeft = movable(targetItems, pickedTarget);

  const commit = (next: string[], moved: T[], direction: TransferDirection) => {
    setTargetKeys(next);
    onChange?.(next, moved, direction);
  };
  const moveRight = () => {
    if (locked || movingRight.length === 0) return;
    commit([...targetKeys, ...movingRight.map((item) => item.key)], movingRight, 'right');
    setPickedSource(NO_KEYS);
  };
  const moveLeft = (moved: T[] = movingLeft) => {
    if (locked || moved.length === 0) return;
    const gone = new Set(moved.map((item) => item.key));
    commit(
      targetKeys.filter((key) => !gone.has(key)),
      moved,
      'left',
    );
    setPickedTarget(NO_KEYS);
  };

  const shared = {
    searchable,
    filterOption: filterOption as ((query: string, item: TransferItem) => boolean) | undefined,
    disabled,
    readOnly,
    invalid,
    listHeight,
    removeIcon,
    labels,
    testId,
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would need a legend; the group is named by the caller's label
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      data-slot="transfer"
      data-state={disabled ? 'disabled' : readOnly ? 'readonly' : invalid ? 'invalid' : 'idle'}
      data-testid={testId ? `${testId}-root` : undefined}
      className={cn(
        'flex w-full items-stretch gap-3 font-[family-name:var(--oui-font-sans)]',
        className,
      )}
    >
      <TransferPanel
        {...shared}
        side="source"
        listId={id}
        listRef={ref}
        title={labels.sourceTitle}
        searchLabel={labels.searchSource}
        items={sourceItems}
        selected={movingRight.map((item) => item.key)}
        onSelectedChange={setPickedSource}
        onMove={moveRight}
        required={required}
        describedBy={ariaDescribedBy}
      />
      <div data-slot="transfer-actions" className="flex flex-col justify-center gap-2">
        <IconButton
          variant="outline"
          iconSize="sm"
          icon={moveToTargetIcon}
          label={labels.moveToTarget}
          disabled={locked || movingRight.length === 0}
          onClick={moveRight}
        />
        {oneWay ? null : (
          <IconButton
            variant="outline"
            iconSize="sm"
            icon={moveToSourceIcon}
            label={labels.moveToSource}
            disabled={locked || movingLeft.length === 0}
            onClick={() => moveLeft()}
          />
        )}
      </div>
      <TransferPanel
        {...shared}
        side="target"
        listId={`${id}-target`}
        title={labels.targetTitle}
        searchLabel={labels.searchTarget}
        items={targetItems}
        selected={oneWay ? NO_KEYS : movingLeft.map((item) => item.key)}
        onSelectedChange={setPickedTarget}
        onMove={() => moveLeft()}
        onRemove={
          oneWay
            ? (item) => moveLeft(targetItems.filter((each) => each.key === item.key))
            : undefined
        }
      />
      {name
        ? targetKeys.map((key) => (
            <input key={key} type="hidden" name={name} value={key} disabled={disabled} />
          ))
        : null}
    </div>
  );
}

/**
 * Raw Omni Transfer primitive: a source and a target listbox with move buttons between them. The value is
 * `targetKeys`. Each list is one tab stop: Up / Down / Home / End move the active row, Space selects it,
 * Ctrl or Cmd + A selects all, Enter moves the selection across. Items are data and reach `onChange` by reference.
 *
 * @example
 * <TransferPrimitive aria-label="Teams" dataSource={teams} defaultTargetKeys={['finance']}
 *   onChange={(next, moved, direction) => save(next)} />
 */
export const TransferPrimitive = React.forwardRef(TransferPrimitiveInner) as (<
  T extends TransferItem = TransferItem,
>(
  props: TransferPrimitiveProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null) & { displayName?: string };
TransferPrimitive.displayName = 'TransferPrimitive';
