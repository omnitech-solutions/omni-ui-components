import { render } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useStableRjsfCallbacks } from './useStableRjsfCallbacks';

type Stable = ReturnType<typeof useStableRjsfCallbacks<string>>;

describe('useStableRjsfCallbacks', () => {
  it('delivers a change to the handler of the latest render, even before passive effects run', () => {
    const stale = vi.fn();
    const latest = vi.fn();
    let stable: Stable | undefined;
    const Probe = ({ onChange }: { onChange: (v: unknown) => void }) => {
      stable = useStableRjsfCallbacks<string>({
        id: 'x',
        options: {},
        onChange,
        onBlur: vi.fn(),
        onFocus: vi.fn(),
      } as never);
      return null;
    };
    // A layout effect of a child runs before the parent's passive effects: the window the race lives in.
    const Child = ({ fire }: { fire: boolean }) => {
      React.useLayoutEffect(() => {
        if (fire) stable?.onChange('');
      });
      return null;
    };
    const App = ({ onChange, fire }: { onChange: (v: unknown) => void; fire: boolean }) => (
      <>
        <Probe onChange={onChange} />
        <Child fire={fire} />
      </>
    );
    const view = render(<App onChange={stale} fire={false} />);
    view.rerender(<App onChange={latest} fire />);
    expect(latest).toHaveBeenCalledWith('');
    expect(stale).not.toHaveBeenCalled();
  });
});
