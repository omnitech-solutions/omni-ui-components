import * as React from 'react';
import type { TableColumn } from '../Table.types';

export const TABLE_BREAKPOINT_QUERIES: Record<string, string> = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
};

export const allResponsiveScreens = (): Record<string, boolean> => Object.fromEntries(Object.keys(TABLE_BREAKPOINT_QUERIES).map((key) => [key, true]));

export const currentResponsiveScreens = (): Record<string, boolean> => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return allResponsiveScreens();
  return Object.fromEntries(Object.entries(TABLE_BREAKPOINT_QUERIES).map(([key, query]) => [key, window.matchMedia(query).matches]));
};

export const useResponsiveScreens = (): Record<string, boolean> => {
  const [screens, setScreens] = React.useState<Record<string, boolean>>(() => currentResponsiveScreens());

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const update = () => setScreens(currentResponsiveScreens());
    const mediaLists = Object.values(TABLE_BREAKPOINT_QUERIES).map((query) => window.matchMedia(query));
    mediaLists.forEach((media) => {
      if (media.addEventListener) media.addEventListener('change', update);
      else media.addListener?.(update);
    });
    window.addEventListener('resize', update);
    update();

    return () => {
      mediaLists.forEach((media) => {
        if (media.removeEventListener) media.removeEventListener('change', update);
        else media.removeListener?.(update);
      });
      window.removeEventListener('resize', update);
    };
  }, []);

  return screens;
};

export const isResponsiveColumnVisible = <TRecord, TRowData>(column: TableColumn<TRecord, TRowData>, screens: Record<string, boolean>): boolean =>
  !column.responsive?.length || column.responsive.some((breakpoint) => screens[breakpoint]);
