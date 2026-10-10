import '@testing-library/jest-dom';

import { Carousel } from '@oc-tech/omni-ui-components/Carousel';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('omni-ui-components/Carousel', () => {
  it('moves between slides', async () => {
    const user = userEvent.setup();
    render(
      <Carousel>
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );
    expect(screen.getByText('One')).toBeInTheDocument();
    await user.click(screen.getAllByRole('button')[1]);
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('names its two buttons, and takes other names', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Carousel>
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByText('Two')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByText('One')).toBeInTheDocument();
    rerender(
      <Carousel labels={{ previous: 'Zurück', next: 'Weiter' }}>
        <div>One</div>
        <div>Two</div>
      </Carousel>,
    );
    expect(screen.getByRole('button', { name: 'Weiter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
  });
});
