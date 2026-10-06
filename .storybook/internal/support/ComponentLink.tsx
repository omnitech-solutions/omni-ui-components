import * as React from 'react';

interface StoryEntry {
  id: string;
  title: string;
  type: string;
}
let indexRequest: Promise<StoryEntry[]> | undefined;

/** Resolve the component's main page from Storybook's actual index. */
export function ComponentLink({ component, children }: { component: string; children?: React.ReactNode }) {
  const [entry, setEntry] = React.useState<StoryEntry>();
  React.useEffect(() => {
    let active = true;
    indexRequest ??= fetch('./index.json')
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load the Storybook component index');
        return response.json();
      })
      .then((index) => Object.values(index.entries) as StoryEntry[]);
    const title =
      component === 'DynamicForm'
        ? 'dynamic-form/DynamicForm'
        : component === 'Wizard'
          ? 'omni-ui-components/Navigation/Wizard'
          : component === 'Table'
            ? 'omni-ui-components/Table/Table'
            : `omni-ui-components/${component}`;
    void indexRequest
      .then((entries) => {
        const root =
          entries.find((item) => item.title === title && item.type === 'docs') ??
          entries.find((item) => item.title === title && item.type === 'story');
        if (active) setEntry(root);
      })
      .catch(() => {
        indexRequest = undefined;
      });
    return () => {
      active = false;
    };
  }, [component]);
  if (!entry) return <>{children ?? component}</>;
  return (
    <a
      className="pb-component-link"
      href={`./?path=/${entry.type === 'docs' ? 'docs' : 'story'}/${entry.id}`}
      target="_top"
      title={`Open ${component} component page — leaves this overview`}
      aria-label={`Open ${component} component page (leaves overview)`}
    >
      {children ?? component}
      <span aria-hidden="true" className="pb-component-link-arrow">
        ↗
      </span>
    </a>
  );
}
