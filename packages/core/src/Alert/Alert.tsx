import * as React from 'react';

import { Alert as AlertPrimitive } from '../components/ui/alert';
import type { AlertProps } from './Alert.types';

const AlertInner = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => <AlertPrimitive ref={ref} {...props} />);
AlertInner.displayName = 'Alert';

export const Alert = React.memo(AlertInner) as typeof AlertInner;
