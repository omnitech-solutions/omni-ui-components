import type { PanelScroll } from '../Panel';
import { CONVERSATION_STICK_THRESHOLD, type ConversationTurn } from './Transcript.conversation.types';

/**
 * The Panel `scroll` config for a conversation: stick to the newest turn until the person scrolls away, then show the
 * jump pill. The Transcript never scrolls anything itself (the Panel's `useFollowLatest` does), so this only maps the
 * turns onto `lines` (a growing turn count while scrolled up is what the pill counts) and `activity` (the streaming
 * text changing without the count changing).
 *
 * The original follows while within {@link CONVERSATION_STICK_THRESHOLD} (200px) of the end, so `threshold` is set to it.
 *
 * @example
 * <Panel scroll={conversationScroll(turns, live?.text)}><Transcript turns={turns} live={live} /></Panel>
 */
export const conversationScroll = (turns: readonly ConversationTurn[], activity?: unknown, extra: Partial<PanelScroll> = {}): PanelScroll => ({
  fade: true,
  thinScrollbar: true,
  stickToBottom: true,
  threshold: CONVERSATION_STICK_THRESHOLD,
  lines: turns.length,
  activity,
  ...extra,
});
