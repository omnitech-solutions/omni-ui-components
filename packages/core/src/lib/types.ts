/**
 * Render-prop opt-in for components that support delegating their root
 * element to a caller-supplied node.
 *
 * @example
 * <Input asChild><MyControl /></Input>
 */
export type AsChildProp = { asChild?: boolean };

/**
 * Common root-element prop bag for Omni UI components.
 *
 * @example
 * interface ButtonProps extends RootProps { …}
 */
export interface RootProps {
  className?: string;
  'data-testid'?: string;
}

/** Reflected on the root via `data-state` for downstream styling. */
export type InteractionState = 'idle' | 'hover' | 'focus' | 'disabled' | 'readonly' | 'invalid';
