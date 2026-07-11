import * as React from 'react';

export interface PillSegment {
  content: React.ReactNode;
  tinted?: boolean;
  uppercase?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface SegmentedPillProps {
  segments: PillSegment[];
  className?: string;
}

export const SegmentedPill: React.FC<SegmentedPillProps> = ({ segments, className }) => (
  <div
    className={
      className ??
      'inline-flex items-stretch overflow-hidden rounded-xl border border-[color:color-mix(in_srgb,var(--oui-border-field)_88%,white_12%)] bg-[color:color-mix(in_srgb,var(--color-background)_92%,white_8%)] text-xs font-mono shadow-[0_10px_30px_rgba(0,0,0,0.16)]'
    }
  >
    {segments.map((segment, index) => {
      const classes = [
        'flex items-center justify-center px-2.5 py-1',
        index > 0 ? 'border-l border-[color:color-mix(in_srgb,var(--oui-border-field)_84%,white_16%)]' : '',
        segment.tinted ? 'bg-[color:color-mix(in_srgb,var(--color-border)_70%,transparent)] tabular-nums text-muted-foreground' : '',
        segment.uppercase ? 'uppercase tracking-wider text-foreground/90' : '',
        segment.className ?? '',
      ];
      return (
        <span key={index} className={classes.filter(Boolean).join(' ')} style={segment.style}>
          {segment.content}
        </span>
      );
    })}
  </div>
);
