import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { ApiName, TableStoryGroupOverview } from '../../src/Table/TableStoryGroupOverview';

describe('TableStoryGroupOverview', () => {
  it('renders the title, summary, one section per entry and a contents link for each', () => {
    render(
      <TableStoryGroupOverview
        title="Sorting"
        summary="How sorting works"
        sections={[
          { id: 'one', title: 'First', body: 'first body' },
          { id: 'two', title: 'Second', body: 'second body' },
        ]}
      />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Sorting');
    expect(screen.getByText('How sorting works')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'First', level: 3 }).closest('section'),
    ).toHaveAttribute('id', 'one');
    expect(screen.getByText('second body')).toBeInTheDocument();
    expect(screen.getAllByText('First').length).toBeGreaterThan(1);
  });

  it('ApiName shows its code as inline code', () => {
    render(<ApiName code="rowSelection" />);
    expect(screen.getByText('rowSelection')).toBeInTheDocument();
  });
});
