export interface CssToken {
  name: string;
  value: string;
}

type CssRuleWithChildren = CSSRule & { cssRules?: CSSRuleList };

const isOwnSheet = (sheet: CSSStyleSheet): boolean => {
  try {
    void sheet.cssRules;
    return true;
  } catch {
    return false;
  }
};

export const looksLikeColor = (value: string): boolean => /^(#|rgb|rgba|hsl|hsla|oklch|color|var\()/i.test(value.trim());

const hasNestedRules = (rule: CSSRule): rule is CssRuleWithChildren => 'cssRules' in rule && Boolean((rule as CssRuleWithChildren).cssRules);

const collectTokensFromRules = (rules: CSSRuleList | CSSRule[], selectorMatcher: (selector: string) => boolean, out: Record<string, string>) => {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      if (!selectorMatcher(rule.selectorText)) continue;
      const style = rule.style;
      for (let index = 0; index < style.length; index += 1) {
        const name = style.item(index);
        if (!name.startsWith('--')) continue;
        const value = style.getPropertyValue(name).trim();
        if (!value) continue;
        out[name] = value;
      }
      continue;
    }

    if (hasNestedRules(rule) && rule.cssRules) {
      collectTokensFromRules(rule.cssRules, selectorMatcher, out);
    }
  }
};

export const readCssTokens = (selectorMatcher: (selector: string) => boolean = (selector) => selector === ':root'): CssToken[] => {
  const out: Record<string, string> = {};
  const sheets = Array.from(document.styleSheets) as CSSStyleSheet[];

  for (const sheet of sheets) {
    if (!isOwnSheet(sheet)) continue;
    collectTokensFromRules(sheet.cssRules, selectorMatcher, out);
  }

  return Object.keys(out)
    .sort()
    .map((name) => ({ name, value: out[name] }));
};

export const resolveCssVar = (name: string, scope: Element = document.documentElement): string => getComputedStyle(scope).getPropertyValue(name).trim();
