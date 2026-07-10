import * as React from 'react';
import { SegmentedPill, ShowCodePanel } from '../storySupport';

export interface ShowcaseShellProps {
  title: string;
  scenario: React.ReactNode;
  code: string;
  language?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for Omni UI/Table/Showcase stories. Mirrors the reference
 * `bonsai-rjsf` NewCompany / NewContact / NewExpense layout: a scenario
 * header explaining what the composition is, the live Table, and a Show
 * code panel with the JSX a consumer would paste into an app view.
 */
export const ShowcaseShell = ({ title, scenario, code, language = 'tsx', children }: ShowcaseShellProps) => (
  <div className="pb-shell">
    <div className="pb-shell-header">
      <h2>
        {title}
        <SegmentedPill
          segments={[
            { content: 'Showcase', uppercase: true },
            { content: '<Table />', tinted: true },
          ]}
        />
      </h2>
      <p>{scenario}</p>
    </div>
    <div className="pb-showcase-preview">{children}</div>
    <ShowCodePanel code={code} language={language} />
  </div>
);
