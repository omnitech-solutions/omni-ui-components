import { Alert, Button, Card, Input, Panel, Segmented, Tag } from '@oc-tech/omni-ui-components';
import type * as React from 'react';
import { createRoot } from 'react-dom/client';

import '@oc-tech/omni-ui-components/styles.css';

const options = [
  { value: 'a', label: 'One' },
  { value: 'b', label: 'Two' },
];

// One component set per themed container. isolation.mjs reads computed styles per container: two subtrees, two palettes, one document.
const Set = ({
  id,
  theme,
  style,
  children,
}: {
  id: string;
  theme?: 'light' | 'dark';
  style?: React.CSSProperties;
  children?: React.ReactNode;
}) => (
  <section
    id={id}
    data-theme={theme}
    data-fixture
    style={{
      padding: 12,
      display: 'grid',
      gap: 8,
      background: 'var(--oui-background-current)',
      color: 'var(--text-default)',
      ...style,
    }}
  >
    <Panel title={`${id} panel`}>
      <div data-probe="panel-body">Body</div>
    </Panel>
    <div data-fixture style={{ display: 'flex', gap: 8 }}>
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Tag>Tag</Tag>
    </div>
    <Input placeholder="Input" aria-label={`${id} input`} />
    <div data-probe="segmented" data-fixture>
      <Segmented aria-label={`${id} segmented`} options={options} defaultValue="a" />
    </div>
    <div data-probe="alert" data-fixture>
      <Alert title="Alert">Body</Alert>
    </div>
    <div data-probe="card" data-fixture>
      <Card>Card body</Card>
    </div>
    {children}
  </section>
);

createRoot(document.getElementById('library-root')!).render(
  <div data-fixture style={{ display: 'grid', gap: 12 }}>
    <Set id="plain" />
    <Set id="light-host" theme="light">
      <Set id="dark-in-light" theme="dark" />
    </Set>
    <Set id="dark-host" theme="dark">
      <Set id="light-in-dark" theme="light" />
    </Set>
    <Set
      id="override"
      theme="dark"
      style={{
        ['--oui-panel-bg' as string]: 'rgb(10, 200, 30)',
        ['--oui-primary' as string]: '#ff00aa',
        ['--primary' as string]: '#ff00aa',
      }}
    />
  </div>,
);
