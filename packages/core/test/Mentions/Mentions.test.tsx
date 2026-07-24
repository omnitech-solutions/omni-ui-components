import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Mentions } from '@oc-tech/omni-ui-components/Mentions';

describe('omni-ui-components/Mentions', () => {
  it('calls onChange when edited', async () => {
    const user = userEvent.setup();
    const handle = jest.fn();
    render(<Mentions label="Comment" value="" onChange={handle} />);
    await user.type(screen.getByLabelText('Comment'), 'hello');
    expect(handle).toHaveBeenCalled();
  });
});
