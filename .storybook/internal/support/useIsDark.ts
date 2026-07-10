import * as React from 'react';

/**
 * Tracks the ambient Storybook theme by observing `data-theme` on
 * `<html>` and `<body>`. Shared by both code panels so theme switches
 * can't leave one on the wrong Prism palette.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const read = () => {
      const root = document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme');
      setIsDark(root === 'dark');
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}
