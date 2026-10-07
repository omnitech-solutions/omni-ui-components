/**
 * @fileoverview
 * Collapsible "Show code / Copy code" panel with hide footer when
 * expanded. Ported from the RJSF branch — same UX, no Tailwind
 * dependency. Supports either a single snippet or a labelled map of
 * snippets rendered as tabs.
 */

import * as React from 'react';
import './overview.css';
import { Check, ChevronUp, Code2, Copy } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'prettier/standalone';
import * as typescript from 'prettier/plugins/typescript';
import * as estree from 'prettier/plugins/estree';
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

export const ShowCodePanel: React.FC<ShowCodePanelProps> = ({ code, dynamic, language = 'tsx', defaultOpen = false }) => {
  const dynamicSnippet = useDynamicSnippet(dynamic);
  const resolvedCode = dynamic ? dynamicSnippet : (code ?? '');
  const snippets = React.useMemo(
    () =>
      typeof resolvedCode === 'string'
        ? [{ label: '', code: resolvedCode }]
        : Object.entries(resolvedCode).map(([label, snippet]) => ({
            label,
            code: snippet,
          })),
    [resolvedCode],
  );
  const [formatted, setFormatted] = React.useState(snippets);
  React.useEffect(() => {
    let active = true;
    void Promise.all(
      snippets.map(async (snippet) => ({
        ...snippet,
        code: await format(snippet.code, {
          parser: 'typescript',
          plugins: [typescript, estree],
          printWidth: 100,
          singleQuote: true,
        }).catch(() => snippet.code),
      })),
    ).then((result) => {
      if (active) setFormatted(result);
    });
    return () => {
      active = false;
    };
  }, [snippets]);
  const [open, setOpen] = React.useState(defaultOpen);
  const [copied, setCopied] = React.useState(false);
  const [activeLabel, setActiveLabel] = React.useState('');
  const activeSnippet = formatted.find((snippet) => snippet.label === activeLabel) ?? formatted[0];
  const combined = activeSnippet?.code ?? '';

  const copy = React.useCallback(() => {
    void navigator.clipboard
      .writeText(combined)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  }, [combined]);

  return (
    <div className="pb-showcode">
      <div
        className={`pb-showcode-toolbar${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {/* a11y: the toolbar itself is a mouse-only convenience (a role="button" wrapping buttons is nested-interactive); the Show/Hide button inside is the keyboard control. */}
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
            {formatted.length > 1 && (
              <div role="tablist" aria-label="Code examples" className="pb-showcode-tabs">
                {formatted.map((snippet) => (
                  <button
                    key={snippet.label}
                    role="tab"
                    type="button"
                    aria-selected={snippet.label === activeSnippet?.label}
                    onClick={() => setActiveLabel(snippet.label)}
                    className="pb-showcode-btn"
                  >
                    {snippet.label}
                  </button>
                ))}
              </div>
            )}
            {activeSnippet &&
              [activeSnippet].map((snippet) => (
                <div key={snippet.label || 'code'} className="pb-showcode-snippet">
                  {snippet.label && <div className="pb-showcode-snippet-label">{snippet.label}</div>}
                  <SyntaxHighlighter
                    language={language}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      fontSize: 13,
                      background: '#1e1e1e',
                      overflowX: 'auto',
                    }}
                    codeTagProps={{
                      style: { fontFamily: 'ui-monospace, monospace' },
                    }}
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
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
