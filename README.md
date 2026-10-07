# @oc-tech/omni-ui-components

React UI components from Omni Technology Solutions.

```sh
pnpm add @oc-tech/omni-ui-components
```

```tsx
import { Button } from '@oc-tech/omni-ui-components';

export function Example() {
  return <Button>Continue</Button>;
}
```

Styles are included by the main entry point. For CSS-only use:

```css
@import '@oc-tech/omni-ui-components/styles.css';
```

## Install and import

```sh
pnpm add @oc-tech/omni-ui-components
```

JavaScript (components, hooks and types; styles are included):

```tsx
import { Button } from '@oc-tech/omni-ui-components';
```

Stylesheet only (for example from a global CSS file):

```css
@import '@oc-tech/omni-ui-components/styles.css';
```

Schema-driven forms live in a separate entry point:

```tsx
import { DynamicForm } from '@oc-tech/omni-ui-components/dynamic-form';
```

React 18.3+ or React 19 is required.

## Visual regression tests

`pnpm test:visual` compares 10 captures of the Native App stories (dark and light) with the baselines in
`visual/__screenshots__/`, named per platform (`*-chromium-darwin.png`, `*-chromium-linux.png`). CI runs it on `ubuntu-24.04`
against the `-linux` files.

- macOS baselines: `pnpm test:visual:update`, review the changed PNGs, commit.
- Linux baselines (no Docker needed): on a branch, temporarily replace the `pnpm test:visual` step of
  `.github/workflows/verify.yml` with `pnpm test:visual:update` plus an `actions/upload-artifact@v4` step for
  `visual/__screenshots__/*-linux.png`, open a draft PR, `gh run download <run-id> -n <artifact> -D visual/__screenshots__`,
  commit the PNGs, then restore the plain step.
