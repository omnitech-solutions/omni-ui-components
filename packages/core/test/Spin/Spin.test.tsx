import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Spin } from '@oc-tech/omni-ui-components/Spin';

describe('omni-ui-components/Spin', () => {
  it('renders tip while spinning', () => {
    render(<Spin spinning tip="Loading"><div>Body</div></Spin>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
