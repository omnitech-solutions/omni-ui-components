import type * as React from 'react';
import './example.css';
import { CodeText } from './CodeDisclosure';

export interface SignatureCodeProps {
  code: string;
}

/** A component signature in the run of a line. Plain text at first; highlighted once the highlighter has loaded. */
export const SignatureCode: React.FC<SignatureCodeProps> = ({ code }) => (
  <span className="pb-signature" style={{ fontSize: '0.66rem', lineHeight: 1.4 }}>
    <CodeText code={code} as="span" />
  </span>
);
