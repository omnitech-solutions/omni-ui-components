import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Watermark } from '@omnitech/omni-ui-core/Watermark';

describe('omni-ui-components/Watermark', () => {
  it('renders watermark content and child content', () => {
    render(<Watermark content="CONFIDENTIAL"><div>Protected</div></Watermark>);
    expect(screen.getByText('CONFIDENTIAL')).toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
