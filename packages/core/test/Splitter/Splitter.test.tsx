import '@testing-library/jest-dom';

import { Splitter, SplitterPanel } from '@oc-tech/omni-ui-components/Splitter';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/Splitter', () => {
  it('renders both panels', () => {
    render(
      <Splitter>
        <SplitterPanel>Left</SplitterPanel>
        <SplitterPanel>Right</SplitterPanel>
      </Splitter>,
    );
    expect(screen.getByText('Left')).toBeInTheDocument();
    expect(screen.getByText('Right')).toBeInTheDocument();
  });
});
