import * as React from 'react';

import { Textarea } from '../Textarea';

export interface MentionsOption {
  value: string;
  label?: React.ReactNode;
}

export interface MentionsProps extends Omit<React.ComponentProps<typeof Textarea>, 'onChange' | 'value'> {
  value?: string;
  onChange?: (next: string) => void;
  options?: MentionsOption[];
}

export const Mentions = ({ value, onChange, ...props }: MentionsProps) => <Textarea {...props} value={value} onChange={onChange} />;
