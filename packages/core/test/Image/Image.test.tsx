import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Image } from '@omnitech/omni-ui-core/Image';

describe('omni-ui-components/Image', () => {
  it('renders image element', () => {
    render(<Image src="/x.png" alt="Preview" />);
    expect(screen.getByRole('img', { name: 'Preview' })).toHaveAttribute('src', '/x.png');
  });
});
