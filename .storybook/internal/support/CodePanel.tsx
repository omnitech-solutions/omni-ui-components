import * as React from 'react';
import { Check, ChevronUp, Code2, Copy } from 'lucide-react';

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label?: string;
  ariaExpanded?: boolean;
  ariaLabel?: string;
  square?: boolean;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, icon, label, ariaExpanded, ariaLabel, square }) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={ariaExpanded}
    aria-label={ariaLabel}
    className={
      square
        ? 'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-transparent text-zinc-300/80 transition-colors hover:bg-sky-500/10 hover:text-sky-300'
        : 'inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md bg-transparent px-2.5 text-xs font-medium text-zinc-300/80 transition-colors hover:bg-sky-500/10 hover:text-sky-300'
    }
  >
    {icon}
    {label}
  </button>
);

export interface CodePanelProps {
  code: string;
  defaultOpen?: boolean;
  labels?: { show: string; hide: string };
  marginTopClassName?: string;
}

export const CodePanel: React.FC<CodePanelProps> = ({
  code,
  defaultOpen = false,
  labels = { show: 'Show code', hide: 'Hide code' },
  marginTopClassName = 'mt-6',
}) => {
  const [open, setOpen] = React.useState(defaultOpen);
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked in browser previews */
    }
  }, [code]);

  const toggle = React.useCallback(() => setOpen((value) => !value), []);

  return (
    <div className={`relative overflow-hidden rounded-md border border-zinc-400/40 bg-[#1e1e1e] ${marginTopClassName}`}>
      <div
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle();
          }
        }}
        className={['flex w-full cursor-pointer items-center justify-center gap-1 bg-[#2a2a2a] py-1', open ? 'border-b border-zinc-400/40' : ''].join(' ')}
      >
        <span onClick={(event) => event.stopPropagation()}>
          <ToolbarButton onClick={toggle} ariaExpanded={open} icon={<Code2 size={12} aria-hidden="true" />} label={open ? labels.hide : labels.show} />
        </span>
        <span onClick={(event) => event.stopPropagation()}>
          <ToolbarButton
            onClick={copy}
            icon={copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
            label={copied ? 'Copied' : 'Copy code'}
          />
        </span>
      </div>
      {open ? (
        <>
          <div tabIndex={0} className="group relative outline-none ring-1 ring-transparent ring-inset hover:ring-zinc-300/40 focus:ring-zinc-300/70">
            <div className="absolute right-2 top-2 z-10">
              <ToolbarButton
                onClick={copy}
                square
                ariaLabel={copied ? 'Copied' : 'Copy code'}
                icon={copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              />
            </div>
            <pre className="m-0 overflow-auto px-6 py-5 text-[13px] font-mono leading-relaxed text-zinc-100">
              <code>{code}</code>
            </pre>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-zinc-400/40 bg-[#2a2a2a] py-2 text-xs font-medium text-zinc-300/80 transition-colors hover:bg-sky-500/10 hover:text-sky-300"
          >
            <ChevronUp size={12} aria-hidden="true" />
            Hide
          </button>
        </>
      ) : null}
    </div>
  );
};
