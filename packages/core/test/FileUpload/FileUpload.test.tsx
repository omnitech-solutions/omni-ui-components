import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { FileUpload } from '@omnitech/omni-ui-core/FileUpload';

describe('omni-ui-components/FileUpload', () => {
  it('renders the dropzone + label', () => {
    render(<FileUpload data-testid="f" label="Attachments" onChange={() => undefined} />);
    expect(screen.getByText('Attachments')).toBeInTheDocument();
    expect(document.querySelector('[data-slot="file-upload"]')).toBeInTheDocument();
  });

  it('shows a file row when value has entries', () => {
    const file = new File(['hi'], 'hello.txt', { type: 'text/plain' });
    render(<FileUpload data-testid="f" label="Attachments" value={[file]} onChange={() => undefined} />);
    expect(screen.getByText('hello.txt')).toBeInTheDocument();
  });

  it('flags aria-invalid on error', () => {
    render(<FileUpload data-testid="f" label="t" error="too big" onChange={() => undefined} />);
    expect(document.querySelector('input[type="file"]')).toHaveAttribute('aria-invalid', 'true');
  });
});
