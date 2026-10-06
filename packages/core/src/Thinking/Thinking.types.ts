import * as React from 'react';

export interface ThinkingLabels {
  /** Header while the model is still thinking. Default `Thinking…`. */
  thinking: string;
  /** Header after, when no duration is known. Default `Thought`. */
  thought: string;
  /** Header after, with the duration; `{n}` is whole seconds (at least 1). Default `Thought for {n}s`. */
  thoughtFor: string;
}

export interface ThinkingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The reasoning text, streamed or stored. Shown in the expandable body. */
  text?: string;
  /** Still thinking: the spinner and `labels.thinking`. After: the `icon` and `Thought for Ns`. */
  streaming?: boolean;
  /** Duration of the finished thought in seconds (rounded, never below 1 in the label). */
  seconds?: number;
  /** Expanded state (controlled). */
  open?: boolean;
  defaultOpen?: boolean;
  /** Fires whenever the disclosure opens or closes (controlled or not), with the new `open` state. */
  onOpenChange?: (open: boolean) => void;
  /** Icon node shown once the thought is done (the original uses a brain). */
  icon?: React.ReactNode;
  /** Replaces the built-in CSS spinner shown while streaming. */
  spinner?: React.ReactNode;
  /** Icon node of the disclosure arrow; it turns over when open. */
  chevron?: React.ReactNode;
  labels?: Partial<ThinkingLabels>;
}
