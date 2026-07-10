import * as React from 'react';

export interface PillSegment {
  content: React.ReactNode;
  tinted?: boolean;
  uppercase?: boolean;
  className?: string;
}

export interface SegmentedPillProps {
  segments: PillSegment[];
  className?: string;
}

export const SegmentedPill: React.FC<SegmentedPillProps> = ({ segments, className }) => (
  <div className={className ?? 'inline-flex items-stretch overflow-hidden rounded-md border border-[var(--oui-border-field)] text-xs font-mono'}>
    {segments.map((segment, index) => {
      const classes = [
        'flex items-center px-2.5 py-1',
        index > 0 ? 'border-l border-[var(--oui-border-field)]' : '',
        segment.tinted ? 'bg-muted/50 tabular-nums text-muted-foreground' : '',
        segment.uppercase ? 'uppercase tracking-wider text-foreground/90' : '',
        segment.className ?? '',
      ];
      return (
        <span key={index} className={classes.filter(Boolean).join(' ')}>
          {segment.content}
        </span>
      );
    })}
  </div>
);
