import type { CascaderOption, CascaderProps } from '@oc-tech/omni-ui-components/Cascader';

/** A consumer's own option: the base option plus the data the product needs back in `onChange`. */
export interface StackOption extends CascaderOption {
  /** Years the candidate has used it; travels with the option untouched. */
  years?: number;
  children?: StackOption[];
}

export const SAMPLE_STACK: StackOption[] = [
  {
    value: 'frontend',
    label: 'Frontend',
    children: [
      { value: 'react', label: 'React', years: 8 },
      { value: 'vue', label: 'Vue', disabled: true },
      {
        value: 'styling',
        label: 'Styling',
        children: [
          { value: 'tailwind', label: 'Tailwind', years: 4 },
          { value: 'css-modules', label: 'CSS Modules', years: 2 },
        ],
      },
    ],
  },
  {
    value: 'backend',
    label: 'Backend',
    children: [
      { value: 'hono', label: 'Hono', years: 2 },
      { value: 'rails', label: 'Rails', years: 10 },
    ],
  },
  { value: 'devops', label: 'DevOps', disabled: true, children: [{ value: 'k8s', label: 'K8s' }] },
  { value: 'postgres', label: 'PostgreSQL', years: 9 },
];

/** Kept for the earlier fixture name: a one-branch tree. */
export const cascaderFixture = (): CascaderOption[] => [
  { value: 'frontend', label: 'Frontend', children: [{ value: 'react', label: 'React' }] },
];

/** Build `<Cascader>` props for stories and tests. */
export const cascaderPropsFactory = (
  overrides: Partial<CascaderProps<StackOption>> = {},
): CascaderProps<StackOption> => ({
  id: 'demo-cascader',
  label: 'Stack',
  description: 'Pick the technology the question is about.',
  options: SAMPLE_STACK,
  placeholder: 'Choose a technology',
  ...overrides,
});
