import '@testing-library/jest-dom';

import { SummaryDivider } from '@oc-tech/omni-ui-components/SummaryDivider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { summaryDividerPropsFactory } from 'factories/omni-ui-components/SummaryDivider/SummaryDivider.factories';

describe('omni-ui-components/SummaryDivider', () => {
  it('shows "N earlier messages summarised" as a collapsed disclosure', () => {
    render(<SummaryDivider {...summaryDividerPropsFactory()} />);
    const toggle = screen.getByRole('button', {
      name: '12 earlier messages summarised',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/hash map/)).toBeNull();
  });

  it('uses the singular for one message', () => {
    render(<SummaryDivider {...summaryDividerPropsFactory({ count: 1 })} />);
    expect(
      screen.getByRole('button', { name: '1 earlier message summarised' }),
    ).toBeInTheDocument();
  });

  it('opens to the summary text and the stored-history note, and closes again', async () => {
    const onOpenChange = vi.fn();
    render(<SummaryDivider {...summaryDividerPropsFactory({ onOpenChange })} />);
    const toggle = screen.getByRole('button');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(document.querySelector('[data-slot="summary-divider-body"]')).toHaveTextContent(
      'hash map, and agreed to add tests. The full history is still stored — only the model sees this summary.',
    );
    await userEvent.click(toggle);
    expect(document.querySelector('[data-slot="summary-divider-body"]')).toBeNull();
    expect(onOpenChange.mock.calls.map((call) => call[0])).toEqual([true, false]);
  });

  it('labels are config and open is controllable', () => {
    render(
      <SummaryDivider
        {...summaryDividerPropsFactory({
          open: true,
          labels: {
            summarised: (n) => `${n} zusammengefasst`,
            note: 'Hinweis.',
          },
        })}
      />,
    );
    expect(screen.getByRole('button', { name: '12 zusammengefasst' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(document.querySelector('[data-slot="summary-divider-body"]')).toHaveTextContent(
      'Hinweis.',
    );
  });

  it('onOpenChange fires in controlled mode with the requested state', async () => {
    const onOpenChange = vi.fn();
    render(<SummaryDivider {...summaryDividerPropsFactory({ open: false, onOpenChange })} />);
    await userEvent.click(screen.getByRole('button', { name: '12 earlier messages summarised' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: '12 earlier messages summarised' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
