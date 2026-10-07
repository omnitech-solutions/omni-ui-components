import * as React from 'react';
import { createRoot } from 'react-dom/client';
import {
  Alert, Badge, Button, Card, Checkbox, Composer, IconButton, Input, Panel, Segmented, Select, SplitButton, Tag,
} from '@oc-tech/omni-ui-components';

import '@oc-tech/omni-ui-components/styles.css';

const theme = new URLSearchParams(location.search).get('theme');
if (theme) document.documentElement.setAttribute('data-theme', theme);

const glyph = <span aria-hidden>*</span>;
const options = [{ value: 'a', label: 'One' }, { value: 'b', label: 'Two' }];

// A spread of library components that wrap native controls or use border utilities. isolation.mjs compares every computed
// property of every element here with the host stylesheet absent and present (in `@layer host`): they must be identical.
createRoot(document.getElementById('library-root')!).render(
  <div data-fixture style={{ display: 'grid', gap: 12 }}>
    <div data-fixture style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <IconButton aria-label="Icon" icon={glyph} />
      <Tag>Tag</Tag>
      <Badge>Badge</Badge>
    </div>
    <Input placeholder="Input" aria-label="Input" />
    <Checkbox>Check</Checkbox>
    <Select aria-label="Select" options={options} />
    <Segmented aria-label="Segmented" options={options} defaultValue="a" />
    <Segmented aria-label="Control" appearance="control" options={options} defaultValue="a" />
    <Alert message="Alert" />
    <Card>Card body</Card>
    <Panel title="Panel"><div>Body</div></Panel>
    <SplitButton main={{ label: 'Main', icon: glyph, onClick: () => undefined } as never} menu={{ sections: [{ items: [{ id: 'x', label: 'X' }] }] } as never} />
    <Composer value="" onChange={() => undefined} onSubmit={() => undefined} />
  </div>,
);
