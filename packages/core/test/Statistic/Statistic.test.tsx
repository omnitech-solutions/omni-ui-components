import '@testing-library/jest-dom';

import { Statistic } from '@oc-tech/omni-ui-components/Statistic';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Statistic', () => {
  it('renders title and value', () => {
    render(<Statistic title="ARR" value="$1M" />);
    expect(screen.getByText('ARR')).toBeInTheDocument();
    expect(screen.getByText('$1M')).toBeInTheDocument();
  });
});
