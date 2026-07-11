import * as React from 'react';

import { Tooltip as TooltipPrimitive, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import type { TooltipContentProps, TooltipProps, TooltipProviderProps, TooltipTriggerProps } from './Tooltip.types';

export const Tooltip = TooltipPrimitive as React.FC<TooltipProps>;
export const TooltipRootProvider = TooltipProvider as React.FC<TooltipProviderProps>;
export const TooltipTriggerRoot = TooltipTrigger as React.FC<TooltipTriggerProps>;

const TooltipContentInner = React.forwardRef<HTMLDivElement, TooltipContentProps>((props, ref) => <TooltipContent ref={ref} {...props} />);
TooltipContentInner.displayName = 'TooltipContent';

export const TooltipPopup = React.memo(TooltipContentInner) as typeof TooltipContentInner;
