import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tree } from '@oc-tech/omni-ui-components/Tree';

describe('omni-ui-components/Tree', () => {
  it('toggles child nodes', async () => {
    const user = userEvent.setup();
    render(<Tree treeData={[{ key: '1', title: 'Root', children: [{ key: '1-1', title: 'Child' }] }]} />);
    expect(screen.getByText('Child')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Root/ }));
    expect(screen.queryByText('Child')).not.toBeInTheDocument();
  });

  it('renders with tree semantics', () => {
    render(<Tree treeData={[{ key: '1', title: 'Root' }]} />);
    expect(screen.getByRole('tree')).toBeInTheDocument();
    expect(screen.getByRole('treeitem')).toBeInTheDocument();
  });
});
