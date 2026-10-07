import '@testing-library/jest-dom';

import { StatusClock } from '@oc-tech/omni-ui-components/StatusClock';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SAMPLE_BUILD_TAG,
  statusClockExamples,
  statusClockPropsFactory,
} from 'factories/omni-ui-components/StatusClock/StatusClock.factories';

const slot = (name: string) => document.querySelector(`[data-slot="${name}"]`) as HTMLElement;

describe('omni-ui-components/StatusClock', () => {
  it('is a named group with the elapsed string in a mono timer and no "Live" text', () => {
    render(<StatusClock {...statusClockPropsFactory()} />);
    expect(screen.getByRole('group', { name: 'Session status' })).toHaveAttribute(
      'data-state',
      'live',
    );
    const timer = screen.getByRole('timer');
    expect(timer).toHaveTextContent('2:18:20');
    expect(timer).toHaveClass('font-mono');
    expect(screen.queryByText(/live/i)).toBeNull();
    expect(screen.queryByText('Paused')).toBeNull();
  });

  it('live: red icon and timer from the danger tone', () => {
    render(<StatusClock {...statusClockPropsFactory()} />);
    expect(slot('status-clock-icon')).toHaveClass('text-[color:var(--oui-clock-live)]');
    expect(screen.getByRole('timer')).toHaveClass('text-[color:var(--oui-clock-live)]');
  });

  it('paused: amber icon, amber timer and the Paused label', () => {
    render(<StatusClock {...statusClockPropsFactory({ state: 'paused' })} />);
    expect(screen.getByRole('group')).toHaveAttribute('data-state', 'paused');
    expect(slot('status-clock-icon')).toHaveClass('text-[color:var(--oui-clock-paused-icon)]');
    expect(screen.getByRole('timer')).toHaveClass('text-[color:var(--oui-clock-paused)]');
    expect(screen.getByText('Paused')).toHaveClass('text-[color:var(--oui-clock-paused)]');
  });

  it('paused swaps in pausedIcon (falling back to icon); pausedLabel is configurable and nullable', () => {
    const { rerender } = render(
      <StatusClock
        elapsed="0:01"
        state="paused"
        icon={<i data-testid="rec" />}
        pausedIcon={<i data-testid="pause" />}
      />,
    );
    expect(screen.getByTestId('pause')).toBeInTheDocument();
    expect(screen.queryByTestId('rec')).toBeNull();
    rerender(
      <StatusClock
        elapsed="0:01"
        state="paused"
        icon={<i data-testid="rec" />}
        pausedLabel="En pause"
      />,
    );
    expect(screen.getByTestId('rec')).toBeInTheDocument();
    expect(screen.getByText('En pause')).toBeInTheDocument();
    rerender(<StatusClock elapsed="0:01" state="paused" pausedLabel={null} />);
    expect(screen.queryByText('Paused')).toBeNull();
  });

  it('has no surface of its own in either state (only colours change)', () => {
    const { rerender } = render(<StatusClock {...statusClockPropsFactory()} />);
    const liveClass = screen.getByRole('group').className;
    rerender(<StatusClock {...statusClockPropsFactory({ state: 'paused' })} />);
    expect(screen.getByRole('group').className).toBe(liveClass);
    expect(liveClass).not.toMatch(/\bbg-/);
  });

  it('renders no build tag unless given', () => {
    render(<StatusClock {...statusClockPropsFactory()} />);
    expect(slot('status-clock-build')).toBeNull();
  });

  it('build tag: mono label, full SHA in the title, copy callback on click', async () => {
    const onCopy = vi.fn();
    render(
      <StatusClock
        {...statusClockPropsFactory({
          buildTag: { ...SAMPLE_BUILD_TAG, onCopy },
        })}
      />,
    );
    const tag = screen.getByRole('button', {
      name: `Copy build ${SAMPLE_BUILD_TAG.title}`,
    });
    expect(tag).toHaveAttribute('title', SAMPLE_BUILD_TAG.title);
    expect(tag).toHaveClass('font-mono');
    expect(tag).toHaveTextContent(`${SAMPLE_BUILD_TAG.sha}·${SAMPLE_BUILD_TAG.branch}`);
    const commit = tag.querySelector('[data-slot="status-clock-commit-icon"]');
    const branch = tag.querySelector('[data-slot="status-clock-branch-icon"]');
    expect(commit).toBeInTheDocument();
    expect(branch).toBeInTheDocument();
    expect(commit?.nextElementSibling).toHaveAttribute('data-slot', 'status-clock-sha');
    expect(branch?.nextElementSibling).toHaveAttribute('data-slot', 'status-clock-branch');
    await userEvent.click(tag);
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it('build tag: the controlled copied prop shows the copied label (default Copied)', () => {
    const { rerender } = render(
      <StatusClock
        {...statusClockPropsFactory({
          buildTag: { ...SAMPLE_BUILD_TAG, copied: true },
        })}
      />,
    );
    const tag = screen.getByRole('button', { name: 'Copied' });
    expect(tag).toHaveTextContent('Copied');
    expect(tag).not.toHaveTextContent(SAMPLE_BUILD_TAG.sha);
    expect(tag.querySelector('svg')).toBeNull();
    rerender(
      <StatusClock
        {...statusClockPropsFactory({
          buildTag: { ...SAMPLE_BUILD_TAG, copied: true, copiedLabel: 'Copié' },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: 'Copié' })).toBeInTheDocument();
  });

  it('build tag: the icons and the branch are optional', () => {
    render(<StatusClock {...statusClockPropsFactory({ buildTag: { sha: 'abc1234' } })} />);
    const tag = screen.getByRole('button', { name: 'Copy build abc1234' });
    expect(tag).toHaveTextContent('abc1234');
    expect(tag.querySelector('svg')).toBeNull();
    expect(tag.querySelector('[data-slot="status-clock-branch"]')).toBeNull();
  });

  it('colours come from the clock tokens', () => {
    render(<StatusClock {...statusClockPropsFactory({ state: 'paused' })} />);
    expect(screen.getByRole('timer')).toHaveClass('text-[color:var(--oui-clock-paused)]');
    expect(slot('status-clock-icon')).toHaveClass('text-[color:var(--oui-clock-paused-icon)]');
  });

  it('every example renders', () => {
    statusClockExamples.forEach((example) => {
      const { unmount } = render(<StatusClock {...statusClockPropsFactory(example.args)} />);
      expect(screen.getByRole('timer')).toBeInTheDocument();
      unmount();
    });
  });
});
