import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Typography } from '@oc-tech/omni-ui-components/Typography';

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
