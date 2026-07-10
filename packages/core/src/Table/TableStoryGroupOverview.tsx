import * as React from 'react';
import { InlineCode, SegmentedPill, TableOfContents, type TocItem } from './storySupport';

export interface TableStoryGroupOverviewProps {
  title: string;
  summary: string;
  sections: Array<{ id: string; title: string; body: React.ReactNode }>;
}

export const TableStoryGroupOverview = ({ title, summary, sections }: TableStoryGroupOverviewProps) => {
  const tocItems: TocItem[] = sections.map((section) => ({ id: section.id, label: section.title }));

  return (
    <div className="pb-shell">
      <div className="pb-shell-header">
        <h2>
          {title}
          <SegmentedPill
            segments={[
              { content: 'Omni UI', uppercase: true },
              { content: '<Table />', tinted: true },
            ]}
          />
        </h2>
        <p>{summary}</p>
      </div>
      <div className="pb-overview-layout">
        <main className="pb-overview-main">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="pb-pipeline-section">
              <h3 className="pb-pipeline-section-title">{section.title}</h3>
              <p>{section.body}</p>
            </section>
          ))}
        </main>
        <TableOfContents items={tocItems} />
      </div>
    </div>
  );
};

export const ApiName = ({ code }: { code: string }) => <InlineCode code={code} />;
