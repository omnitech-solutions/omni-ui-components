import '@testing-library/jest-dom';
import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { StreamStatus, formatElapsed } from '@oc-tech/omni-ui-components';
import { streamStatusPropsFactory } from 'factories/omni-ui-components/StreamStatus/StreamStatus.factories';

const timer = () => document.querySelector('[data-slot="stream-status-timer"]');

describe('omni-ui-components/StreamStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('formats mm:ss', () => {
    expect(formatElapsed(0)).toBe('00:00');
    expect(formatElapsed(999)).toBe('00:00');
    expect(formatElapsed(59_000)).toBe('00:59');
    expect(formatElapsed(61_000)).toBe('01:01');
    expect(formatElapsed(3_600_000)).toBe('60:00');
    expect(formatElapsed(-5000)).toBe('00:00');
  });

  it('labels each kind and status', () => {
    const { rerender } = render(<StreamStatus {...streamStatusPropsFactory({ icon: undefined })} />);
    expect(screen.getByRole('status')).toHaveTextContent('Calling search_docs…');
    rerender(<StreamStatus {...streamStatusPropsFactory({ status: 'completed' })} />);
    expect(screen.getByRole('status')).toHaveTextContent('search_docs completed');
    rerender(<StreamStatus {...streamStatusPropsFactory({ status: 'failed' })} />);
    expect(screen.getByRole('status')).toHaveTextContent('search_docs failed');
    rerender(<StreamStatus kind="reasoning" />);
    expect(screen.getByRole('status')).toHaveTextContent('Reasoning…');
    rerender(<StreamStatus kind="stall" />);
    expect(screen.getByRole('status')).toHaveTextContent('Still working…');
    rerender(<StreamStatus kind="tool" />);
    expect(screen.getByRole('status')).toHaveTextContent('Calling tool…');
  });

  it('uses message and labels overrides', () => {
    const { rerender } = render(<StreamStatus kind="reasoning" message="Thinking hard" />);
    expect(screen.getByRole('status')).toHaveTextContent('Thinking hard');
    rerender(<StreamStatus kind="reasoning" labels={{ reasoning: 'Réflexion…' }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Réflexion…');
  });

  it('ticks the timer once a second from mount', () => {
    render(<StreamStatus kind="reasoning" />);
    expect(timer()).toHaveTextContent('00:00');
    act(() => void vi.advanceTimersByTime(1000));
    expect(timer()).toHaveTextContent('00:01');
    act(() => void vi.advanceTimersByTime(64_000));
    expect(timer()).toHaveTextContent('01:05');
  });

  it('resets on mount', () => {
    const first = render(<StreamStatus kind="reasoning" />);
    act(() => void vi.advanceTimersByTime(5000));
    expect(timer()).toHaveTextContent('00:05');
    first.unmount();
    render(<StreamStatus kind="reasoning" />);
    expect(timer()).toHaveTextContent('00:00');
  });

  it('counts from startedAt', () => {
    render(<StreamStatus kind="reasoning" startedAt={Date.now() - 90_000} />);
    expect(timer()).toHaveTextContent('01:30');
  });

  it('stops and hides the timer once a tool finishes', () => {
    const { rerender } = render(<StreamStatus kind="tool" toolName="x" />);
    act(() => void vi.advanceTimersByTime(2000));
    expect(timer()).toHaveTextContent('00:02');
    rerender(<StreamStatus kind="tool" toolName="x" status="completed" />);
    expect(timer()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('hides the timer on request and clears the interval on unmount', () => {
    const { unmount } = render(<StreamStatus kind="stall" />);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    render(<StreamStatus kind="stall" hideTimer />);
    expect(timer()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('is a polite status region and keeps the timer out of the announcement', () => {
    render(<StreamStatus kind="reasoning" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(timer()).toHaveAttribute('aria-hidden', 'true');
  });

  it('marks tone via data attributes', () => {
    render(<StreamStatus kind="tool" toolName="x" status="failed" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'failed');
    expect(screen.getByRole('status')).toHaveAttribute('data-kind', 'tool');
  });
});
