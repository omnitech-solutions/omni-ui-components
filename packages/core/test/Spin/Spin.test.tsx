import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Spin } from '@omnitech/omni-ui-core/Spin';

describe('omni-ui-components/Spin', () => {
  it('renders tip while spinning', () => {
    render(<Spin spinning tip="Loading"><div>Body</div></Spin>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
  });
});
