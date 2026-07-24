import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Watermark } from '@oc-tech/omni-ui-components/Watermark';

describe('omni-ui-components/Watermark', () => {
  it('renders watermark content and child content', () => {
    render(<Watermark content="CONFIDENTIAL"><div>Protected</div></Watermark>);
    expect(screen.getByText('CONFIDENTIAL')).toBeInTheDocument();
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });
});
