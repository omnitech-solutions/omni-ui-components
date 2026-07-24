import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Splitter, SplitterPanel } from '@oc-tech/omni-ui-components/Splitter';

describe('omni-ui-components/Splitter', () => {
  it('renders both panels', () => {
    render(<Splitter><SplitterPanel>Left</SplitterPanel><SplitterPanel>Right</SplitterPanel></Splitter>);
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
