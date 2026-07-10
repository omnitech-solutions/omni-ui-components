export function makeFactory<T>(defaults: T) {
  return (overrides: Partial<T> = {}): T => ({ ...defaults, ...overrides });
}

export interface Variant<T> {
  name: string;
  args: Partial<T>;
}
