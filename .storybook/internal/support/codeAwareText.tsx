import * as React from 'react';
import { InlineCode } from './InlineCode';
import { SignatureCode } from './SignatureCode';

/**
 * A description as written in a story file: `` `code` `` becomes inline code, `<code>…</code>` a highlighted
 * signature and `<primary>…</primary>` accent text. Anything that is not a string is returned as it is.
 */
export const renderCodeAwareText = (value: React.ReactNode): React.ReactNode => {
  if (typeof value !== 'string') return value;
  const segments = value.split(/(`[^`]+`|<primary>.*?<\/primary>|<code>.*?<\/code>)/g);
  return segments.map((segment, segmentIndex) => {
    if (segment.startsWith('`') && segment.endsWith('`')) {
      return <InlineCode key={segmentIndex} code={segment.slice(1, -1)} />;
    }

    if (segment.startsWith('<code>') && segment.endsWith('</code>')) {
      return (
        <SignatureCode
          key={segmentIndex}
          code={segment.slice('<code>'.length, -'</code>'.length)}
        />
      );
    }

    if (segment.startsWith('<primary>') && segment.endsWith('</primary>')) {
      return (
        <span
          key={segmentIndex}
          className="font-medium text-[color:color-mix(in_srgb,var(--color-primary)_72%,var(--color-foreground)_28%)]"
        >
          {segment.slice('<primary>'.length, -'</primary>'.length)}
        </span>
      );
    }

    return <React.Fragment key={segmentIndex}>{segment}</React.Fragment>;
  });
};
