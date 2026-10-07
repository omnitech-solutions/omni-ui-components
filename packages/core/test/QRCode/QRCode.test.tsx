import '@testing-library/jest-dom';

import { QRCode } from '@oc-tech/omni-ui-components/QRCode';
import { render } from '@testing-library/react';

describe('omni-ui-components/QRCode', () => {
  it('renders qr grid', () => {
    const { container } = render(<QRCode value="https://example.com" />);
    expect(container.querySelectorAll('.grid > div').length).toBeGreaterThan(0);
  });
});
