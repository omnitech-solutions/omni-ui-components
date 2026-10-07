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
