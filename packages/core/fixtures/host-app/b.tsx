import { Button, Panel } from '@oc-tech/omni-ui-components';
import { createRoot } from 'react-dom/client';

import './b.css';
import '@oc-tech/omni-ui-components/styles.css';

const theme = new URLSearchParams(location.search).get('theme');
if (theme) document.documentElement.setAttribute('data-theme', theme);

createRoot(document.getElementById('library-root')!).render(
  <Panel
    title="Library panel"
    subtitle="inside a host page"
    actions={
      <Button buttonSize="sm" onClick={() => undefined}>
        Library button
      </Button>
    }
  >
    <p data-testid="panel-body">Panel body text rendered by the library.</p>
  </Panel>,
);
