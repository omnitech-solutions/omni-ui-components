import '@testing-library/jest-dom';

import { Spin } from '@oc-tech/omni-ui-components/Spin';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Spin', () => {
  it('renders tip while spinning', () => {
    render(
      <Spin spinning tip="Loading">
        <div>Body</div>
      </Spin>,
    );
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
