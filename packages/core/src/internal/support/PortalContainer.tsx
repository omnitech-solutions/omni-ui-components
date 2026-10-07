/** Attribute a native host reads (by selector) to find portalled surfaces that must stay clickable. */
export const SURFACE_ATTRIBUTE = 'data-oui-surface';

/** `container` as Radix expects it: `null`/`undefined` means the default (`document.body`). */
export const resolvePortalContainer = (container?: HTMLElement | null): HTMLElement | undefined => container ?? undefined;

/** Spread onto portalled content so the host can find it; the value names the kind of surface. */
export const surfaceProps = (kind: string) => ({ [SURFACE_ATTRIBUTE]: kind }) as { 'data-oui-surface': string };
