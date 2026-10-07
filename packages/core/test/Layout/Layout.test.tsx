import '@testing-library/jest-dom';

import { Content, Header, Layout } from '@oc-tech/omni-ui-components/Layout';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Layout', () => {
  it('renders sections', () => {
    render(
      <Layout>
        <Header>Header</Header>
        <Content>Body</Content>
      </Layout>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });
});
