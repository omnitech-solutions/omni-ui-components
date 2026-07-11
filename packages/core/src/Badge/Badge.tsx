import * as React from 'react';

import { Badge as BadgePrimitive } from '../components/ui/badge';
import type { BadgeProps } from './Badge.types';

const BadgeInner = ({ children, ...props }: BadgeProps) => <BadgePrimitive {...props}>{children}</BadgePrimitive>;

export const Badge = React.memo(BadgeInner);
Badge.displayName = 'Badge';
