import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@testing-library/react';

import { SessionBar } from '@oc-tech/omni-ui-components/SessionBar';
import { StatusClock } from '@oc-tech/omni-ui-components/StatusClock';
import { SessionBarDemo, sessionBarExamples, sessionBarPropsFactory } from 'factories/omni-ui-components/SessionBar/SessionBar.factories';
import { RecordIcon } from 'factories/omni-ui-components/StatusClock/StatusClock.factories';

const bar = () => screen.getByRole('toolbar', { name: 'Session controls' });

describe('omni-ui-components/SessionBar', () => {
  it('is a labelled toolbar spanning the full width, wrapping, with nothing absolutely positioned', () => {
    render(<SessionBar {...sessionBarPropsFactory()} />);
    expect(bar()).toHaveAttribute('data-variant', 'bar');
    expect(bar()).toHaveClass('flex', 'w-full', 'flex-wrap', 'justify-between');
    expect(bar().innerHTML).not.toMatch(/\babsolute\b|\bfixed\b/);
    expect(bar().className).not.toMatch(/\babsolute\b|\bfixed\b/);
  });

  it('label is configurable', () => {
    render(<SessionBar label="Footer" />);
    expect(screen.getByRole('toolbar', { name: 'Footer' })).toBeInTheDocument();
  });

  it('live: Pause session (outline, filled icon) and End session (outlined red), no Resume', () => {
    render(<SessionBar {...sessionBarPropsFactory()} />);
    const pause = screen.getByRole('button', { name: 'Pause session' });
    expect(pause).toHaveClass('border', 'border-[color:var(--oui-tone-neutral-border)]', 'bg-transparent', '[&_svg]:fill-current');
    expect(screen.queryByRole('button', { name: 'Resume session' })).toBeNull();
    const end = screen.getByRole('button', { name: 'End session' });
    expect(end).toHaveClass('border-[color:var(--oui-tone-danger-border)]', 'bg-transparent', 'text-[color:var(--oui-tone-danger-fg)]');
  });

  it('paused: Resume session (green solid, filled icon) takes the Pause slot', () => {
    render(<SessionBar {...sessionBarPropsFactory({ status: 'paused' })} />);
    const resume = screen.getByRole('button', { name: 'Resume session' });
    expect(resume).toHaveClass(
      'bg-[color:var(--oui-tone-success-solid-bg)]',
      'text-[color:var(--oui-tone-success-solid-fg)]',
      '[&_svg]:fill-current',
    );
    expect(screen.queryByRole('button', { name: 'Pause session' })).toBeNull();
    const buttons = within(bar()).getAllByRole('button');
    expect(buttons.map((b) => b.textContent)).toEqual(['Resume session', 'End session']);
  });

  it('labels and icons come from config', () => {
    render(<SessionBar pause={{ label: 'Pause', icon: <i data-testid="p" /> }} end={{ label: 'Stop', icon: <i data-testid="e" /> }} />);
    expect(screen.getByRole('button', { name: 'Pause' })).toContainElement(screen.getByTestId('p'));
    expect(screen.getByRole('button', { name: 'Stop' })).toContainElement(screen.getByTestId('e'));
  });

  it('calls the pause, resume and end callbacks', async () => {
    const pause = vi.fn();
    const resume = vi.fn();
    const end = vi.fn();
    const { rerender } = render(<SessionBar pause={{ onClick: pause }} resume={{ onClick: resume }} end={{ onClick: end }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pause session' }));
    await userEvent.click(screen.getByRole('button', { name: 'End session' }));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenCalledTimes(1);
    rerender(<SessionBar status="paused" pause={{ onClick: pause }} resume={{ onClick: resume }} end={{ onClick: end }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Resume session' }));
    expect(resume).toHaveBeenCalledTimes(1);
    expect(pause).toHaveBeenCalledTimes(1);
  });

  it('`end: null` hides End; `actions` replaces the buttons', () => {
    const { rerender } = render(<SessionBar end={null} />);
    expect(screen.queryByRole('button', { name: 'End session' })).toBeNull();
    rerender(<SessionBar actions={<button>Custom</button>} />);
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pause session' })).toBeNull();
  });

  it('End with confirm config asks first: the callback runs on confirm only, cancel runs onCancel', async () => {
    const end = vi.fn();
    const cancel = vi.fn();
    render(
      <SessionBar
        end={{
          onClick: end,
          confirm: { title: 'End this session?', onCancel: cancel },
        }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'End session' }));
    const dialog = within(await screen.findByRole('dialog'));
    expect(dialog.getByText('End this session?')).toBeInTheDocument();
    expect(end).not.toHaveBeenCalled();
    await userEvent.click(dialog.getByRole('button', { name: 'Keep going' }));
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(end).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await userEvent.click(screen.getByRole('button', { name: 'End session' }));
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'End now',
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(end).toHaveBeenCalledTimes(1);
  });

  it('background never changes between live and paused (same classes, no tint)', () => {
    const { rerender } = render(<SessionBar {...sessionBarPropsFactory()} />);
    const live = bar().className;
    rerender(<SessionBar {...sessionBarPropsFactory({ status: 'paused' })} />);
    expect(bar().className).toBe(live);
    expect(live).toContain('--oui-panel-bg');
    expect(live).toContain('--oui-panel-see-through');
    expect(live).not.toMatch(/warning|yellow|amber/);
  });

  it('leading sits in the left slot, actions are right-aligned', () => {
    render(<SessionBar leading={<StatusClock elapsed="2:18:20" icon={<RecordIcon />} />} />);
    const groups = bar().querySelectorAll('[data-slot="toolbar-group"]');
    expect(groups[0]).toHaveAttribute('data-group-id', 'leading');
    expect(groups[0]).toContainElement(screen.getByRole('timer'));
    expect(groups[1]).toHaveAttribute('data-group-id', 'trailing');
    expect(groups[1]).toHaveClass('ml-auto');
    expect(bar().querySelector('[role="separator"]')).toBeNull();
  });

  it('demo toggles Pause <-> Resume with the Paused label, and copies the build tag', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const onAction = vi.fn();
    render(<SessionBarDemo devBuild onAction={onAction} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pause session' }));
    expect(screen.getByText('Paused')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Resume session' }));
    expect(screen.queryByText('Paused')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /Copy build/ }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument());
    expect(onAction).toHaveBeenCalledWith('build:copy', expect.any(String));
  });

  it('keyboard order: build tag, Pause, End', async () => {
    render(<SessionBarDemo devBuild />);
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /Copy build/ })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Pause session' })).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'End session' })).toHaveFocus();
  });

  it('every example renders', () => {
    sessionBarExamples.forEach((example) => {
      const { unmount } = render(<SessionBarDemo {...example.args} />);
      expect(bar()).toBeInTheDocument();
      unmount();
    });
  });
});
