import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { StepTimeline } from '@oc-tech/omni-ui-components/StepTimeline';
import { doneSteps, failedSteps, runningSteps, stepTimelinePropsFactory } from 'factories/omni-ui-components/StepTimeline/StepTimeline.factories';

const rows = () => Array.from(document.querySelectorAll('[data-slot="step-timeline-row"]')) as HTMLElement[];

describe('omni-ui-components/StepTimeline', () => {
  describe('summary variant', () => {
    it('done: "Used N tools · X.Xs", collapsed, a disclosure', () => {
      render(<StepTimeline {...stepTimelinePropsFactory()} />);
      const toggle = screen.getByRole('button', {
        name: 'Used 3 tools · 4.2s',
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(rows()).toHaveLength(0);
    });

    it('singular for one tool, no seconds when unknown', () => {
      render(
        <StepTimeline
          {...stepTimelinePropsFactory({
            steps: doneSteps().slice(0, 1),
            seconds: undefined,
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Used 1 tool' })).toBeInTheDocument();
    });

    it('expands to rows with icon, label, detail and the parallel tag', async () => {
      render(<StepTimeline {...stepTimelinePropsFactory()} />);
      await userEvent.click(screen.getByRole('button', { name: /Used 3 tools/ }));
      expect(rows()).toHaveLength(3);
      expect(rows()[0]).toHaveTextContent('Searched evidence3 passagesparallel');
      expect(rows()[2]).not.toHaveTextContent('parallel');
      expect(rows()[2]!.querySelector('svg')).not.toBeNull();
    });

    it('running: spinner, the active label, "{first} + N more…" and "…" detail while active', async () => {
      render(<StepTimeline {...stepTimelinePropsFactory({ steps: runningSteps() })} />);
      expect(screen.getByRole('button', { name: 'Drafting a change + 1 more…' })).toBeInTheDocument();
      expect(document.querySelector('[data-slot="step-timeline-spinner"]')).not.toBeNull();
      await userEvent.click(screen.getByRole('button'));
      expect(rows()[1]).toHaveTextContent('Drafting a change…');
      expect(rows()[1]).toHaveAttribute('data-state', 'running');
    });

    it('a single running step reads "{label}…"', () => {
      render(<StepTimeline {...stepTimelinePropsFactory({ steps: [runningSteps()[1]!] })} />);
      expect(screen.getByRole('button', { name: 'Drafting a change…' })).toBeInTheDocument();
    });

    it('waiting and stopped summaries', () => {
      const { rerender } = render(
        <StepTimeline
          {...stepTimelinePropsFactory({
            steps: runningSteps(),
            status: 'waiting',
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Waiting for your approval' })).toBeInTheDocument();
      rerender(
        <StepTimeline
          {...stepTimelinePropsFactory({
            steps: runningSteps(),
            status: 'stopped',
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Stopped while working' })).toBeInTheDocument();
      rerender(<StepTimeline {...stepTimelinePropsFactory({ steps: [{ ...runningSteps()[2]! }] })} />);
      expect(screen.getByRole('button', { name: 'Stopped while working' })).toBeInTheDocument();
    });

    it('labels, summary and open state are configurable', () => {
      render(
        <StepTimeline
          {...stepTimelinePropsFactory({
            open: true,
            labels: { done: () => 'Fertig', parallel: 'parallel!' },
          })}
        />,
      );
      expect(screen.getByRole('button', { name: 'Fertig' })).toHaveAttribute('aria-expanded', 'true');
      expect(rows()[0]).toHaveTextContent('parallel!');
    });

    it('empty steps render nothing', () => {
      const { container } = render(<StepTimeline steps={[]} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('rail variant', () => {
    it('while running the rail is shown and the summary button is hidden', () => {
      render(
        <StepTimeline
          {...stepTimelinePropsFactory({
            variant: 'rail',
            steps: runningSteps(),
          })}
        />,
      );
      expect(screen.queryByRole('button')).toBeNull();
      const rail = document.querySelector('[data-slot="step-timeline-rail"]')!;
      expect(rail).not.toBeNull();
      expect(rows()).toHaveLength(3);
      expect(document.querySelectorAll('[data-slot="step-timeline-line"]')).toHaveLength(2);
      expect(
        Array.from(document.querySelectorAll('[data-slot="step-timeline-dot"]')).map((dot) =>
          dot.className.includes('bg-[color:var(--oui-tone-success-bg)]'),
        ),
      ).toEqual([true, false, false]);
    });

    it('when done the rail appears only after the summary is opened', async () => {
      render(<StepTimeline {...stepTimelinePropsFactory({ variant: 'rail' })} />);
      expect(document.querySelector('[data-slot="step-timeline-rail"]')).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: /Used 3 tools/ }));
      expect(document.querySelector('[data-slot="step-timeline-rail"]')).not.toBeNull();
    });

    it('a failed step gets the failed dot and icon', () => {
      render(
        <StepTimeline
          {...stepTimelinePropsFactory({
            variant: 'rail',
            steps: failedSteps(),
            defaultOpen: true,
          })}
        />,
      );
      expect(rows()[1]).toHaveAttribute('data-state', 'failed');
      expect(rows()[1]!.querySelector('[data-slot="step-timeline-dot"] svg')).not.toBeNull();
    });
  });

  it('onOpenChange fires in controlled and uncontrolled mode', async () => {
    const onOpenChange = vi.fn();
    const { unmount } = render(<StepTimeline {...stepTimelinePropsFactory({ open: false, onOpenChange })} />);
    await userEvent.click(screen.getByRole('button', { name: /Used 3 tools/ }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    unmount();
    render(<StepTimeline {...stepTimelinePropsFactory({ onOpenChange })} />);
    await userEvent.click(screen.getByRole('button', { name: /Used 3 tools/ }));
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });
});
