import '@testing-library/jest-dom';

import { AutoComplete } from '@oc-tech/omni-ui-components/AutoComplete';
import { render, screen } from '@testing-library/react';

describe('omni-ui-components/AutoComplete', () => {
  it('renders the input chrome for suggestions', () => {
    render(
      <AutoComplete
        label="User"
        value=""
        onChange={() => undefined}
        options={[{ value: 'alex' }, { value: 'jamie' }]}
      />,
    );
    expect(screen.getByLabelText('User')).toBeInTheDocument();
  });
});
