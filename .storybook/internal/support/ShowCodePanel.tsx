/**
 * @fileoverview
 * Collapsible "Show code / Copy code" panel with hide footer when
 * expanded. Ported from the RJSF branch — same UX, no Tailwind
 * dependency. Supports either a single snippet or a labelled map of
 * snippets rendered as tabs.
 */

import * as React from 'react';
import { Check, ChevronUp, Code2, Copy } from 'lucide-react';
import { useDynamicSnippet, type UseDynamicSnippetOptions } from './useDynamicSnippet';

export type ShowCodeInput = string | Record<string, string>;

interface ShowCodePanelProps {
  /** Static code (or labelled map). Ignored when `dynamic` is provided. */
  code?: ShowCodeInput;
  /** Dynamic-source description — the panel introspects the live props +
   *  fixtures and builds the runnable snippet itself. */
  dynamic?: UseDynamicSnippetOptions;
  language?: string;
  defaultOpen?: boolean;
}

export const ShowCodePanel: React.FC<ShowCodePanelProps> = ({ code, dynamic, language = 'markup', defaultOpen = false }) => {
  const dynamicSnippet = useDynamicSnippet(dynamic);
  const resolvedCode = dynamic ? dynamicSnippet : (code ?? '');
  const snippets = React.useMemo(
    () =>
      typeof resolvedCode === 'string'
        ? [{ label: '', code: resolvedCode }]
        : Object.entries(resolvedCode).map(([label, snippet]) => ({ label, code: snippet })),
    [resolvedCode],
  );
  const [open, setOpen] = React.useState(defaultOpen);
  const [copied, setCopied] = React.useState(false);
  const combined = React.useMemo(() => snippets.map((s) => (s.label ? `// ${s.label}\n${s.code}` : s.code)).join('\n\n'), [snippets]);

  const copy = React.useCallback(() => {
    void navigator.clipboard.writeText(combined).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }, [combined]);

  return (
    <div className="pb-showcode">
      <div
        role="button"
        tabIndex={0}
        className={`pb-showcode-toolbar${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setOpen((v) => !v))}
      >
        {/* eslint-disable bonsai-ui-components/prefer-ui-components -- Storybook shell components; app Button drags Redux + TooltipProvider into the docs bundle. */}
        <button
          type="button"
          className="pb-showcode-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          aria-expanded={open}
        >
          <Code2 size={12} />
          {open ? 'Hide code' : 'Show code'}
        </button>
        <button
          type="button"
          className="pb-showcode-btn"
          onClick={(e) => {
            e.stopPropagation();
            copy();
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy code'}
        </button>
        {/* eslint-enable components/prefer-ui-components */}
      </div>

      {open && (
        <>
          <div className="pb-showcode-body">
            {/* eslint-disable-next-line bonsai-ui-components/prefer-ui-components -- see toolbar comment above. */}
            <button type="button" className="pb-showcode-btn pb-showcode-copy-abs" onClick={copy} aria-label={copied ? 'Copied' : 'Copy code'}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {snippets.map((snippet) => (
              <div key={snippet.label || 'code'} className="pb-showcode-snippet">
                {snippet.label && <div className="pb-showcode-snippet-label">{snippet.label}</div>}
                <pre className="pb-code">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            ))}
          </div>
          <button type="button" className="pb-showcode-hide" onClick={() => setOpen(false)}>
            <ChevronUp size={12} /> Hide
          </button>
        </>
      )}
    </div>
  );
};
