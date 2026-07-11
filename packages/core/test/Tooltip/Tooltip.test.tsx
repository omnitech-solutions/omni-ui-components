import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '@omnitech/omni-ui-core/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@omnitech/omni-ui-core/Tooltip';

describe('omni-ui-components/Tooltip', () => {
  it('shows tooltip content on hover without a long delay', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button>Hover me</Button>
          </TooltipTrigger>
          <TooltipContent>Additional context</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.hover(screen.getByRole('button', { name: 'Hover me' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Additional context');
  });
});
