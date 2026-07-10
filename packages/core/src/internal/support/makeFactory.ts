export interface Variant<T> {
  name: string;
  args: Partial<T>;
}

export const makeFactory =
  <T extends object>(defaults: T) =>
  (overrides: Partial<T> = {}): T => ({
    ...defaults,
    ...overrides,
  });
