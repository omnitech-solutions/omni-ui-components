import { setProjectAnnotations } from '@storybook/react-vite';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import * as previewAnnotations from './preview';
import { A11Y_DEFERRED } from './a11y-deferred';

// `pnpm test:a11y` sets VITE_OUI_A11Y=1 (and VITE_OUI_THEME=dark|light): every story then also runs axe
// (preview.tsx sets `a11y.test: 'error'`, so any violation fails that story). `pnpm test:stories` leaves it off.
const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const theme = env.VITE_OUI_THEME === 'light' ? 'light' : 'dark';

// Known, reported violations (see a11y-deferred.ts) are switched off for exactly that story and rule, nothing else.
const deferA11y = {
  beforeEach: (ctx: any) => {
    const { name, parameters } = ctx as { name: string; parameters: Record<string, any> };
    const rules = A11Y_DEFERRED[`${String(ctx.title)}::${name}`];
    if (!rules) return;
    const a11y = (parameters.a11y ?? {}) as { config?: { rules?: unknown[] } };
    parameters.a11y = { ...a11y, config: { ...a11y.config, rules: [...(a11y.config?.rules ?? []), ...rules.map((ruleId) => ({ id: ruleId, enabled: false }))] } };
  },
};

// Apply the Storybook preview (decorators, globals) to every story run by the Vitest browser project.
setProjectAnnotations([...(env.VITE_OUI_A11Y ? [a11yAddonAnnotations, deferA11y] : []), previewAnnotations, { initialGlobals: { theme } }]);
