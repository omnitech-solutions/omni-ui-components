import {
  type OutlineItem,
  OutlineList,
  OutlineListItem,
  type OutlineListProps,
} from '@oc-tech/omni-ui-components/OutlineList';
import { Panel } from '@oc-tech/omni-ui-components/Panel';
import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { useState } from 'react';
import type { Variant } from '../internal/support/makeFactory';

// The examples below are written exactly as a consumer writes them. The docs "Show code" of each story and the
// Component Overview row are read from this file, so the code shown is the code that runs.

/** A step of a guide: the library's item plus the caller's own fields. */
export interface Step extends OutlineItem {
  href: string;
  optional?: boolean;
}

/** The steps of a guide in order; the last one is running now. */
export const steps: Step[] = [
  { id: 'install', label: 'Install', meta: '2 min', href: '/docs/install' },
  { id: 'configure', label: 'Configure', meta: '5 min', href: '/docs/configure' },
  {
    id: 'build',
    label: 'Build the project for every target',
    meta: '8 min · 2 targets',
    href: '/docs/build',
    optional: true,
  },
  { id: 'deploy', label: 'Deploy', meta: '3 min', state: 'live', href: '/docs/deploy' },
];

/** The same steps with a library `Tag` at the end of two rows (`trailing`). */
export const taggedSteps: Step[] = [
  { id: 'install', label: 'Install', meta: '2 min', href: '/docs/install' },
  {
    id: 'configure',
    label: 'Configure',
    meta: '5 min',
    href: '/docs/configure',
    trailing: <Tag>new</Tag>,
  },
  {
    id: 'build',
    label: 'Build the project for every target',
    meta: '8 min · 2 targets',
    href: '/docs/build',
    optional: true,
    trailing: <Tag variant="outline">optional</Tag>,
  },
];

/** Build `<OutlineList>` props for tests. */
export const outlineListPropsFactory = (
  overrides: Partial<OutlineListProps<Step>> = {},
): OutlineListProps<Step> => ({
  items: steps,
  'aria-label': 'Steps',
  order: 'reversed',
  defaultValue: 'configure',
  onValueChange: () => undefined,
  ...overrides,
});

export const outlineListVariants: Variant<OutlineListProps<Step>>[] = [
  { name: 'Last first, one chosen, one live', args: {} },
  { name: 'In the order given', args: { order: 'as-given' } },
  { name: 'The live step is the one on show', args: { defaultValue: 'deploy' } },
  { name: 'Read-only (no onValueChange)', args: { onValueChange: undefined } },
  { name: 'Empty', args: { items: [], empty: 'Steps appear here as they are added.' } },
  { name: 'A Tag at the end of a row', args: { items: taggedSteps, order: 'as-given' } },
];

/** Controlled, inside the `Panel` that gives it its heading, count and scrolling. */
export const StepsPanel = () => {
  const [shownId, setShownId] = useState<string | null>('configure');
  const [href, setHref] = useState('/docs/configure');
  return (
    <Panel
      title="Steps"
      meta={href}
      scroll={{ thinScrollbar: true }}
      style={{ width: 300, height: 320 }}
    >
      <OutlineList<Step>
        aria-label="Steps"
        items={steps}
        value={shownId}
        // `step` is a Step: the field added to OutlineItem is typed here.
        onValueChange={(step) => {
          setShownId(step.id);
          setHref(step.href);
        }}
      />
    </Panel>
  );
};

/** Uncontrolled and reversed: the list keeps the choice itself from `defaultValue`, and draws the last item first. */
export const StepsLastFirst = () => {
  const [href, setHref] = useState('/docs/install');
  return (
    <Panel
      title="Steps"
      meta={`last first · ${href}`}
      scroll={{ thinScrollbar: true }}
      style={{ width: 300, height: 320 }}
    >
      <OutlineList<Step>
        aria-label="Steps"
        items={steps}
        order="reversed"
        defaultValue="install"
        onValueChange={(step) => setHref(step.href)}
      />
    </Panel>
  );
};

/** The step running now is also the one on show: it has the chosen fill and `aria-current`, with its number and the word still green. */
export const StepsLiveOnShow = () => {
  const [href, setHref] = useState('/docs/deploy');
  return (
    <Panel
      title="Steps"
      meta={href}
      scroll={{ thinScrollbar: true }}
      style={{ width: 300, height: 320 }}
    >
      <OutlineList<Step>
        aria-label="Steps"
        items={steps}
        defaultValue="deploy"
        onValueChange={(step) => setHref(step.href)}
      />
    </Panel>
  );
};

/** No `onValueChange`: the rows are plain, with nothing to press and nothing in the tab order. */
export const StepsReadOnly = () => (
  <Panel
    title="Steps"
    meta={`${steps.length} steps`}
    scroll={{ thinScrollbar: true }}
    style={{ width: 300, height: 320 }}
  >
    <OutlineList<Step> aria-label="Steps" items={steps} />
  </Panel>
);

/** Nothing yet: `empty` is drawn in place of the rows. */
export const StepsEmpty = () => {
  const none: Step[] = [];
  return (
    <Panel title="Steps" meta={`${none.length} steps`} style={{ width: 300, height: 160 }}>
      <OutlineList<Step>
        aria-label="Steps"
        items={none}
        empty="Steps appear here as they are added."
      />
    </Panel>
  );
};

/** Every string the list draws or announces comes from `labels`. */
export const StepsInGerman = () => {
  const [href, setHref] = useState('/docs/configure');
  return (
    <Panel
      title="Schritte"
      meta={href}
      scroll={{ thinScrollbar: true }}
      style={{ width: 300, height: 320 }}
    >
      <OutlineList<Step>
        items={steps}
        defaultValue="configure"
        labels={{ list: 'Schritte', live: 'läuft' }}
        onValueChange={(step) => setHref(step.href)}
      />
    </Panel>
  );
};

/** `trailing` puts a node at the end of a row: here the library's `Tag`. */
export const StepsWithTags = () => {
  const [href, setHref] = useState('/docs/install');
  return (
    <Panel
      title="Steps"
      meta={href}
      scroll={{ thinScrollbar: true }}
      style={{ width: 300, height: 260 }}
    >
      <OutlineList<Step>
        aria-label="Steps"
        items={taggedSteps}
        defaultValue="install"
        onValueChange={(step) => setHref(step.href)}
      />
    </Panel>
  );
};

/** `renderItem` draws each row: the library's own `OutlineListItem` with one more class, read from the step. */
export const StepsWithCustomRows = () => {
  const [href, setHref] = useState('/docs/install');
  return (
    <Panel
      title="Steps"
      meta={href}
      scroll={{ thinScrollbar: true }}
      style={{ width: 300, height: 320 }}
    >
      <OutlineList<Step>
        aria-label="Steps"
        items={steps}
        defaultValue="install"
        onValueChange={(step) => setHref(step.href)}
        // `state` is { number, current, live }; `select` chooses the step and calls onValueChange.
        renderItem={(step, state, select) => (
          <OutlineListItem<Step>
            item={step}
            {...state}
            onSelect={select}
            className={step.optional ? 'italic' : undefined}
          />
        )}
      />
    </Panel>
  );
};

/** One row on its own, without the list: the caller gives its number and whether it is the one on show. */
export const NextStepPanel = () => {
  const next: Step = {
    id: 'configure',
    label: 'Configure',
    meta: '5 min',
    href: '/docs/configure',
  };
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <Panel title="Next step" meta={opened ?? 'not opened'} style={{ width: 300 }}>
      <OutlineListItem<Step>
        item={next}
        number={2}
        current={opened === next.href}
        onSelect={(step) => setOpened(step.href)}
      />
    </Panel>
  );
};
