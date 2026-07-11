import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Flex } from '@omnitech/omni-ui-core/Flex';

describe('omni-ui-components/Flex', () => {
  it('renders child items', () => {
    render(<Flex><div>One</div><div>Two</div></Flex>);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
