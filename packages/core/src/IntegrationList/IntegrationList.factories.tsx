import * as React from 'react';
import { Network, Trash2, UserRound } from 'lucide-react';

import { Button } from '@oc-tech/omni-ui-components/Button';
import { IntegrationList } from '@oc-tech/omni-ui-components/IntegrationList';
import type { IntegrationItem, IntegrationListProps } from '@oc-tech/omni-ui-components/IntegrationList';
import type { Variant } from '../../internal/support/makeFactory';

export const sampleIntegrations = (): IntegrationItem[] => [
  { id: 'i1', name: 'Docs search', detail: '4 tools · connected', status: 'connected', enabled: true },
  { id: 'i2', name: 'Issue tracker', detail: 'Not reachable', status: 'unreachable', enabled: true },
  { id: 'i3', name: 'Staging database', detail: 'Off', status: 'off', enabled: false },
];

/** An OAuth-style row: an account chip and a Reconnect button (the fit for a future connected-accounts variant). */
export const oauthIntegrations = (): IntegrationItem[] => [
  {
    id: 'g1',
    name: 'Google Calendar',
    detail: 'Read events · connected',
    status: 'connected',
    enabled: true,
    account: 'ada@example.com',
    connectAction: (
      <Button variant="outline" buttonSize="sm">
        Reconnect
      </Button>
    ),
  },
  { id: 'g2', name: 'GitHub', detail: 'Not connected', status: 'off', enabled: false, connectAction: <Button buttonSize="sm">Connect</Button> },
];

/** Build `<IntegrationList>` props for standalone stories and tests. */
export const integrationListPropsFactory = (overrides: Partial<IntegrationListProps> = {}): IntegrationListProps => ({
  items: sampleIntegrations(),
  itemIcon: <Network />,
  removeIcon: <Trash2 />,
  onToggle: () => undefined,
  onRemove: () => undefined,
  onAdd: () => undefined,
  ...overrides,
});

export const integrationListVariants: Variant<IntegrationListProps>[] = [
  { name: 'MCP servers', args: {} },
  { name: 'Loading', args: { items: undefined, loading: true } },
  { name: 'Empty', args: { items: [] } },
  { name: 'Read-only (no switch, remove or add)', args: { onToggle: undefined, onRemove: undefined, onAdd: undefined } },
  {
    name: 'OAuth accounts (connectAction, account)',
    args: { items: oauthIntegrations(), intro: 'Connect accounts so the assistant can act on your behalf.', onAdd: undefined, connectAction: <Button buttonSize="sm" icon={<UserRound />}>Add account</Button> },
  },
];

/** A working list: toggle, remove and add (the add is slow, so the busy state shows). */
export const IntegrationListDemo: React.FC<{ onAction?: (name: string, ...args: unknown[]) => void }> = ({ onAction }) => {
  const [items, setItems] = React.useState(sampleIntegrations());
  return (
    <div className="w-[520px]">
      <IntegrationList
        {...integrationListPropsFactory({
          items,
          onToggle: (integration, enabled) => {
            setItems((list) => list.map((item) => (item.id === integration.id ? { ...item, enabled } : item)));
            onAction?.('toggle', integration.id, enabled);
          },
          onRemove: (integration) => {
            setItems((list) => list.filter((item) => item.id !== integration.id));
            onAction?.('remove', integration.id);
          },
          onAdd: async (url) => {
            await new Promise((resolve) => setTimeout(resolve, 400));
            setItems((list) => [...list, { id: url, name: new URL(url).hostname, detail: '0 tools · connected', status: 'connected', enabled: true }]);
            onAction?.('add', url);
          },
        })}
      />
    </div>
  );
};
