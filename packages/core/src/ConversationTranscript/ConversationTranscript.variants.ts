import { cva } from 'class-variance-authority';

/** Wrappers the composition adds around parts that need one. The Transcript owns the column and the turn spacing. */
export const conversationTranscriptPartVariants = cva('min-w-0', {
  variants: {
    part: {
      feedback: 'box-border max-w-full',
      approval: 'box-border max-w-full',
    },
  },
  defaultVariants: { part: 'feedback' },
});
