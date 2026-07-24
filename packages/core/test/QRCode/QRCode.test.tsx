import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { QRCode } from '@oc-tech/omni-ui-components/QRCode';

describe('omni-ui-components/QRCode', () => {
  it('renders qr grid', () => {
    const { container } = render(<QRCode value="https://example.com" />);
    expect(container.querySelectorAll('.grid > div').length).toBeGreaterThan(0);
  });
});
