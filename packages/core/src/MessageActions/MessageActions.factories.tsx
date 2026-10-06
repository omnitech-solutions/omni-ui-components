import * as React from 'react';
import { ChevronLeft, ChevronRight, Copy, RefreshCw, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react';

import { MessageActions, type MessageAction, type MessageActionsProps } from '@oc-tech/omni-ui-components/MessageActions';
import { VersionPager } from '@oc-tech/omni-ui-components/VersionPager';
import type { Variant } from '../../internal/support/makeFactory';

/** The original's action bar: copy, regenerate, a pager, thumbs and read aloud. */
export const sampleActions = (
  state: {
    rating?: 'up' | 'down' | null;
    speaking?: boolean;
    busy?: boolean;
  } = {},
): MessageAction[] => [
  { id: 'copy', icon: <Copy />, label: 'Copy', onClick: () => undefined },
  {
    id: 'regenerate',
    icon: <RefreshCw />,
    label: 'Regenerate',
    disabled: state.busy,
    onClick: () => undefined,
  },
  {
    id: 'pager',
    node: (
      <VersionPager index={1} count={2} previousIcon={<ChevronLeft />} nextIcon={<ChevronRight />} disabled={state.busy} onMove={() => undefined} />
    ),
  },
  {
    id: 'up',
    icon: <ThumbsUp />,
    label: 'Good reply',
    pressed: state.rating === 'up',
    onClick: () => undefined,
  },
  {
    id: 'down',
    icon: <ThumbsDown />,
    label: 'Bad reply',
    pressed: state.rating === 'down',
    onClick: () => undefined,
  },
  {
    id: 'speak',
    icon: <Volume2 />,
    label: state.speaking ? 'Stop reading' : 'Read aloud',
    pressed: Boolean(state.speaking),
    onClick: () => undefined,
  },
];

/** Build `<MessageActions>` props for stories and tests. */
export const messageActionsPropsFactory = (overrides: Partial<MessageActionsProps> = {}): MessageActionsProps => ({
  actions: sampleActions(),
  meta: 'DeepSeek R1 · 1,284 tokens · local',
  ...overrides,
});

export const messageActionsVariants: Variant<MessageActionsProps>[] = [
  { name: 'Default with meta', args: {} },
  {
    name: 'Thumbs up pressed',
    args: { actions: sampleActions({ rating: 'up' }) },
  },
  {
    name: 'Busy (regenerate disabled)',
    args: { actions: sampleActions({ busy: true }) },
  },
  { name: 'Buttons only', args: { meta: undefined } },
];

/** The bar with working toggles (thumbs are mutually exclusive, read aloud toggles). */
export const MessageActionsDemo: React.FC<{
  onAction?: (name: string, detail?: unknown) => void;
  meta?: React.ReactNode;
}> = ({ onAction, meta = 'Claude · 842 tokens' }) => {
  const [rating, setRating] = React.useState<'up' | 'down' | null>(null);
  const [speaking, setSpeaking] = React.useState(false);
  const actions = sampleActions({ rating, speaking }).map((action) => {
    if ('node' in action) return action;
    const run: Record<string, () => void> = {
      copy: () => onAction?.('copy'),
      regenerate: () => onAction?.('regenerate'),
      up: () => setRating((current) => (current === 'up' ? null : 'up')),
      down: () => setRating((current) => (current === 'down' ? null : 'down')),
      speak: () => setSpeaking((current) => !current),
    };
    return {
      ...action,
      onClick: () => {
        onAction?.(action.id);
        run[action.id]?.();
      },
    };
  });
  return <MessageActions actions={actions} meta={meta} />;
};
