import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { Transcript, type ConversationTurn } from '@oc-tech/omni-ui-components/Transcript';
import { defaultWindowStart, offsetFromBottom, restoreFromBottom } from '@oc-tech/omni-ui-components/lib/chat/window';

const turn = (n: number): ConversationTurn => ({
  id: `t${n}`,
  user: { id: `u${n}`, role: 'user', createdAt: '2026-10-06T09:00:00Z', parts: [{ type: 'text', text: `Question ${n}` }] },
});
const turns = (count: number, from = 0) => Array.from({ length: count }, (_, i) => turn(from + i));
const ids = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('[data-turn-id]')).map((node) => node.dataset.turnId);

const ITEM_PX = 100;
const VIEWPORT_PX = 300;

/** A scroll container whose geometry follows what is drawn: each turn is ITEM_PX tall (jsdom has no layout). */
function Harness({ all, ...rest }: { all: ConversationTurn[] } & Partial<React.ComponentProps<typeof Transcript>>) {
  const box = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = box.current!;
    const count = () => node.querySelectorAll('[data-turn-id]').length;
    Object.defineProperty(node, 'scrollHeight', { configurable: true, get: () => count() * ITEM_PX });
    Object.defineProperty(node, 'clientHeight', { configurable: true, get: () => VIEWPORT_PX });
  }, []);
  return (
    <div ref={box} data-testid="box" style={{ overflowY: 'auto' }}>
      <Transcript turns={all} onLoadEarlier={rest.onLoadEarlier} {...rest} />
    </div>
  );
}

describe('omni-ui-components/Transcript history windowing', () => {
  it('draws every turn when windowSize is absent', () => {
    const { container } = render(<Transcript turns={turns(30)} />);
    expect(ids(container)).toHaveLength(30);
    expect(screen.queryByRole('button', { name: 'Load earlier messages' })).toBeNull();
  });

  it('draws only the newest windowSize turns and keeps their real indexes', () => {
    const seen: Array<[string, number, boolean]> = [];
    const { container } = render(
      <Transcript
        turns={turns(2000)}
        windowSize={25}
        renderTurn={(t, context) => {
          seen.push([t.id, context.index, context.last]);
          return t.id;
        }}
      />,
    );
    expect(ids(container)).toHaveLength(25);
    expect(ids(container)[0]).toBe('t1975');
    expect(ids(container).at(-1)).toBe('t1999');
    expect(seen.at(-1)).toEqual(['t1999', 1999, true]);
    expect(seen.find(([id]) => id === 't1975')?.[1]).toBe(1975);
    expect(screen.getByRole('button', { name: 'Load earlier messages' })).toBeEnabled();
  });

  it('reveals windowStep more per press without calling the host, then hands over to onLoadEarlier', async () => {
    const onLoadEarlier = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Transcript turns={turns(7)} windowSize={3} windowStep={2} hasEarlier onLoadEarlier={onLoadEarlier} />);
    const press = () => user.click(screen.getByRole('button', { name: 'Load earlier messages' }));
    expect(ids(container)).toHaveLength(3);
    await press();
    expect(ids(container)).toHaveLength(5);
    await press();
    expect(ids(container)).toHaveLength(7);
    expect(onLoadEarlier).not.toHaveBeenCalled();
    await press();
    expect(onLoadEarlier).toHaveBeenCalledTimes(1);
    expect(onLoadEarlier.mock.calls[0][0].id).toBe('t0');
  });

  it('shows the button for hidden turns even without hasEarlier or onLoadEarlier, and removes it once all are drawn', async () => {
    const user = userEvent.setup();
    render(<Transcript turns={turns(4)} windowSize={2} />);
    await user.click(screen.getByRole('button', { name: 'Load earlier messages' }));
    expect(screen.queryByRole('button', { name: 'Load earlier messages' })).toBeNull();
  });

  it('keeps the scroll offset from the bottom when earlier turns are revealed', async () => {
    const user = userEvent.setup();
    const { getByTestId } = render(<Harness all={turns(50)} windowSize={10} windowStep={10} />);
    const box = getByTestId('box');
    // Scrolled 150px above the end, reading.
    box.scrollTop = box.scrollHeight - VIEWPORT_PX - 150;
    expect(offsetFromBottom(box)).toBe(150);
    await user.click(screen.getByRole('button', { name: 'Load earlier messages' }));
    expect(box.querySelectorAll('[data-turn-id]')).toHaveLength(20);
    expect(box.scrollHeight).toBe(20 * ITEM_PX);
    expect(offsetFromBottom(box)).toBe(150);
    await user.click(screen.getByRole('button', { name: 'Load earlier messages' }));
    expect(box.querySelectorAll('[data-turn-id]')).toHaveLength(30);
    expect(offsetFromBottom(box)).toBe(150);
  });

  it('grows the window when a turn is appended instead of dropping the oldest drawn turn', () => {
    const { container, rerender } = render(<Transcript turns={turns(10)} windowSize={4} />);
    expect(ids(container)).toEqual(['t6', 't7', 't8', 't9']);
    rerender(<Transcript turns={turns(11)} windowSize={4} />);
    expect(ids(container)).toEqual(['t6', 't7', 't8', 't9', 't10']);
  });

  it('starts a fresh window for another conversation', () => {
    const { container, rerender } = render(<Transcript turns={turns(10)} windowSize={4} />);
    rerender(<Transcript turns={turns(20, 100)} windowSize={4} />);
    expect(ids(container)).toEqual(['t116', 't117', 't118', 't119']);
  });

  it('passes the same turn objects through (extended item)', () => {
    type Mine = ConversationTurn & { tag: string };
    const mine: Mine[] = turns(5).map((t) => ({ ...t, tag: 'x' }));
    const got: Mine[] = [];
    render(<Transcript<never, Mine> turns={mine} windowSize={2} renderTurn={(t) => { got.push(t); return t.tag; }} />);
    expect(got.every((t) => mine.includes(t))).toBe(true);
    expect(got.at(-1)?.tag).toBe('x');
  });
});

describe('omni-ui-components/lib/chat/window', () => {
  it('computes offsets and the default start', () => {
    const box = { scrollHeight: 1000, scrollTop: 450, clientHeight: 300 };
    expect(offsetFromBottom(box)).toBe(250);
    box.scrollHeight = 1600;
    restoreFromBottom(box, 250);
    expect(box.scrollTop).toBe(1050);
    expect(defaultWindowStart(2000, 25)).toBe(1975);
    expect(defaultWindowStart(3, 25)).toBe(0);
    expect(defaultWindowStart(10, 0)).toBe(9);
  });
});
