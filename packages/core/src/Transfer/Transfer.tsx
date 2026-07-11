import * as React from 'react';

import { Button } from '../Button';
import { cn } from 'lib/utils';

export interface TransferItem {
  key: string;
  title: React.ReactNode;
}

export interface TransferProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  dataSource: TransferItem[];
  targetKeys?: string[];
  onChange?: (nextTargetKeys: string[]) => void;
}

export function Transfer({ dataSource, targetKeys = [], onChange, className, ...props }: TransferProps) {
  const source = dataSource.filter((item) => !targetKeys.includes(item.key));
  const target = dataSource.filter((item) => targetKeys.includes(item.key));
  const [selectedSource, setSelectedSource] = React.useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = React.useState<string[]>([]);

  const moveRight = () => onChange?.([...targetKeys, ...selectedSource]);
  const moveLeft = () => onChange?.(targetKeys.filter((key) => !selectedTarget.includes(key)));

  const renderList = (items: TransferItem[], selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => (
    <div className="min-h-64 flex-1 rounded-lg border">
      {items.map((item) => (
        <label key={item.key} className="flex items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0">
          <input
            type="checkbox"
            checked={selected.includes(item.key)}
            onChange={(event) => setSelected((current) => (event.target.checked ? [...current, item.key] : current.filter((key) => key !== item.key)))}
          />
          <span>{item.title}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className={cn('flex items-center gap-4', className)} {...props}>
      {renderList(source, selectedSource, setSelectedSource)}
      <div className="flex flex-col gap-2">
        <Button buttonSize="sm" onClick={moveRight} disabled={selectedSource.length === 0}>
          &gt;
        </Button>
        <Button buttonSize="sm" onClick={moveLeft} disabled={selectedTarget.length === 0}>
          &lt;
        </Button>
      </div>
      {renderList(target, selectedTarget, setSelectedTarget)}
    </div>
  );
}
