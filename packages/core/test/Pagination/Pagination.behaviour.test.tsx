import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { Pagination } from '@oc-tech/omni-ui-components/Pagination';

const pageLabels = () => within(screen.getByRole('navigation', { name: 'Pagination' })).getAllByRole('button').map((b) => b.textContent || b.getAttribute('aria-label'));

describe('omni-ui-components/Pagination behaviour', () => {
  it('lists every page when there are 7 or fewer', () => {
    render(<Pagination current={1} total={70} pageSize={10} />);
    expect(pageLabels()).toEqual(['Previous page', '1', '2', '3', '4', '5', '6', '7', 'Next page']);
  });

  it('collapses the tail into an ellipsis near the start', () => {
    render(<Pagination current={2} total={200} pageSize={10} testIdPrefix="p" />);
    expect(pageLabels()).toEqual(['Previous page', '1', '2', '3', '20', 'Next page']);
    expect(screen.getByTestId('p-pagination-ellipsis-3')).toBeInTheDocument();
  });

  it('collapses both sides in the middle and only the head near the end', () => {
    const { rerender } = render(<Pagination current={10} total={200} pageSize={10} testIdPrefix="p" />);
    expect(pageLabels()).toEqual(['Previous page', '1', '9', '10', '11', '20', 'Next page']);
    expect(screen.getByTestId('p-pagination-ellipsis-1')).toBeInTheDocument();
    expect(screen.getByTestId('p-pagination-ellipsis-5')).toBeInTheDocument();

    rerender(<Pagination current={20} total={200} pageSize={10} testIdPrefix="p" />);
    expect(pageLabels()).toEqual(['Previous page', '1', '19', '20', 'Next page']);
  });

  it('marks the current page and clamps an out-of-range current', () => {
    const { rerender } = render(<Pagination current={3} total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute('aria-current');

    rerender(<Pagination current={99} total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute('aria-current', 'page');
    rerender(<Pagination current={-4} total={50} pageSize={10} />);
    expect(screen.getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page');
  });

  it('shows a single page for zero items', () => {
    render(<Pagination total={0} />);
    expect(pageLabels()).toEqual(['Previous page', '1', 'Next page']);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('disables previous on the first page and next on the last', () => {
    const { rerender } = render(<Pagination current={1} total={30} pageSize={10} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    rerender(<Pagination current={3} total={30} pageSize={10} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('emits previous, numbered and next pages with the page size', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination current={2} total={50} pageSize={25 / 5 + 5} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onChange).toHaveBeenLastCalledWith(1, 10);
    await user.click(screen.getByRole('button', { name: '4' }));
    expect(onChange).toHaveBeenLastCalledWith(4, 10);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenLastCalledWith(3, 10);
  });

  it('hides previous/next when showPrevNext is false', () => {
    render(<Pagination total={30} showPrevNext={false} />);
    expect(screen.queryByRole('button', { name: 'Previous page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
  });

  it('disabled disables every control and never calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Pagination current={2} total={50} disabled onChange={onChange} showSizeChanger />);
    for (const button of within(screen.getByRole('navigation')).getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
    await user.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the size changer only when asked and reports the change from page 1', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onShowSizeChange = vi.fn();
    const { rerender } = render(<Pagination current={3} total={500} pageSize={10} onChange={onChange} />);
    expect(screen.queryByText('Rows')).not.toBeInTheDocument();

    rerender(<Pagination current={3} total={500} pageSize={10} onChange={onChange} onShowSizeChange={onShowSizeChange} showSizeChanger pageSizeOptions={[10, 25]} />);
    expect(screen.getByText('Rows')).toBeInTheDocument();
    await user.click(screen.getByRole('combobox', { name: 'Rows per page' }));
    await user.click(await screen.findByRole('option', { name: '25' }));
    expect(onShowSizeChange).toHaveBeenCalledWith(1, 25);
    expect(onChange).toHaveBeenCalledWith(1, 25);
  });

  it('exposes test ids under the prefix and passes extra props to the nav', () => {
    render(<Pagination total={30} testIdPrefix="t" showSizeChanger className="custom" data-extra="yes" />);
    for (const suffix of ['root', 'pages', 'prev', 'next', 'size', 'size-changer', 'item-1']) {
      expect(screen.getByTestId(`t-pagination-${suffix}`)).toBeInTheDocument();
    }
    expect(screen.getByRole('navigation')).toHaveClass('custom');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-extra', 'yes');
  });
});
