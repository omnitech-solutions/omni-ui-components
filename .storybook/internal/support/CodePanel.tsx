import * as React from 'react';
import { ShowCodePanel } from './ShowCodePanel';

export interface CodePanelProps {
  code: string;
  defaultOpen?: boolean;
  labels?: { show: string; hide: string };
  marginTopClassName?: string;
}

/** Compatibility wrapper: every code panel uses the same renderer and copy implementation. */
export const CodePanel: React.FC<CodePanelProps> = ({ code, defaultOpen, marginTopClassName = 'mt-6' }) => (
  <div className={marginTopClassName}>
    <ShowCodePanel code={code} defaultOpen={defaultOpen} />
  </div>
);
