/** Up to two initials of a name: `Ada Lovelace` is `AL`, `ada` is `A`, an empty name is ``. */
export const initialsOf = (name: string | undefined, max = 2): string =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => Array.from(word)[0] ?? '')
    .join('')
    .slice(0, max)
    .toUpperCase();
