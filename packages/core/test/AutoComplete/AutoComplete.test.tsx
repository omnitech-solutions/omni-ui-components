import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { AutoComplete } from '@omnitech/omni-ui-core/AutoComplete';

describe('omni-ui-components/AutoComplete', () => {
  it('renders the input chrome for suggestions', () => {
    render(<AutoComplete label="User" value="" onChange={() => undefined} options={[{ value: 'alex' }, { value: 'jamie' }]} />);
    expect(screen.getByLabelText('User')).toBeInTheDocument();
  });
});
