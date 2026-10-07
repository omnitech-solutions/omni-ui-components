import '@testing-library/jest-dom';

import { ApprovalCard, type ApprovalItem } from '@oc-tech/omni-ui-components/ApprovalCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { approvalCardPropsFactory } from 'factories/omni-ui-components/ApprovalCard/ApprovalCard.factories';
import { expectTypeOf } from 'vitest';

describe('omni-ui-components/ApprovalCard', () => {
  it('pending: labelled section with title, description, tags (first monospace) and three buttons', () => {
    render(<ApprovalCard {...approvalCardPropsFactory()} />);
    const card = screen.getByRole('region', { name: 'Approval needed' });
    expect(card).toHaveTextContent('Run the solution against your tests?');
    expect(card).toHaveTextContent('The assistant wants to run code in the sandbox.');
    expect(screen.getByText('runCode')).toHaveClass('font-mono');
    expect(screen.getByText('sandboxed')).not.toHaveClass('font-mono');
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      'Deny',
      'Always allow in this chat',
      'Allow once',
    ]);
  });

  it.each([
    ['Deny', 'deny'],
    ['Always allow in this chat', 'always'],
    ['Allow once', 'once'],
  ])('%s calls onDecide(%s)', async (name, decision) => {
    const onDecide = vi.fn();
    render(<ApprovalCard {...approvalCardPropsFactory({ onDecide })} />);
    await userEvent.click(screen.getByRole('button', { name }));
    expect(onDecide).toHaveBeenCalledWith(
      decision,
      expect.objectContaining({ title: 'Run the solution against your tests?' }),
    );
  });

  it('busy disables the buttons', () => {
    render(<ApprovalCard {...approvalCardPropsFactory({ busy: true })} />);
    screen.getAllByRole('button').forEach((button) => expect(button).toBeDisabled());
  });

  it.each([
    ['once', 'Allowed once'],
    ['always', 'Always allowed for runCode in this conversation'],
    ['denied', 'Denied · nothing was run'],
  ] as const)('%s shows one resolved line and no buttons', (status, text) => {
    render(<ApprovalCard {...approvalCardPropsFactory({ status })} />);
    expect(screen.getByRole('status')).toHaveTextContent(text);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('a pending card without onDecide draws no buttons', () => {
    render(<ApprovalCard {...approvalCardPropsFactory({ onDecide: undefined })} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('onDecide receives the extended approval item by reference, with its extra fields typed', async () => {
    type RunApproval = ApprovalItem & { callId: string; risk: 'low' | 'high' };
    const approval: RunApproval = {
      id: 'a1',
      title: 'Run it?',
      tool: 'runCode',
      tags: ['runCode'],
      callId: 'call-7',
      risk: 'high',
    };
    const onDecide = vi.fn((_decision: 'once' | 'always' | 'deny', given: RunApproval) => {
      expectTypeOf(given.callId).toEqualTypeOf<string>();
      expectTypeOf(given.risk).toEqualTypeOf<'low' | 'high'>();
    });
    render(<ApprovalCard<RunApproval> approval={approval} onDecide={onDecide} />);
    await userEvent.click(screen.getByRole('button', { name: 'Allow once' }));
    expect(onDecide.mock.calls[0]![1]).toBe(approval);
    expect(screen.getByText('Run it?')).toBeInTheDocument();
  });
});
