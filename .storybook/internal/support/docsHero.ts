import * as React from 'react';

export interface DocsHeroSegmentOverride {
  className?: string;
  style?: React.CSSProperties;
}

export interface DocsHeroPreset {
  heroPillClassName: string;
  heroNameSegment: DocsHeroSegmentOverride;
  heroSignatureSegment: DocsHeroSegmentOverride;
}

export const affixDocsHeroPreset: DocsHeroPreset = {
  heroPillClassName: 'border-[var(--color-primary)] [&>span+span]:border-l-[var(--color-primary)]',
  heroNameSegment: {
    className: 'text-white',
    style: { background: 'color-mix(in srgb, var(--color-primary) 72%, var(--color-background) 28%)' },
  },
  heroSignatureSegment: {
    className: '',
    style: { background: 'color-mix(in srgb, var(--color-primary) 22%, var(--color-background) 78%)' },
  },
};

export function resolveDocsHeroPreset(overrides?: {
  heroPillClassName?: string;
  heroNameSegment?: DocsHeroSegmentOverride;
  heroSignatureSegment?: DocsHeroSegmentOverride;
}): DocsHeroPreset {
  return {
    heroPillClassName: [affixDocsHeroPreset.heroPillClassName, overrides?.heroPillClassName ?? ''].filter(Boolean).join(' '),
    heroNameSegment: {
      className: [affixDocsHeroPreset.heroNameSegment.className ?? '', overrides?.heroNameSegment?.className ?? ''].filter(Boolean).join(' '),
      style: {
        ...(affixDocsHeroPreset.heroNameSegment.style ?? {}),
        ...(overrides?.heroNameSegment?.style ?? {}),
      },
    },
    heroSignatureSegment: {
      className: [affixDocsHeroPreset.heroSignatureSegment.className ?? '', overrides?.heroSignatureSegment?.className ?? ''].filter(Boolean).join(' '),
      style: {
        ...(affixDocsHeroPreset.heroSignatureSegment.style ?? {}),
        ...(overrides?.heroSignatureSegment?.style ?? {}),
      },
    },
  };
}
