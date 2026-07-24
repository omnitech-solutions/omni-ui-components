import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { TreeSelect } from '@oc-tech/omni-ui-components/TreeSelect';

describe('omni-ui-components/TreeSelect', () => {
  it('renders flattened options', async () => {
    render(<TreeSelect label="Department" value="accounts" onChange={() => undefined} treeData={[{ value: 'root', title: 'Root', children: [{ value: 'accounts', title: 'Accounts' }] }]} />);
    expect(screen.getByLabelText('Department')).toBeInTheDocument();
  });
});
