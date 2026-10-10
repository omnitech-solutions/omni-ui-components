import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { BackTop } from './BackTop';

const meta = {
  title: 'omni-ui-components/BackTop',
  component: BackTop,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A floating button that appears once its `target` (the window by default) has scrolled past `visibilityHeight`, and scrolls it back to the top.',
      },
    },
  },
} satisfies Meta<typeof BackTop>;
export default meta;

/** Scroll the list: the button appears after 80px and returns the list to its top. */
export const Default: StoryObj<typeof meta> = {
  render: () => {
    const list = React.useRef<HTMLDivElement>(null);
    return (
      <div
        ref={list}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a scrolling region must be reachable by keyboard.
        tabIndex={0}
        role="region"
        aria-label="Release notes"
        className="relative h-56 overflow-y-auto rounded-lg border p-4"
      >
        <div className="flex flex-col gap-3">
          {Array.from({ length: 24 }, (_, index) => (
            <p key={index} className="m-0 text-sm">
              Release note {index + 1}
            </p>
          ))}
        </div>
        <BackTop
          target={() => list.current as HTMLElement}
          visibilityHeight={80}
          style={{ position: 'sticky', bottom: 8, marginLeft: 'auto', display: 'flex' }}
        />
      </div>
    );
  },
};
