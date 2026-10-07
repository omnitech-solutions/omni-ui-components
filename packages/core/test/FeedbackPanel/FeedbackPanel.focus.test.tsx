import '@testing-library/jest-dom';

import { FeedbackPanel } from '@oc-tech/omni-ui-components/FeedbackPanel';
import { render, screen } from '@testing-library/react';

const reasons = [
  { id: 'a', label: 'Incorrect' },
  { id: 'b', label: 'Too long' },
];

describe('omni-ui-components/FeedbackPanel focus', () => {
  it('does not move focus by default', () => {
    render(<FeedbackPanel reasons={reasons} />);
    expect(document.body).toHaveFocus();
  });

  it('autoFocus focuses the first reason chip on mount', () => {
    render(<FeedbackPanel reasons={reasons} autoFocus />);
    expect(screen.getByRole('button', { name: 'Incorrect' })).toHaveFocus();
  });

  it('does not steal focus again on re-render', () => {
    const { rerender } = render(<FeedbackPanel reasons={reasons} autoFocus />);
    screen.getByRole('button', { name: 'Too long' }).focus();
    rerender(<FeedbackPanel reasons={reasons} autoFocus />);
    expect(screen.getByRole('button', { name: 'Too long' })).toHaveFocus();
  });
});
