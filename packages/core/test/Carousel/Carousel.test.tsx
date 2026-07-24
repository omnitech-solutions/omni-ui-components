import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Carousel } from '@oc-tech/omni-ui-components/Carousel';

describe('omni-ui-components/Carousel', () => {
  it('moves between slides', async () => {
    const user = userEvent.setup();
    render(<Carousel><div>One</div><div>Two</div></Carousel>);
    expect(screen.getByText('One')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button')[1]);
    expect(screen.getByText('Two')).toBeInTheDocument();
  });
});
