import type { OmniSelectOption } from '../dynamic-form/lib/formContext';
import { pluck, type ProjectMapping, type Selector } from './project';

export { pluck, project } from './project';

export interface FormOption {
  value: string;
  label: string;
}

export const selectOptions = <T>(items: readonly T[], mapping: Partial<ProjectMapping<T, OmniSelectOption>>): OmniSelectOption[] =>
  items.map((item) => {
    const base: OmniSelectOption = { value: '', label: '', description: null, group: null, color: null, initials: null, avatarUrl: null, disabled: false };
    (Object.keys(mapping) as (keyof OmniSelectOption)[]).forEach((key) => {
      const selector = mapping[key];
      if (selector !== undefined) {
        (base as unknown as Record<string, unknown>)[key as string] = pluck(item, selector as Selector<T, unknown>);
      }
    });
    return base;
  });

export const formOptions = <T extends { id: string }>(items: readonly T[], mapping?: ProjectMapping<T, FormOption>): FormOption[] => {
  const resolved = (mapping ?? { value: 'id' as keyof T, label: 'name' as keyof T }) as ProjectMapping<T, FormOption>;
  return items.map((item) => ({ value: pluck(item, resolved.value), label: pluck(item, resolved.label) }));
};
