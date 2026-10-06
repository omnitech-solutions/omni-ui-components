import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataPrivacyPanel } from '@oc-tech/omni-ui-components/DataPrivacyPanel';
import {
  DataPrivacyPanelDemo,
  dataPrivacyPanelPropsFactory,
  dataPrivacyPanelVariants,
  sampleActivity,
} from 'factories/omni-ui-components/DataPrivacyPanel/DataPrivacyPanel.factories';

describe('omni-ui-components/DataPrivacyPanel', () => {
  it('retention is a Segmented of Forever / 90 days / 30 days that reports the value', async () => {
    const onRetentionChange = jest.fn();
    render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ onRetentionChange })} />);
    const group = screen.getByRole('group', { name: 'Keep conversations' });
    expect(within(group).getAllByRole('radio').map((r) => r.textContent)).toEqual(['Forever', '90 days', '30 days']);
    expect(within(group).getByRole('radio', { name: 'Forever' })).toBeChecked();
    await userEvent.click(within(group).getByRole('radio', { name: '30 days' }));
    expect(onRetentionChange).toHaveBeenCalledWith('30d');
  });

  it('the log button toggles aria-expanded and asks the caller to open or close', async () => {
    const onShowActivityChange = jest.fn();
    const { rerender } = render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ onShowActivityChange })} />);
    const button = screen.getByRole('button', { name: 'View log' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(onShowActivityChange).toHaveBeenCalledWith(true);
    rerender(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ onShowActivityChange, activityOpen: true, activity: sampleActivity() })} />);
    expect(screen.getByRole('button', { name: 'Hide log' })).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Hide log' }));
    expect(onShowActivityChange).toHaveBeenLastCalledWith(false);
  });

  it('lists the activity with summary, context and a formatted date, capped at 220px', () => {
    render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ activityOpen: true, activity: sampleActivity(3) })} />);
    const list = screen.getByRole('list', { name: 'Activity log' });
    expect(list).toHaveClass('max-h-[220px]', 'overflow-auto');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent('Searched evidence');
    expect(items[0]).toHaveTextContent('Two Sum with a hash map');
    expect(items[0]).toHaveTextContent('2026-10-06 12:00');
  });

  it('shows Nothing yet. for an empty log and Loading… while loading', () => {
    const { rerender } = render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ activityOpen: true, activity: [] })} />);
    expect(screen.getByText('Nothing yet.')).toBeInTheDocument();
    rerender(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ activityOpen: true, activityLoading: true })} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Activity log' })).not.toBeInTheDocument();
  });

  it('Export calls onExport', async () => {
    const onExport = jest.fn();
    render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ onExport })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('Delete everything asks through a Popconfirm; only Yes deletes, Cancel does not', async () => {
    const onDeleteAll = jest.fn();
    render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ onDeleteAll })} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete all' }));
    expect(onDeleteAll).not.toHaveBeenCalled();
    expect(await screen.findByText('Delete everything?')).toBeInTheDocument();
    expect(screen.getByText('This can’t be undone.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onDeleteAll).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Delete all' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Yes, delete all' }));
    expect(onDeleteAll).toHaveBeenCalledTimes(1);
  });

  it('a section appears only when its callback is given', () => {
    render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory(dataPrivacyPanelVariants[5].args)} />);
    expect(screen.getByRole('group', { name: 'Keep conversations' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View log' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete all' })).not.toBeInTheDocument();
  });

  it('translates labels', () => {
    render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory({ labels: { viewLog: 'Ver registro', exportButton: 'Exportar' } })} />);
    expect(screen.getByRole('button', { name: 'Ver registro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Exportar' })).toBeInTheDocument();
  });

  it('the demo loads the log on View and removes it on Hide', async () => {
    render(<DataPrivacyPanelDemo />);
    await userEvent.click(screen.getByRole('button', { name: 'View log' }));
    expect(screen.getByRole('list', { name: 'Activity log' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Hide log' }));
    expect(screen.queryByRole('list', { name: 'Activity log' })).not.toBeInTheDocument();
  });

  it('renders every factory variant', () => {
    dataPrivacyPanelVariants.forEach((variant) => {
      const { container, unmount } = render(<DataPrivacyPanel {...dataPrivacyPanelPropsFactory(variant.args)} />);
      expect(container.querySelector('[data-slot="data-privacy"]')).toBeInTheDocument();
      unmount();
    });
  });
});
