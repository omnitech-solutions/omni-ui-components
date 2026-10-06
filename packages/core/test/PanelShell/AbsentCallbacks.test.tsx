import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { ConversationHeader } from '@oc-tech/omni-ui-components/ConversationHeader';
import { ConversationList } from '@oc-tech/omni-ui-components/ConversationList';
import { DataPrivacyPanel } from '@oc-tech/omni-ui-components/DataPrivacyPanel';
import { EmptyStarters } from '@oc-tech/omni-ui-components/EmptyStarters';
import { IntegrationList } from '@oc-tech/omni-ui-components/IntegrationList';
import { PreferencesForm } from '@oc-tech/omni-ui-components/PreferencesForm';
import { SettingsDialog } from '@oc-tech/omni-ui-components/SettingsDialog';
import { Toast } from '@oc-tech/omni-ui-components/Toast';
import { conversationHeaderPropsFactory } from 'factories/omni-ui-components/ConversationHeader/ConversationHeader.factories';
import { conversationListPropsFactory } from 'factories/omni-ui-components/ConversationList/ConversationList.factories';
import { emptyStartersPropsFactory } from 'factories/omni-ui-components/EmptyStarters/EmptyStarters.factories';
import { integrationListPropsFactory } from 'factories/omni-ui-components/IntegrationList/IntegrationList.factories';
import { preferencesFormPropsFactory } from 'factories/omni-ui-components/PreferencesForm/PreferencesForm.factories';
import { settingsDialogPropsFactory } from 'factories/omni-ui-components/SettingsDialog/SettingsDialog.factories';

// The rule: an absent callback means the control is not rendered (never a no-op).
describe('absent callbacks render no control', () => {
  it('ConversationList: no onOpen makes titles plain text; no onNewChat, onShowArchived or onSearchChange removes those controls', () => {
    render(<ConversationList {...conversationListPropsFactory({ onOpen: undefined, onNewChat: undefined, onShowArchived: undefined, onSearchChange: undefined, rowActions: [] })} />);
    expect(screen.queryByRole('button', { name: 'Two Sum with a hash map' })).not.toBeInTheDocument();
    expect(screen.getByText('Two Sum with a hash map')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /New chat/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Archived ·/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  });

  it('ConversationHeader: menu rows without onClick are not rendered, and the menu disappears when none remain', () => {
    render(<ConversationHeader {...conversationHeaderPropsFactory({ menuItems: [{ id: 'x', label: 'No handler' }], onRename: undefined, onHistoryToggle: undefined })} />);
    expect(screen.queryByRole('button', { name: 'Conversations' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Two Sum/ })).not.toBeInTheDocument();
  });

  it('EmptyStarters: without onStart there are no cards', () => {
    render(<EmptyStarters {...emptyStartersPropsFactory({ onStart: undefined })} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('SettingsDialog: without onClose there is no close button', () => {
    render(<SettingsDialog {...settingsDialogPropsFactory({ onClose: undefined })} />);
    expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
  });

  it('PreferencesForm: memory without onEnabledChange or onForget renders no switch or Forget buttons', () => {
    render(<PreferencesForm {...preferencesFormPropsFactory({ onMemoryToggle: undefined, onForget: undefined })} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Forget/ })).not.toBeInTheDocument();
  });

  it('DataPrivacyPanel and IntegrationList: each control needs its callback', () => {
    const { unmount } = render(<DataPrivacyPanel retention="forever" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();
    render(<IntegrationList {...integrationListPropsFactory({ onToggle: undefined, onRemove: undefined, onAdd: undefined })} />);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('Toast: no action means no button', () => {
    render(<Toast toast={{ text: 'Hi', actionLabel: 'Undo' }} duration={0} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

describe('notification callbacks work uncontrolled too', () => {
  it('Toast closes itself uncontrolled and reports onOpenChange', async () => {
    const onOpenChange = jest.fn();
    const { default: userEvent } = await import('@testing-library/user-event');
    render(<Toast toast={{ text: 'Hi', actionLabel: 'Undo' }} onAction={() => undefined} duration={0} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
