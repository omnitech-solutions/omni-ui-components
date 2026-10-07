import * as React from 'react';

import { Alert } from '../Alert';
import { Button } from '../Button';
import { Card } from '../Card';
import { Input } from '../Input';
import { Panel } from '../Panel';
import { Segmented } from '../Segmented';
import { Tag } from '../Tag';

const OPTIONS = [
  { value: 'a', label: 'One' },
  { value: 'b', label: 'Two' },
];

export interface ThemedSetProps {
  /** Heading shown above the set (story chrome). */
  title: string;
  /** `data-theme` for this container; omit for the page's own theme. */
  theme?: 'light' | 'dark';
  /** Token overrides set on the container (any `--oui-*` or legacy token). */
  tokens?: Record<string, string>;
  /** Nested container, e.g. a subtree with the opposite theme. */
  children?: React.ReactNode;
}

/** One component set in one themed container: the same markup is rendered in every container of the Theming story. */
export const ThemedSet: React.FC<ThemedSetProps> = ({ title, theme, tokens, children }) => (
  <section
    data-theme={theme}
    data-testid={title}
    style={{ ...(tokens as React.CSSProperties), padding: 12, display: 'grid', gap: 8, background: 'var(--oui-background-current)', color: 'var(--text-default)', borderRadius: 12 }}
  >
    <Panel title={title}>
      <div style={{ padding: 8 }}>Panel body</div>
    </Panel>
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Tag>Tag</Tag>
    </div>
    <Input placeholder="Input" aria-label={`${title} input`} />
    <Segmented aria-label={`${title} segmented`} options={OPTIONS} defaultValue="a" />
    <Alert title="Alert">Body</Alert>
    <Card>Card body</Card>
    {children}
  </section>
);
