/**
 * The name a React element's type is written with in JSX. `React.memo` and `React.forwardRef` wrappers are looked
 * through (Storybook prints them as `React.Memo` and `React.ForwardRef`), and the `Inner` / `Impl` suffix the
 * library gives the function it wraps is dropped.
 */
type Named = {
  displayName?: string;
  name?: string;
  render?: Named;
  type?: Named;
  $$typeof?: symbol;
  _context?: Named;
};

const SYMBOL_NAMES: Record<string, string> = {
  'react.fragment': 'React.Fragment',
  'react.suspense': 'React.Suspense',
  'react.strict_mode': 'React.StrictMode',
  'react.profiler': 'React.Profiler',
};

export const componentNameOf = (type: unknown): string => {
  if (typeof type === 'string') return type;
  if (typeof type === 'symbol') return SYMBOL_NAMES[type.description ?? ''] ?? 'React.Fragment';
  let current = type as Named | undefined;
  for (let depth = 0; current && depth < 5; depth += 1) {
    if (current.displayName) return current.displayName;
    const name = typeof current === 'function' ? current.name : undefined;
    if (name && name !== '_default') return name.replace(/(?:Inner|Impl)$/, '') || name;
    if (current.$$typeof?.description === 'react.provider' || current._context)
      return `${current._context?.displayName ?? 'Context'}.Provider`;
    current = current.render ?? current.type;
  }
  return 'Component';
};
