import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { Skeleton } from '@omnitech/omni-ui-core/Skeleton';

describe('omni-ui-components/Skeleton', () => {
  it('renders skeleton block', () => {
    const { container } = render(<Skeleton className="h-4 w-10" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
