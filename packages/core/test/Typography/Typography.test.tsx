import '@testing-library/jest-dom';

import { Typography } from '@oc-tech/omni-ui-components/Typography';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Typography', () => {
  it('renders title, paragraph, and link', () => {
    render(
      <div>
        <Typography.Title>Title</Typography.Title>
        <Typography.Paragraph>Body</Typography.Paragraph>
        <Typography.Link href="/x">Link</Typography.Link>
      </div>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/x');
  });
});

describe('omni-ui-components/Typography tones', () => {
  it('paints warning and success from the theme tone tokens, so they follow light and dark', () => {
    render(
      <div>
        <Typography.Text type="warning">Late</Typography.Text>
        <Typography.Text type="success">Done</Typography.Text>
      </div>,
    );
    expect(screen.getByText('Late').className).toContain('--oui-tone-warning-fg');
    expect(screen.getByText('Done').className).toContain('--oui-tone-success-fg');
  });

  it('passes role and data attributes through', () => {
    render(
      <Typography.Text role="status" data-testid="line">
        Saved
      </Typography.Text>,
    );
    expect(screen.getByRole('status')).toBe(screen.getByTestId('line'));
  });
});
