import type { PanelScroll } from '../Panel';
import type { ConversationTurn } from './Transcript.conversation.types';

/**
 * The Panel `scroll` config for a conversation: stick to the newest turn until the person scrolls away, then show the
 * jump pill. The Transcript never scrolls anything itself (the Panel's `useFollowLatest` does), so this only maps the
 * turns onto `lines` (a growing turn count while scrolled up is what the pill counts) and `activity` (the streaming
 * text changing without the count changing).
 *
 * The original follows while within {@link CONVERSATION_STICK_THRESHOLD} (200px) of the end; `useFollowLatest` uses its
 * own `AT_END_PX` (48px). Until the Panel takes a threshold option this is the Panel's value.
 *
 * @example
 * <Panel scroll={conversationScroll(turns, live?.text)}><Transcript turns={turns} live={live} /></Panel>
 */
export const conversationScroll = (turns: readonly ConversationTurn[], activity?: unknown, extra: Partial<PanelScroll> = {}): PanelScroll => ({
  fade: true,
  thinScrollbar: true,
  stickToBottom: true,
  lines: turns.length,
  activity,
  ...extra,
});
