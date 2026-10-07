import * as React from 'react';

export type CascaderOption = { value: string; label: React.ReactNode; children?: CascaderOption[]; disabled?: boolean };
export interface CascaderProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'defaultValue' | 'onChange'> { options: CascaderOption[]; value?: string[]; defaultValue?: string[]; onChange?: (value: string[], selectedOptions: CascaderOption[]) => void; }
const flatten = (options: CascaderOption[], path: string[] = []): Array<{ option: CascaderOption; path: string[] }> => options.flatMap((option) => option.children?.length ? flatten(option.children, [...path, option.value]) : [{ option, path: [...path, option.value] }]);
const optionsAlong = (options: CascaderOption[], path: string[]): CascaderOption[] => {
  const chain: CascaderOption[] = [];
  let level = options;
  for (const key of path) {
    const found = level.find((option) => option.value === key);
    if (!found) break;
    chain.push(found);
    level = found.children ?? [];
  }
  return chain;
};
export const Cascader = React.forwardRef<HTMLSelectElement, CascaderProps>(({ options, value, defaultValue, onChange, ...props }, ref) => {
  const leaves = flatten(options);
  return <select ref={ref} value={value?.at(-1) ?? undefined} defaultValue={defaultValue?.at(-1)} onChange={(event) => { const selected = leaves.find(({ option }) => option.value === event.target.value); if (selected) onChange?.(selected.path, optionsAlong(options, selected.path)); }} {...props}>{leaves.map(({ option, path }) => <option key={path.join('/')} value={option.value} disabled={option.disabled}>{optionsAlong(options, path).slice(0, -1).map((ancestor) => <React.Fragment key={ancestor.value}>{ancestor.label} / </React.Fragment>)}{option.label}</option>)}</select>;
});
Cascader.displayName = 'Cascader';
