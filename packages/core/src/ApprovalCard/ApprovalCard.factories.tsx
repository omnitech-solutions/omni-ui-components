import * as React from 'react';
import { Ban, CircleCheck, Shield, ShieldCheck } from 'lucide-react';

import type { ApprovalCardProps } from '@oc-tech/omni-ui-components/ApprovalCard';
import type { Variant } from '../../internal/support/makeFactory';

/** Build `<ApprovalCard>` props for stories and tests. */
export const approvalCardPropsFactory = (overrides: Partial<ApprovalCardProps> = {}): ApprovalCardProps => ({
  title: 'Run the solution against your tests?',
  description: 'The assistant wants to run code in the sandbox.',
  tool: 'runCode',
  onDecide: () => undefined,
  tags: ['runCode', 'sandboxed', 'no network'],
  icons: {
    badge: <Shield />,
    once: <CircleCheck />,
    always: <ShieldCheck />,
    denied: <Ban />,
  },
  ...overrides,
});

export const approvalCardVariants: Variant<ApprovalCardProps>[] = [
  { name: 'Pending', args: {} },
  { name: 'Busy', args: { busy: true } },
  { name: 'Allowed once', args: { status: 'once' } },
  { name: 'Always allowed', args: { status: 'always' } },
  { name: 'Denied', args: { status: 'denied' } },
];
