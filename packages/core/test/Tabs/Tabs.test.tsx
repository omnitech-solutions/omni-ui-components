import '@testing-library/jest-dom';

import { Tab, TabPanel, Tabs, TabsBar } from '@oc-tech/omni-ui-components/Tabs';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as React from 'react';

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

  const bar = (props: React.ComponentProps<typeof TabsBar> = {}) =>
    render(
      <Tabs defaultValue="one">
        <TabsBar aria-label="Sections" {...props}>
          <Tab value="one">One</Tab>
          <Tab value="two">Two</Tab>
        </TabsBar>
        <TabPanel value="one">First</TabPanel>
        <TabPanel value="two">Second</TabPanel>
      </Tabs>,
    );

  it('the bar scrolls sideways by default: it never grows past what holds it, and its own class is kept', () => {
    bar({ className: 'mine' });
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(list).toHaveAttribute('data-scrollable', 'true');
    expect(list).toHaveClass('max-w-full', 'overflow-x-auto', 'mine');
    expect(list).not.toHaveAttribute('scrollable');
  });

  it('scrollable={false} leaves the bar as it was', () => {
    bar({ scrollable: false });
    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(list).not.toHaveAttribute('data-scrollable');
    expect(list).not.toHaveClass('overflow-x-auto');
  });

  it('the chosen tab is brought into view by scrolling the bar alone, never the page', async () => {
    // happy-dom lays nothing out: a bar 100px wide holding two 80px tabs.
    const widths = vi
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(function clientWidth(this: HTMLElement) {
        return this.getAttribute('role') === 'tablist' ? 100 : 0;
      });
    const scrolls = vi
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockImplementation(function scrollWidth(this: HTMLElement) {
        return this.getAttribute('role') === 'tablist' ? 160 : 0;
      });
    const lefts = vi
      .spyOn(HTMLElement.prototype, 'offsetLeft', 'get')
      .mockImplementation(function offsetLeft(this: HTMLElement) {
        return this.textContent === 'Two' ? 80 : 0;
      });
    const tabWidths = vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(80);
    const page = vi.fn();
    const original = HTMLElement.prototype.scrollIntoView;
    HTMLElement.prototype.scrollIntoView = page;
    try {
      const user = userEvent.setup();
      bar();
      const list = screen.getByRole('tablist', { name: 'Sections' });
      expect(list.scrollLeft).toBe(0);
      await user.click(screen.getByRole('tab', { name: 'Two' }));
      await waitFor(() => expect(list.scrollLeft).toBe(60));
      await user.click(screen.getByRole('tab', { name: 'One' }));
      await waitFor(() => expect(list.scrollLeft).toBe(0));
      expect(page).not.toHaveBeenCalled();
    } finally {
      HTMLElement.prototype.scrollIntoView = original;
      for (const spy of [widths, scrolls, lefts, tabWidths]) spy.mockRestore();
    }
  });

  it('a ref given to the bar still reaches its element', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Tabs defaultValue="one">
        <TabsBar ref={ref}>
          <Tab value="one">One</Tab>
        </TabsBar>
      </Tabs>,
    );
    expect(ref.current).toBe(screen.getByRole('tablist'));
  });
});
