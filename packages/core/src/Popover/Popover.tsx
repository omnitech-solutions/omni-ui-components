import * as React from 'react';

import {
  PopoverAnchor,
  PopoverContent,
  Popover as PopoverPrimitive,
  PopoverTrigger,
} from '../components/ui/popover';
import type {
  PopoverAnchorProps,
  PopoverContentProps,
  PopoverProps,
  PopoverTriggerProps,
} from './Popover.types';

export const Popover = PopoverPrimitive as React.FC<PopoverProps>;
export const PopoverTriggerRoot = PopoverTrigger as React.FC<PopoverTriggerProps>;
export const PopoverAnchorRoot = PopoverAnchor as React.FC<PopoverAnchorProps>;

const PopoverContentInner = React.forwardRef<HTMLDivElement, PopoverContentProps>((props, ref) => (
  <PopoverContent ref={ref} {...props} />
));
PopoverContentInner.displayName = 'PopoverContent';

export const PopoverPanel = React.memo(PopoverContentInner) as typeof PopoverContentInner;
