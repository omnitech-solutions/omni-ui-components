import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { List, ListItem } from '@omnitech/omni-ui-core/List';

describe('omni-ui-components/List', () => {
  it('renders list items', () => {
    render(<List><ListItem>Alpha</ListItem><ListItem>Beta</ListItem></List>);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });
});
