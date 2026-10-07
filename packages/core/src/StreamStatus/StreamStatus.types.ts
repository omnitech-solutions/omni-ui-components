import type * as React from 'react';

export type StreamStatusKind = 'tool' | 'reasoning' | 'stall';
export type StreamToolStatus = 'running' | 'completed' | 'failed';

export interface StreamStatusLabels {
  /** "Calling X…" */
  calling: (toolName: string) => string;
  /** "X completed" */
  completed: (toolName: string) => string;
  /** "X failed" */
  failed: (toolName: string) => string;
  /** Used when a tool has no name. */
  unnamedTool: string;
  reasoning: string;
  stall: string;
}

export interface StreamStatusProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** What the stream is doing. */
  kind: StreamStatusKind;
  /** The tool's name (`kind: 'tool'`). */
  toolName?: string;
  /** The tool call's state (`kind: 'tool'`). Default `running`. */
  status?: StreamToolStatus;
  /** Replaces the generated text. */
  message?: React.ReactNode;
  /** Epoch ms the activity began. Default: the moment the component mounts (the timer resets on mount). */
  startedAt?: number;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Hide the elapsed timer. */
  hideTimer?: boolean;
  labels?: Partial<StreamStatusLabels>;
}
