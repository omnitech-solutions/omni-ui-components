import '@testing-library/jest-dom';
import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import { QueuedList, type QueuedItem } from '@oc-tech/omni-ui-components/QueuedList';
import { queuedListPropsFactory } from 'factories/omni-ui-components/QueuedList/QueuedList.factories';

describe('omni-ui-components/QueuedList', () => {
  it('lists the queued messages with the Queued label and removes by id', async () => {
    const onRemove = vi.fn();
    const items = queuedListPropsFactory().items;
    render(<QueuedList {...queuedListPropsFactory({ items, onRemove })} />);
    expect(screen.getByRole('list', { name: 'Queued messages' })).toBeInTheDocument();
    expect(screen.getAllByText('Queued')).toHaveLength(2);
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove from queue' })[1]);
    expect(onRemove.mock.calls[0][0]).toBe(items[1]);
  });
  it('is generic: extra fields reach onRemove by reference', async () => {
    interface Mine extends QueuedItem {
      sentAt: number;
    }
    const mine: Mine[] = [{ id: 'a', text: 'A', sentAt: 5 }];
    const seen: number[] = [];
    const onRemove = vi.fn((item: Mine): void => void seen.push(item.sentAt));
    render(<QueuedList items={mine} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button', { name: 'Remove from queue' }));
    expect(onRemove.mock.calls[0][0]).toBe(mine[0]);
    expect(seen).toEqual([5]);
  });
  it('renders nothing when empty, has no remove without onRemove, and takes labels', () => {
    const { rerender } = render(<QueuedList items={[]} />);
    expect(document.querySelector('[data-slot="queued-list"]')).toBeNull();
    rerender(<QueuedList items={[{ id: 'a', text: 'x' }]} labels={{ queued: 'En attente' }} />);
    expect(screen.getByText('En attente')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
