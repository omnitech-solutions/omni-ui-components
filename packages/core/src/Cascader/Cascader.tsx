import * as React from 'react';

export type CascaderOption = { value: string; label: React.ReactNode; children?: CascaderOption[]; disabled?: boolean };
export interface CascaderProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'onChange'> { options: CascaderOption[]; value?: string[]; defaultValue?: string[]; onChange?: (value: string[], selectedOptions: CascaderOption[]) => void; }
const flatten = (options: CascaderOption[], path: string[] = []): Array<{ option: CascaderOption; path: string[] }> => options.flatMap((option) => option.children?.length ? flatten(option.children, [...path, option.value]) : [{ option, path: [...path, option.value] }]);
export const Cascader = React.forwardRef<HTMLSelectElement, CascaderProps>(({ options, value, defaultValue, onChange, ...props }, ref) => {
  const leaves = flatten(options);
  return <select ref={ref} value={value?.at(-1) ?? undefined} defaultValue={defaultValue?.at(-1)} onChange={(event) => { const selected = leaves.find(({ option }) => option.value === event.target.value); if (selected) onChange?.(selected.path, selected.path.map((key) => leaves.find(({ option }) => option.value === key)?.option).filter(Boolean) as CascaderOption[]); }} {...props}>{leaves.map(({ option, path }) => <option key={path.join('/')} value={option.value} disabled={option.disabled}>{path.slice(0, -1).join(' / ')}{path.length > 1 ? ' / ' : ''}{option.label}</option>)}</select>;
});
Cascader.displayName = 'Cascader';
