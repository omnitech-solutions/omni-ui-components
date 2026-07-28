export const warning = (condition: unknown, message: string): void => {
  if (!condition && typeof console !== 'undefined') console.warn(`[omni-ui-components] ${message}`);
};

export const isNil = (value: unknown): value is null | undefined => value == null;

export const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);
