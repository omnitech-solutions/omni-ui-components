/**
 * Tone scale shared by Button and IconButton (and any later control that
 * must read as "neutral / accent / success / warning / danger / dim").
 *
 * Colours come from the `--oui-tone-<tone>-*` tokens in `styles/tokens.css`
 * (light + dark), so a surface re-themes the whole scale by overriding
 * tokens, never by passing colours. Class strings are written out in full so
 * Tailwind's source scan can see them.
 */
export type ControlTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'dim';

export const CONTROL_TONES: readonly ControlTone[] = [
  'neutral',
  'accent',
  'success',
  'warning',
  'danger',
  'dim',
];

/** Filled: solid tone fill (neutral and dim are tinted surfaces with a border). */
export const toneSolidClasses: Record<ControlTone, string> = {
  neutral:
    'border border-[color:var(--oui-tone-neutral-border)] bg-[color:var(--oui-tone-neutral-solid-bg)] text-[color:var(--oui-tone-neutral-solid-fg)] hover:bg-[color:var(--oui-tone-neutral-solid-bg)] hover:brightness-110',
  accent:
    'border border-transparent bg-[color:var(--oui-tone-accent-solid-bg)] text-[color:var(--oui-tone-accent-solid-fg)] hover:bg-[color:var(--oui-tone-accent-solid-bg)] hover:brightness-110',
  success:
    'border border-transparent bg-[color:var(--oui-tone-success-solid-bg)] text-[color:var(--oui-tone-success-solid-fg)] hover:bg-[color:var(--oui-tone-success-solid-bg)] hover:brightness-110',
  warning:
    'border border-transparent bg-[color:var(--oui-tone-warning-solid-bg)] text-[color:var(--oui-tone-warning-solid-fg)] hover:bg-[color:var(--oui-tone-warning-solid-bg)] hover:brightness-110',
  danger:
    'border border-transparent bg-[color:var(--oui-tone-danger-solid-bg)] text-[color:var(--oui-tone-danger-solid-fg)] hover:bg-[color:var(--oui-tone-danger-solid-bg)] hover:brightness-110',
  dim: 'border border-[color:var(--oui-tone-dim-border)] bg-[color:var(--oui-tone-dim-solid-bg)] text-[color:var(--oui-tone-dim-solid-fg)] hover:bg-[color:var(--oui-tone-dim-solid-bg)]',
};

/** Soft: outlined, transparent until hovered (the outlined red End / outlined Pause). */
export const toneSoftClasses: Record<ControlTone, string> = {
  neutral:
    'border border-[color:var(--oui-tone-neutral-border)] bg-transparent text-[color:var(--oui-tone-neutral-fg)] hover:bg-[color:var(--oui-tone-neutral-bg)]',
  accent:
    'border border-[color:var(--oui-tone-accent-border)] bg-transparent text-[color:var(--oui-tone-accent-fg)] hover:bg-[color:var(--oui-tone-accent-bg)]',
  success:
    'border border-[color:var(--oui-tone-success-border)] bg-transparent text-[color:var(--oui-tone-success-fg)] hover:bg-[color:var(--oui-tone-success-bg)]',
  warning:
    'border border-[color:var(--oui-tone-warning-border)] bg-transparent text-[color:var(--oui-tone-warning-fg)] hover:bg-[color:var(--oui-tone-warning-bg)]',
  danger:
    'border border-[color:var(--oui-tone-danger-border)] bg-transparent text-[color:var(--oui-tone-danger-fg)] hover:bg-[color:var(--oui-tone-danger-bg)]',
  dim: 'border border-[color:var(--oui-tone-dim-border)] bg-transparent text-[color:var(--oui-tone-dim-fg)] hover:bg-transparent',
};

/** Tint: tinted surface + tone foreground + tone border (icon controls, badges). */
export const toneTintClasses: Record<ControlTone, string> = {
  neutral:
    'border-[color:var(--oui-tone-neutral-border)] bg-[color:var(--oui-tone-neutral-bg)] text-[color:var(--oui-tone-neutral-fg)] hover:bg-[color:var(--oui-tone-neutral-bg)] hover:brightness-110',
  accent:
    'border-[color:var(--oui-tone-accent-border)] bg-[color:var(--oui-tone-accent-bg)] text-[color:var(--oui-tone-accent-fg)] hover:bg-[color:var(--oui-tone-accent-bg)] hover:brightness-110',
  success:
    'border-[color:var(--oui-tone-success-border)] bg-[color:var(--oui-tone-success-bg)] text-[color:var(--oui-tone-success-fg)] hover:bg-[color:var(--oui-tone-success-bg)] hover:brightness-110',
  warning:
    'border-[color:var(--oui-tone-warning-border)] bg-[color:var(--oui-tone-warning-bg)] text-[color:var(--oui-tone-warning-fg)] hover:bg-[color:var(--oui-tone-warning-bg)] hover:brightness-110',
  danger:
    'border-[color:var(--oui-tone-danger-border)] bg-[color:var(--oui-tone-danger-bg)] text-[color:var(--oui-tone-danger-fg)] hover:bg-[color:var(--oui-tone-danger-bg)] hover:brightness-110',
  dim: 'border-[color:var(--oui-tone-dim-border)] bg-[color:var(--oui-tone-dim-bg)] text-[color:var(--oui-tone-dim-fg)] hover:bg-[color:var(--oui-tone-dim-bg)]',
};

/** Badge fill per tone: the solid fill and its foreground. */
export const toneBadgeClasses: Record<ControlTone, string> = {
  neutral:
    'bg-[color:var(--oui-tone-neutral-solid-bg)] text-[color:var(--oui-tone-neutral-solid-fg)]',
  accent: 'bg-[color:var(--oui-tone-accent-solid-bg)] text-[color:var(--oui-tone-accent-solid-fg)]',
  success:
    'bg-[color:var(--oui-tone-success-solid-bg)] text-[color:var(--oui-tone-success-solid-fg)]',
  warning:
    'bg-[color:var(--oui-tone-warning-solid-bg)] text-[color:var(--oui-tone-warning-solid-fg)]',
  danger: 'bg-[color:var(--oui-tone-danger-solid-bg)] text-[color:var(--oui-tone-danger-solid-fg)]',
  dim: 'bg-[color:var(--oui-tone-dim-border)] text-[color:var(--oui-tone-dim-fg)]',
};

/** Active (pressed) look: accent tint, whatever the tone. */
export const pressedClasses =
  'aria-pressed:border aria-pressed:border-[color:var(--oui-tone-accent-border)] aria-pressed:bg-[color:var(--oui-tone-accent-bg)] aria-pressed:text-[color:var(--oui-tone-accent-fg)]';

/** Pressed look per tone, so a `danger` toggle (a live mic) is red when pressed instead of the default accent. */
export const tonePressedClasses: Record<ControlTone, string> = {
  neutral:
    'aria-pressed:border-[color:var(--oui-tone-neutral-border)] aria-pressed:bg-[color:var(--oui-tone-neutral-bg)] aria-pressed:text-[color:var(--oui-tone-neutral-fg)]',
  accent: '',
  success:
    'aria-pressed:border-[color:var(--oui-tone-success-border)] aria-pressed:bg-[color:var(--oui-tone-success-bg)] aria-pressed:text-[color:var(--oui-tone-success-fg)]',
  warning:
    'aria-pressed:border-[color:var(--oui-tone-warning-border)] aria-pressed:bg-[color:var(--oui-tone-warning-bg)] aria-pressed:text-[color:var(--oui-tone-warning-fg)]',
  danger:
    'aria-pressed:border-[color:var(--oui-tone-danger-border)] aria-pressed:bg-[color:var(--oui-tone-danger-bg)] aria-pressed:text-[color:var(--oui-tone-danger-fg)]',
  dim: 'aria-pressed:border-[color:var(--oui-tone-dim-border)] aria-pressed:bg-[color:var(--oui-tone-dim-bg)] aria-pressed:text-[color:var(--oui-tone-dim-fg)]',
};

/** Foreground per tone (icons, rings, text) for elements that draw with `currentColor`. */
export const toneTextClasses: Record<ControlTone, string> = {
  neutral: 'text-[color:var(--oui-tone-neutral-fg)]',
  accent: 'text-[color:var(--oui-tone-accent-fg)]',
  success: 'text-[color:var(--oui-tone-success-fg)]',
  warning: 'text-[color:var(--oui-tone-warning-fg)]',
  danger: 'text-[color:var(--oui-tone-danger-fg)]',
  dim: 'text-[color:var(--oui-tone-dim-fg)]',
};
