import '@testing-library/jest-dom';

import { AT_END_PX, isAtEnd, useFollowLatest } from '@oc-tech/omni-ui-components';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import * as React from 'react';

describe('isAtEnd (ported from the studio follow-latest tests)', () => {
  const box = (scrollTop: number) => ({
    scrollHeight: 1000,
    clientHeight: 400,
    scrollTop,
  });

  it('is at the end at the bottom and within a few px of it', () => {
    expect(isAtEnd(box(600))).toBe(true);
    expect(isAtEnd(box(600 - AT_END_PX))).toBe(true);
  });

  it('threshold is configurable (default 48): 150px away is at the end with 200, not with the default', () => {
    expect(isAtEnd(box(450))).toBe(false);
    expect(isAtEnd(box(450), 200)).toBe(true);
    expect(isAtEnd(box(399), 200)).toBe(false);
  });

  it('is not at the end once the person has scrolled up', () => {
    expect(isAtEnd(box(600 - AT_END_PX - 1))).toBe(false);
    expect(isAtEnd(box(0))).toBe(false);
  });
});

/** A log whose scroll geometry is faked (happy-dom has no layout): 1000px of content in a 400px box. */
const Log: React.FC<{ lines: number; activity?: unknown }> = ({ lines, activity }) => {
  const log = useFollowLatest(lines, activity);
  const attach = React.useCallback(
    (node: HTMLDivElement | null) => {
      (log.ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (node) {
        Object.defineProperty(node, 'scrollHeight', {
          configurable: true,
          get: () => 1000 + lines * 10,
        });
        Object.defineProperty(node, 'clientHeight', {
          configurable: true,
          value: 400,
        });
      }
    },
    [log.ref, lines],
  );
  return (
    <div>
      <div
        ref={attach}
        data-testid="box"
        onScroll={log.onScroll}
        onWheel={log.onPersonScroll}
        onKeyDown={log.onPersonScroll}
        onTouchMove={log.onPersonScroll}
        onPointerDown={log.onPersonScroll}
      />
      <span data-testid="following">{String(log.following)}</span>
      <span data-testid="unseen">{log.unseen}</span>
      <button onClick={log.jump}>jump</button>
    </div>
  );
};

const scrollUpByPerson = (box: HTMLElement, top = 0) => {
  fireEvent.wheel(box);
  box.scrollTop = top;
  fireEvent.scroll(box);
};

describe('useFollowLatest', () => {
  it('starts following, with nothing unseen, and keeps the box at its end as lines arrive', () => {
    const { rerender } = render(<Log lines={3} />);
    const box = screen.getByTestId('box');
    expect(screen.getByTestId('following')).toHaveTextContent('true');
    expect(box.scrollTop).toBe(1030);
    rerender(<Log lines={4} />);
    expect(box.scrollTop).toBe(1040);
    expect(screen.getByTestId('unseen')).toHaveTextContent('0');
  });

  it('stops following when the person scrolls up, and counts the lines that arrive meanwhile', () => {
    const { rerender } = render(<Log lines={3} />);
    const box = screen.getByTestId('box');
    scrollUpByPerson(box);
    expect(screen.getByTestId('following')).toHaveTextContent('false');
    rerender(<Log lines={5} />);
    expect(screen.getByTestId('unseen')).toHaveTextContent('2');
    expect(box.scrollTop).toBe(0);
    rerender(<Log lines={6} />);
    expect(screen.getByTestId('unseen')).toHaveTextContent('3');
  });

  it('a scroll the person did not cause (content or window growing) does not stop the following', () => {
    render(<Log lines={3} />);
    const box = screen.getByTestId('box');
    box.scrollTop = 100;
    fireEvent.scroll(box);
    expect(screen.getByTestId('following')).toHaveTextContent('true');
    expect(box.scrollTop).toBe(1030);
  });

  it("keys, touch and pointer presses also mark a scroll as the person's", () => {
    for (const fire of [fireEvent.keyDown, fireEvent.touchMove, fireEvent.pointerDown]) {
      const { unmount } = render(<Log lines={3} />);
      const box = screen.getByTestId('box');
      fire(box);
      box.scrollTop = 0;
      fireEvent.scroll(box);
      expect(screen.getByTestId('following')).toHaveTextContent('false');
      unmount();
    }
  });

  it('scrolling back to the end by hand resumes following and clears the count', () => {
    const { rerender } = render(<Log lines={3} />);
    const box = screen.getByTestId('box');
    scrollUpByPerson(box);
    rerender(<Log lines={4} />);
    expect(screen.getByTestId('unseen')).toHaveTextContent('1');
    scrollUpByPerson(box, 1040 - 400 - AT_END_PX / 2);
    expect(screen.getByTestId('following')).toHaveTextContent('true');
    expect(screen.getByTestId('unseen')).toHaveTextContent('0');
  });

  it('jump returns to the end, resumes following and clears the count', () => {
    const { rerender } = render(<Log lines={3} />);
    const box = screen.getByTestId('box');
    scrollUpByPerson(box);
    rerender(<Log lines={4} />);
    fireEvent.click(screen.getByText('jump'));
    expect(screen.getByTestId('following')).toHaveTextContent('true');
    expect(screen.getByTestId('unseen')).toHaveTextContent('0');
    expect(box.scrollTop).toBe(1040);
  });

  it('activity changing without the line count changing follows the end but counts nothing', () => {
    const { rerender } = render(<Log lines={3} activity="a" />);
    const box = screen.getByTestId('box');
    box.scrollTop = 5;
    rerender(<Log lines={3} activity="b" />);
    expect(box.scrollTop).toBe(1030);
    scrollUpByPerson(box);
    rerender(<Log lines={3} activity="c" />);
    expect(screen.getByTestId('unseen')).toHaveTextContent('0');
  });

  it('keeps the identity of every callback and the ref across renders', () => {
    const { result, rerender } = renderHook(({ lines }) => useFollowLatest(lines), {
      initialProps: { lines: 1 },
    });
    const first = result.current;
    rerender({ lines: 2 });
    act(() => result.current.jump());
    expect(result.current.onScroll).toBe(first.onScroll);
    expect(result.current.onPersonScroll).toBe(first.onPersonScroll);
    expect(result.current.jump).toBe(first.jump);
    expect(result.current.ref).toBe(first.ref);
  });
});
