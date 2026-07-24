import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Statistic } from '@oc-tech/omni-ui-components/Statistic';

describe('omni-ui-components/Statistic', () => {
  it('renders title and value', () => {
    render(<Statistic title="ARR" value="$1M" />);
    expect(screen.getByText('ARR')).toBeInTheDocument();
    expect(screen.getByText('$1M')).toBeInTheDocument();
  });
});
