import * as React from 'react';

/** Within this many px of the end still counts as "at the end". */
export const AT_END_PX = 48;
/** A scroll within this long of a wheel, touch, pointer or key press is the person's. */
const PERSON_SCROLL_MS = 400;

/** The scroll geometry `isAtEnd` reads; any scroll container satisfies it. */
export interface ScrollBoxMetrics {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}

/** True when the box is scrolled to its end, or within `AT_END_PX` of it. */
export const isAtEnd = (box: ScrollBoxMetrics, threshold: number = AT_END_PX): boolean =>
  box.scrollHeight - box.scrollTop - box.clientHeight <= threshold;

/**
 * A log that follows its newest line until the person scrolls away, then offers a way back. `threshold` (px, default 48) is how close to the end still counts as at the end; a conversation uses 200.
 *
 * `lines` is how many lines the log holds (a growing count means new lines arrived); `activity` is any value
 * that changes when the content changes without the count changing (a line streaming in, a stage starting).
 * Returns the `ref` for the scroll container, `following` (new lines are being followed), `unseen` (lines
 * that arrived while not following), `jump` (back to the end) and the handlers to put on the container:
 * `onScroll`, and `onPersonScroll` for wheel, touch, pointer-down and key events. Only the person's own
 * scrolling can stop the following: the window growing or a line changing height moves the scroll position
 * too, and must not. All returned callbacks keep their identity across renders.
 *
 * @example
 * const log = useFollowLatest(messages.length, streamingText);
 * <div ref={log.ref} onScroll={log.onScroll} onWheel={log.onPersonScroll} onKeyDown={log.onPersonScroll}>…</div>
 * {!log.following && <button onClick={log.jump}>{log.unseen} new</button>}
 */
export function useFollowLatest<T extends HTMLElement = HTMLDivElement>(
  lines: number,
  activity?: unknown,
  threshold: number = AT_END_PX,
) {
  const ref = React.useRef<T>(null);
  const [following, setFollowingState] = React.useState(true);
  const [unseen, setUnseen] = React.useState(0);
  const seen = React.useRef(lines);
  // Mirrors `following` so the scroll handler can stay stable while still reading the latest value.
  const followingRef = React.useRef(true);
  const setFollowing = React.useCallback((value: boolean) => {
    followingRef.current = value;
    setFollowingState(value);
  }, []);

  const toEnd = React.useCallback(() => {
    const box = ref.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, []);

  const byPerson = React.useRef(false);
  const settle = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onPersonScroll = React.useCallback(() => {
    byPerson.current = true;
    if (settle.current) clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      byPerson.current = false;
    }, PERSON_SCROLL_MS);
  }, []);
  React.useEffect(
    () => () => {
      if (settle.current) clearTimeout(settle.current);
    },
    [],
  );

  // New lines (or a stage starting): follow them, or count them.
  React.useEffect(() => {
    if (following) toEnd();
    else if (lines > seen.current) setUnseen((n) => n + (lines - seen.current));
    seen.current = lines;
  }, [lines, activity, following, toEnd]);

  const onScroll = React.useCallback(() => {
    const box = ref.current;
    if (!box) return;
    if (!byPerson.current) {
      // Not the person: stay with the newest line if that is where we were.
      if (followingRef.current) toEnd();
      return;
    }
    const end = isAtEnd(box, threshold);
    setFollowing(end);
    if (end) setUnseen(0);
  }, [setFollowing, toEnd, threshold]);

  const jump = React.useCallback(() => {
    setFollowing(true);
    setUnseen(0);
    toEnd();
  }, [setFollowing, toEnd]);

  return { ref, following, unseen, onScroll, onPersonScroll, jump };
}
