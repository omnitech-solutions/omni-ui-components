import '@testing-library/jest-dom';

import { Skeleton } from '@oc-tech/omni-ui-components/Skeleton';
import { render } from '@testing-library/react';

describe('omni-ui-components/Skeleton', () => {
  it('renders skeleton block', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
