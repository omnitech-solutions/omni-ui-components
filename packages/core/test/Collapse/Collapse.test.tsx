import '@testing-library/jest-dom';

import { Collapse } from '@oc-tech/omni-ui-components/Collapse';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  collapsePropsFactory,
  collapseVariants,
  ServiceCards,
  services,
} from 'factories/omni-ui-components/Collapse/Collapse.factories';

const root = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('[data-slot="collapse"]');

describe('omni-ui-components/Collapse', () => {
  it('toggles panel content', async () => {
    const user = userEvent.setup();
    render(<Collapse items={[{ key: '1', label: 'General', children: 'Panel body' }]} />);
    expect(screen.queryByText('Panel body')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /General/ }));
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });

  it.each(collapseVariants)('draws a header per item: $name', ({ args }) => {
    const { container } = render(<Collapse {...collapsePropsFactory(args)} />);
    expect(container.querySelectorAll('[data-slot="collapse-header"]')).toHaveLength(
      services.length,
    );
  });

  it('draws the description under the label, open or closed, and the extra node at the end of the header', async () => {
    const user = userEvent.setup();
    const { container } = render(<Collapse {...collapsePropsFactory()} />);
    const header = screen.getByRole('button', { name: /API/ });
    expect(header.querySelector('[data-slot="collapse-label"]')).toHaveTextContent('API');
    expect(header.querySelector('[data-slot="collapse-description"]')).toHaveTextContent(
      'Platform team · eu-west-1',
    );
    expect(header.querySelector('[data-slot="collapse-extra"]')).toHaveTextContent('99.98%');
    await user.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
    expect(header.querySelector('[data-slot="collapse-description"]')).toBeInTheDocument();
    expect(container.querySelector('[data-slot="collapse-content"]')).toHaveTextContent(
      'OwnerPlatform team',
    );
  });

  it('an item without a description draws none', () => {
    const { container } = render(
      <Collapse items={[{ key: '1', label: 'General', children: 'Panel body' }]} />,
    );
    expect(container.querySelector('[data-slot="collapse-description"]')).toBeNull();
  });

  it('says its size and tone on the root, default unless given', () => {
    const plain = render(<Collapse {...collapsePropsFactory()} />);
    expect(root(plain.container)).toHaveAttribute('data-size', 'default');
    expect(root(plain.container)).toHaveAttribute('data-tone', 'default');
    plain.unmount();
    const { container } = render(
      <Collapse {...collapsePropsFactory({ size: 'small', tone: 'accent' })} />,
    );
    expect(root(container)).toHaveAttribute('data-size', 'small');
    expect(root(container)).toHaveAttribute('data-tone', 'accent');
    expect(root(container)?.className).toContain('--oui-tone-accent-bg');
  });

  it('passes data attributes and a test id to the root', () => {
    render(<Collapse {...collapsePropsFactory()} data-testid="group" data-kind="services" />);
    expect(screen.getByTestId('group')).toHaveAttribute('data-kind', 'services');
    expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'collapse');
  });

  it('one group an entry: each opens on its own and only the pinned one has the accent tone', async () => {
    const user = userEvent.setup();
    const { container } = render(<ServiceCards />);
    const groups = Array.from(container.querySelectorAll<HTMLElement>('[data-slot="collapse"]'));
    expect(groups.map((group) => group.getAttribute('data-tone'))).toEqual([
      'default',
      'accent',
      'default',
    ]);
    const [api, search] = groups as [HTMLElement, HTMLElement];
    expect(within(search).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(api).getByRole('button'));
    expect(within(api).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(within(search).getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    await user.click(within(search).getByRole('button'));
    expect(within(search).getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });
});
