import '@testing-library/jest-dom';

import { Content, Footer, Header, Layout, Sider } from '@oc-tech/omni-ui-components/Layout';
import { fireEvent, render, screen } from '@testing-library/react';
import * as React from 'react';

describe('omni-ui-components/Layout without the new props', () => {
  it('renders the same elements and classes as before the options', () => {
    const { container } = render(
      <Layout>
        <Header>Header</Header>
        <Sider>Side</Sider>
        <Content>Body</Content>
        <Footer>Footer</Footer>
      </Layout>,
    );
    expect(container.innerHTML).toBe(
      '<section class="flex min-h-0 flex-col">' +
        '<header class="border-b px-6 py-4">Header</header>' +
        '<aside class="min-h-0 border-r px-4 py-4">Side</aside>' +
        '<main class="min-h-0 flex-1 px-6 py-4">Body</main>' +
        '<footer class="border-t px-6 py-4">Footer</footer>' +
        '</section>',
    );
  });
});

describe('omni-ui-components/Layout options', () => {
  it('lays out in a row and fills the viewport', () => {
    render(
      <Layout direction="row" fill data-testid="frame">
        <Content>Body</Content>
      </Layout>,
    );
    const frame = screen.getByTestId('frame');
    expect(frame).toHaveClass('flex-row', 'h-dvh', 'overflow-hidden');
    expect(frame).not.toHaveClass('flex-col');
    expect(frame).toHaveAttribute('data-direction', 'row');
    expect(frame).toHaveAttribute('data-fill', 'true');
  });
});

describe('omni-ui-components/Header options', () => {
  it('draws a page header: eyebrow, heading of the level, description, meta, actions and children', () => {
    render(
      <Header
        level={1}
        eyebrow="Settings"
        title="Notifications"
        description="What is sent"
        meta="Saved"
        actions={<button type="button">Save</button>}
      >
        <p>Under the row</p>
      </Header>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Notifications' })).toBeInTheDocument();
    const row = screen.getByRole('banner').querySelector('[data-slot="header-row"]');
    expect(row?.textContent).toBe('SettingsNotificationsWhat is sentSavedSave');
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByText('Under the row')).toBeInTheDocument();
  });

  it('defaults to an h2, and takes h3, no rule and smaller padding', () => {
    const { rerender } = render(<Header title="Section" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Section' })).toBeInTheDocument();
    rerender(<Header title="Section" level={3} bordered={false} padding="sm" />);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveClass('border-b-0', 'px-4', 'py-2');
    rerender(<Header title="Section" padding="none" />);
    expect(screen.getByRole('banner')).toHaveClass('p-0');
  });
});

describe('omni-ui-components/Content options', () => {
  it('limits the width in a centred container', () => {
    render(<Content maxWidth="lg">Body</Content>);
    const container = screen.getByRole('main').querySelector('[data-slot="content-container"]');
    expect(container).toHaveClass('mx-auto', 'max-w-[1024px]');
    expect(container).toHaveTextContent('Body');
  });

  it('centres, scrolls, pads and picks its element', () => {
    render(
      <Content center scroll padding="lg" as="div" data-testid="content">
        Body
      </Content>,
    );
    const content = screen.getByTestId('content');
    expect(content.tagName).toBe('DIV');
    expect(content).toHaveClass('grid', 'place-items-center', 'overflow-y-auto', 'px-8', 'py-6');
    expect(content.className).toContain('--oui-panel-scrollbar-thumb');
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});

describe('omni-ui-components/Sider options', () => {
  it('takes a width and a side without changing its structure', () => {
    render(
      <Sider width={300} side="end" label="Details">
        Side
      </Sider>,
    );
    const sider = screen.getByRole('complementary', { name: 'Details' });
    expect(sider).toHaveStyle({ width: '300px' });
    expect(sider).toHaveClass('border-l');
    expect(sider.children).toHaveLength(0);
  });

  it('collapses uncontrolled through its control and reports the change', () => {
    const onCollapsedChange = jest.fn();
    render(
      <Sider
        collapsible
        label="Main navigation"
        onCollapsedChange={onCollapsedChange}
        header={({ collapsed }) => (collapsed ? 'A' : 'Acme')}
        footer="Version 2"
      >
        Links
      </Sider>,
    );
    const sider = screen.getByRole('complementary', { name: 'Main navigation' });
    expect(sider).toHaveStyle({ width: '240px' });
    expect(sider).not.toHaveAttribute('data-collapsed');
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Version 2')).toBeInTheDocument();

    const control = screen.getByRole('button', { name: 'Collapse sidebar' });
    expect(control).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById(control.getAttribute('aria-controls') ?? '')).toHaveTextContent(
      'Links',
    );
    fireEvent.click(control);

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    expect(sider).toHaveAttribute('data-collapsed', 'true');
    expect(sider).toHaveStyle({ width: '56px' });
    expect(screen.getByText('A')).toBeInTheDocument();
    const expand = screen.getByRole('button', { name: 'Expand sidebar' });
    expect(expand).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(expand);
    expect(onCollapsedChange).toHaveBeenLastCalledWith(false);
    expect(sider).not.toHaveAttribute('data-collapsed');
  });

  it('is controlled: the change is reported and the prop decides', () => {
    const Host = ({ onChange }: { onChange: (collapsed: boolean) => void }) => {
      const [collapsed] = React.useState(true);
      return (
        <Sider
          collapsible
          collapsed={collapsed}
          collapsedWidth={64}
          onCollapsedChange={onChange}
          labels={{ expand: 'Open the side' }}
          expandIcon={<span>open</span>}
        >
          Links
        </Sider>
      );
    };
    const onChange = jest.fn();
    render(<Host onChange={onChange} />);
    const sider = screen.getByRole('complementary');
    expect(sider).toHaveStyle({ width: '64px' });
    fireEvent.click(screen.getByRole('button', { name: 'Open the side' }));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(sider).toHaveAttribute('data-collapsed', 'true');
  });

  it('draws no control without collapsible, and scrolls its body', () => {
    render(
      <Sider defaultCollapsed scroll>
        Links
      </Sider>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('complementary')).toHaveAttribute('data-collapsed', 'true');
    expect(screen.getByText('Links')).toHaveClass('overflow-y-auto');
  });
});
