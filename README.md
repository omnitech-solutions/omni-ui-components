# Omni UI Components

PNPM workspace for reusable Omni React UI components.

## Packages

- `@omnitech/omni-ui-core`: component primitives, forms, dynamic-form, stories, factories, and Vite tests.

## Commands

```sh
pnpm install
pnpm test
pnpm build
pnpm storybook
```

## Theme Tokens

Import the package styles once, then set the Ant Design-style seed tokens:

```css
@import '@omnitech/omni-ui-core/styles.css';

:root {
  --oui-primary: #1677ff;
  --oui-background: #ffffff;
  --oui-background-dark: #000000;
}
```

`--oui-primary` derives a 10-step primary ramp and semantic colors automatically. Override `--oui-primary-1` through `--oui-primary-10` only when exact palette stops are needed.
