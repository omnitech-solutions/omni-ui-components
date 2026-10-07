import '@testing-library/jest-dom';

import { ApprovalCard } from '@oc-tech/omni-ui-components/ApprovalCard';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/ApprovalCard focus', () => {
  it('does not move focus by default', () => {
    render(<ApprovalCard title="Run?" onDecide={() => {}} />);
    expect(document.body).toHaveFocus();
  });

  it('autoFocus lands on Deny, never on an Allow button', () => {
    render(<ApprovalCard title="Run?" onDecide={() => {}} autoFocus />);
    expect(screen.getByRole('button', { name: 'Deny' })).toHaveFocus();
  });

  it('autoFocus does nothing once resolved', () => {
    render(<ApprovalCard title="Run?" status="once" onDecide={() => {}} autoFocus />);
    expect(document.body).toHaveFocus();
  });
});
