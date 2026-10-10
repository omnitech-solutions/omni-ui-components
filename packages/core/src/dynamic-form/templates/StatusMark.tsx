import type { OmniStatus, OmniStatusTone } from '../lib/formContext';

const DOT: Record<OmniStatusTone, string> = {
  success: 'bg-[color:var(--oui-tone-success-fg)]',
  warning: 'bg-[color:var(--oui-tone-warning-fg)]',
  danger: 'bg-[color:var(--oui-tone-danger-fg)]',
  muted: 'bg-[color:var(--oui-foreground-muted)]',
};

/** A toned dot and its words, beside a field label or a section title. The words carry the meaning, not the colour. */
export const StatusMark = ({ status }: { status: OmniStatus }) => (
  <span
    data-slot="form-status"
    data-tone={status.tone}
    className="inline-flex items-center gap-1.5 font-[family-name:var(--oui-font-sans)] text-xs font-normal text-[var(--oui-foreground-muted)]"
  >
    <span
      aria-hidden="true"
      className={`size-1.5 shrink-0 rounded-full ${DOT[status.tone] ?? DOT.muted}`}
    />
    {status.label}
  </span>
);
