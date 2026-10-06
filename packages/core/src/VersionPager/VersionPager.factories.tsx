import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { VersionPager, type VersionPagerProps } from '@oc-tech/omni-ui-components/VersionPager';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<VersionPager>` props for stories and tests. */
export const versionPagerPropsFactory = (overrides: Partial<VersionPagerProps> = {}): VersionPagerProps => ({
  index: 1,
  count: 3,
  onMove: () => undefined,
  previousIcon: <ChevronLeft />,
  nextIcon: <ChevronRight />,
  ...overrides,
});

/** A pager that moves its own index, reporting each move. */
export const VersionPagerDemo: React.FC<
  Partial<VersionPagerProps> & {
    onAction?: (name: string, detail?: unknown) => void;
  }
> = ({ onAction, ...props }) => {
  const [index, setIndex] = React.useState(props.index ?? 1);
  const count = props.count ?? 3;
  return (
    <VersionPager
      {...versionPagerPropsFactory(props)}
      index={index}
      onMove={(step) => {
        onAction?.('move', step);
        setIndex((current) => Math.min(count - 1, Math.max(0, current + step)));
      }}
    />
  );
};

export const versionPagerVariants: Variant<VersionPagerProps>[] = [
  { name: 'Middle', args: {} },
  { name: 'First', args: { index: 0 } },
  { name: 'Last', args: { index: 2 } },
  { name: 'Disabled while busy', args: { disabled: true } },
];
