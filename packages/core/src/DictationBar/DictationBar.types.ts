import * as React from 'react';

export interface DictationBarLabels {
  /** Shown while nothing has been heard yet. Default `Listening…`. */
  listening: string;
  /** Name of the cancel button. Default `Cancel`. */
  cancel: string;
  /** Name of the done button. Default `Done`. */
  done: string;
}

export const DEFAULT_DICTATION_LABELS: DictationBarLabels = {
  listening: 'Listening…',
  cancel: 'Cancel',
  done: 'Done',
};

export interface DictationBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'onCancel'> {
  /** Dictation is running. Not active: nothing is rendered, so the composer's own field shows. Default true. */
  active?: boolean;
  /** The words heard so far (live transcript). Empty shows `labels.listening`. */
  text?: string;
  /** Discard what was heard and stop. Fires when Cancel is chosen. Absent: no Cancel button. */
  onCancel?: () => void | Promise<void>;
  /** Keep what was heard and stop. Payload: the transcript (`text`) so the host can append it to the draft. Absent: no Done button. */
  onDone?: (text: string) => void | Promise<void>;
  /** Icon node of the cancel button (e.g. an X). */
  cancelIcon?: React.ReactNode;
  /** Icon node of the done button (e.g. a check). */
  doneIcon?: React.ReactNode;
  /** `stacked` shows the pulsing record dot; `pill` (a single row) does not. Default `stacked`. */
  variant?: 'stacked' | 'pill';
  /** Number of waveform bars (decorative, CSS-only, `aria-hidden`). Default 20. */
  bars?: number;
  /** Replaces the CSS waveform, e.g. a live audio meter. */
  waveform?: React.ReactNode;
  /** Render the Cancel and Done buttons inside the bar (default). Off: put them in the composer's trailing slot yourself. */
  showActions?: boolean;
  labels?: Partial<DictationBarLabels>;
}
