import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { Tour } from '@oc-tech/omni-ui-components/Tour';

const meta: Meta<typeof Tour> = {
  title: 'omni-ui-components/Tour',
  component: Tour,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Guided onboarding overlay for walking the user through a multi-step workflow. Tour is intended for first-run education, feature discovery, and contextual product walkthroughs rather than generic help text.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Tour>;
export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    const [current, setCurrent] = React.useState(0);
    const steps = [
      { title: 'Welcome to the workspace', description: 'Use this guided tour to understand the primary actions, team signals, and where important review work happens.' },
      { title: 'Review queue', description: 'Start with items that need approval. This is where publishing risk, owner status, and blockers become visible.' },
      { title: 'Finish and continue', description: 'Once the user understands the flow, close the tour and let them continue in the real interface.' },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-100 p-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[var(--oui-border-field)] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Release workspace</div>
              <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">A representative page shell so the guided overlay has visible context.</div>
            </div>
            <Button
              onClick={() => {
                setCurrent(0);
                setOpen(true);
              }}
            >
              Restart tour
            </Button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-4">
              <div className="text-sm font-semibold">Queue</div>
              <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">5 approvals waiting</div>
            </div>
            <div className="rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-4">
              <div className="text-sm font-semibold">Drafts</div>
              <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">12 active changes</div>
            </div>
            <div className="rounded-xl border border-[var(--oui-border-field)] bg-[var(--oui-surface-field)] p-4">
              <div className="text-sm font-semibold">Activity</div>
              <div className="mt-1 text-sm text-[var(--oui-foreground-muted)]">Recent owner updates and comments</div>
            </div>
          </div>
        </div>
        <Tour open={open} current={current} steps={steps} onCurrentChange={setCurrent} onClose={() => setOpen(false)} />
      </div>
    );
  },
};

export const SecondStep: Story = {
  render: () => (
    <div className="min-h-screen bg-slate-50 p-10">
      <Tour
        open
        current={1}
        steps={[
          { title: 'Welcome', description: 'Intro to the workspace.' },
          { title: 'Check the queue first', description: 'This step shows how a tour can advance through a structured sequence of guidance.' },
          { title: 'Wrap up', description: 'End the tour once the user has enough context to continue alone.' },
        ]}
      />
    </div>
  ),
};
