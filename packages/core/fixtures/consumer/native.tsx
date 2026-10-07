import { Button, Panel, Toolbar } from '@oc-tech/omni-ui-components/native';
import { createRoot } from 'react-dom/client';

createRoot(document.body).render(
  <Panel title="Session">
    <Toolbar label="Actions">
      <Button>Save</Button>
    </Toolbar>
  </Panel>,
);
