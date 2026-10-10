/**
 * @fileoverview
 * `CodeDisclosure`: the one "Show code" control of the Storybook. A quiet bar, left-aligned under a preview, with
 * the library's own ghost `Button`s: one opens the code, one copies it. Nothing about the code is loaded or built
 * until it is first asked for: the snippet (when it is given as a function), the formatter and the highlighter.
 */
import { Button } from '@oc-tech/omni-ui-components/Button';
import { Tab, TabPanel, Tabs, TabsBar } from '@oc-tech/omni-ui-components/Tabs';
import { Check, Code2, Copy } from 'lucide-react';
import * as React from 'react';
import type { HighlightedProps } from './codeHighlighter';
import type { ExampleCode, ExampleSnippets } from './exampleStore';

interface Snippet {
  label: string;
  code: string;
}

const toSnippets = (code: ExampleSnippets): Snippet[] =>
  typeof code === 'string'
    ? [{ label: '', code }]
    : Object.entries(code).map(([label, snippet]) => ({ label, code: snippet }));

let highlighter: Promise<React.FC<HighlightedProps>> | undefined;
/** The highlighter chunk, requested once for the whole page. */
export const loadHighlighter = () => {
  highlighter ??= import('./codeHighlighter').then((module) => module.Highlighted);
  return highlighter;
};
const loadFormatter = () => import('./codeFormatter').then((module) => module.formatCode);

/** The code as text until the highlighter has arrived, then highlighted. */
export const CodeText: React.FC<HighlightedProps> = ({ code, as = 'pre' }) => {
  const [Highlighted, setHighlighted] = React.useState<React.FC<HighlightedProps> | null>(null);
  React.useEffect(() => {
    let active = true;
    void loadHighlighter().then(
      (component) => active && setHighlighted(() => component),
      () => undefined,
    );
    return () => {
      active = false;
    };
  }, []);
  if (Highlighted) return <Highlighted code={code} as={as} />;
  return as === 'pre' ? (
    <pre className="pb-code-pre">
      <code>{code}</code>
    </pre>
  ) : (
    <span className="pb-code-pre">{code}</span>
  );
};

const CodeRegion: React.FC<{ code: string }> = ({ code }) => (
  // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must be reachable by keyboard.
  <div className="pb-example-code-scroll" tabIndex={0} role="region" aria-label="Example code">
    <CodeText code={code} />
  </div>
);

export interface CodeDisclosureProps {
  code: ExampleCode;
  defaultOpen?: boolean;
  /** Formats with the repository's rules before showing. Defaults to `true`. */
  format?: boolean;
  className?: string;
}

export const CodeDisclosure: React.FC<CodeDisclosureProps> = ({
  code,
  defaultOpen = false,
  format = true,
  className,
}) => {
  const panelId = React.useId();
  const [open, setOpen] = React.useState(defaultOpen);
  const [copied, setCopied] = React.useState(false);
  const [active, setActive] = React.useState('');
  const [snippets, setSnippets] = React.useState<Snippet[] | null>(null);
  const [failed, setFailed] = React.useState(false);

  // One request per `code`: opening and copying share it, and a new `code` (args changed) starts again.
  const pending = React.useRef<{ code: ExampleCode; result: Promise<Snippet[]> } | null>(null);
  const resolve = React.useCallback(() => {
    if (pending.current?.code === code) return pending.current.result;
    const result = Promise.resolve(typeof code === 'function' ? code() : code)
      .then(toSnippets)
      .then(async (raw) => {
        if (!format) return raw;
        const formatCode = await loadFormatter();
        return Promise.all(
          raw.map(async (each) => ({ ...each, code: await formatCode(each.code) })),
        );
      });
    pending.current = { code, result };
    return result;
  }, [code, format]);

  React.useEffect(() => {
    if (!open) return;
    let current = true;
    setFailed(false);
    resolve().then(
      (result) => current && setSnippets(result),
      () => current && setFailed(true),
    );
    return () => {
      current = false;
    };
  }, [open, resolve]);

  const shown = snippets?.find((each) => each.label === active) ?? snippets?.[0];

  const copy = () => {
    void resolve()
      .then((result) => {
        const snippet = result.find((each) => each.label === active) ?? result[0];
        return navigator.clipboard.writeText(snippet?.code ?? '');
      })
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => setCopied(false));
  };

  return (
    <div className={['pb-example-foot', className].filter(Boolean).join(' ')} data-open={open}>
      <div className="pb-example-bar">
        <Button
          variant="ghost"
          buttonSize="sm"
          className="pb-example-action"
          icon={<Code2 aria-hidden="true" />}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? 'Hide code' : 'Show code'}
        </Button>
        <Button
          variant="ghost"
          buttonSize="sm"
          className="pb-example-action"
          icon={copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          onClick={copy}
        >
          {copied ? 'Copied' : 'Copy code'}
        </Button>
        <span aria-live="polite" className="sr-only">
          {copied ? 'Code copied' : ''}
        </span>
      </div>
      {open ? (
        <div id={panelId} className="pb-example-code">
          {!snippets || !shown ? (
            <p className="pb-example-code-note">
              {failed ? 'The code for this example could not be loaded.' : 'Loading code…'}
            </p>
          ) : snippets.length > 1 ? (
            <Tabs value={shown.label} onValueChange={setActive} className="pb-example-code-tabs">
              <TabsBar aria-label="Code examples">
                {snippets.map((each) => (
                  <Tab key={each.label} value={each.label}>
                    {each.label}
                  </Tab>
                ))}
              </TabsBar>
              {snippets.map((each) => (
                <TabPanel key={each.label} value={each.label} tabIndex={-1}>
                  <CodeRegion code={each.code} />
                </TabPanel>
              ))}
            </Tabs>
          ) : (
            <CodeRegion code={shown.code} />
          )}
        </div>
      ) : null}
    </div>
  );
};
