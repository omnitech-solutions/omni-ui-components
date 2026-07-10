export type Selector<T, V> = keyof T | ((item: T) => V);
export type ProjectMapping<T, R> = { [K in keyof R]: Selector<T, R[K]> };

export const pluck = <T, V>(item: T, selector: Selector<T, V>): V =>
  typeof selector === 'function' ? (selector as (i: T) => V)(item) : (item[selector] as unknown as V);

export const project = <T, R extends Record<string, unknown>>(items: readonly T[], mapping: ProjectMapping<T, R>): R[] =>
  items.map((item) => {
    const out = {} as R;
    (Object.keys(mapping) as (keyof R)[]).forEach((key) => {
      out[key] = pluck(item, mapping[key]);
    });
    return out;
  });
