import * as React from 'react';

export type ThemeMode = 'light' | 'dark';

export type ThemeConfig = {
  mode?: ThemeMode;
  algorithm?: unknown;
  token?: Record<string, string | number>;
  components?: Record<string, Record<string, string | number>>;
  inherit?: boolean;
  tokens?: Record<string, string | number>;
};

export interface ConfigProviderProps {
  children?: React.ReactNode;
  theme?: ThemeConfig;
  componentSize?: 'small' | 'middle' | 'large';
  direction?: 'ltr' | 'rtl';
  prefixCls?: string;
  getPopupContainer?: (trigger?: HTMLElement) => HTMLElement;
  locale?: unknown;
  wave?: { disabled?: boolean };
  virtual?: boolean;
  warning?: { strict?: boolean };
  csp?: { nonce?: string };
}

const cssVariableName = (name: string) => (name.startsWith('--') ? name : `--${name}`);

export const ConfigProvider = ({ children, theme, direction = 'ltr' }: ConfigProviderProps) => {
  const mode = theme?.mode ?? 'light';
  const tokens = React.useMemo(
    () => ({ ...theme?.tokens, ...theme?.token }),
    [theme?.token, theme?.tokens],
  );

  React.useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.dataset.theme;
    const previousDirection = root.dir;
    const previousValues = new Map<string, string>();

    root.dataset.theme = mode;
    if (direction) root.dir = direction;

    for (const [name, value] of Object.entries(tokens ?? {})) {
      const variable = cssVariableName(name);
      previousValues.set(variable, root.style.getPropertyValue(variable));
      root.style.setProperty(variable, String(value));
    }

    return () => {
      if (previousTheme) root.dataset.theme = previousTheme;
      else delete root.dataset.theme;
      root.dir = previousDirection;

      for (const [name, value] of previousValues) {
        if (value) root.style.setProperty(name, value);
        else root.style.removeProperty(name);
      }
    };
  }, [direction, mode, tokens]);

  return <>{children}</>;
};
