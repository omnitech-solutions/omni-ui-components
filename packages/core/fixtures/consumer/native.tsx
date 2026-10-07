import { createRoot } from 'react-dom/client';
import { Button, Panel, Toolbar } from '@oc-tech/omni-ui-components/native';

createRoot(document.body).render(
  <Panel title="Session">
    <Toolbar label="Actions">
      <Button>Save</Button>
    </Toolbar>
  </Panel>,
);
