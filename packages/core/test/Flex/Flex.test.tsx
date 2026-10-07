import '@testing-library/jest-dom';

import { Flex } from '@oc-tech/omni-ui-components/Flex';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Flex', () => {
  it('renders child items', () => {
    render(
      <Flex>
        <div>One</div>
        <div>Two</div>
      </Flex>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
