import * as React from 'react';
import type { DayPickerProps } from 'react-day-picker';

import { Calendar as CalendarPrimitive } from '../components/ui/calendar';

export type CalendarProps = DayPickerProps;

export const Calendar = React.memo(React.forwardRef<HTMLDivElement, CalendarProps>((props, _ref) => <CalendarPrimitive {...props} />));
Calendar.displayName = 'Calendar';
