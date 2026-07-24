import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tab, TabPanel, Tabs, TabsBar } from '@oc-tech/omni-ui-components/Tabs';

describe('omni-ui-components/Tabs', () => {
  it('switches the active panel when a tab is selected', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="overview">
        <TabsBar>
          <Tab value="overview">Overview</Tab>
          <Tab value="activity">Activity</Tab>
        </TabsBar>
        <TabPanel value="overview">Overview content</TabPanel>
        <TabPanel value="activity">Activity content</TabPanel>
      </Tabs>,
    );

    expect(screen.getByText('Overview content')).toBeInTheDocument();
    expect(screen.queryByText('Activity content')).not.toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Activity' }));

    expect(screen.getByText('Activity content')).toBeInTheDocument();
    expect(screen.queryByText('Overview content')).not.toBeInTheDocument();
  });
});
