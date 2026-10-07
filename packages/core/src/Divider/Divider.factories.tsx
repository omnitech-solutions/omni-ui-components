import type { DividerProps } from '@oc-tech/omni-ui-components/Divider';
import type { Variant } from '../../internal/support/makeFactory';

/**
 * Class string that turns a vertical Divider into the 20px control separator
 * between control groups (`--oui-control-separator` height, neutral tone border).
 * No dedicated prop: the token and a class are the whole variation.
 */
export const CONTROL_SEPARATOR_CLASS =
  'h-[var(--oui-control-separator)] bg-[color:var(--oui-tone-neutral-border)]';

/** Build `<Divider>` props for standalone stories and tests. */
export const dividerPropsFactory = (overrides: Partial<DividerProps> = {}): DividerProps => ({
  ...overrides,
});

export const dividerVariants: Variant<DividerProps>[] = [
  { name: 'Default', args: {} },
  { name: 'With label', args: { children: 'OR' } },
  { name: 'Vertical', args: { orientation: 'vertical', className: 'h-full' } },
  {
    name: 'Control separator (20px)',
    args: { orientation: 'vertical', className: CONTROL_SEPARATOR_CLASS },
  },
];
