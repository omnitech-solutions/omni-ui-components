import '@testing-library/jest-dom';

import { Descriptions } from '@oc-tech/omni-ui-components/Descriptions';
import { render, screen } from '@testing-library/react';
import {
  descriptionsPropsFactory,
  descriptionsVariants,
  release,
} from 'factories/omni-ui-components/Descriptions/Descriptions.factories';

describe('omni-ui-components/Descriptions', () => {
  it('renders labels and values', () => {
    render(<Descriptions items={[{ label: 'Owner', children: 'Alex' }]} />);
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
  });

  it.each(descriptionsVariants)('draws every item as a label over its value: $name', ({ args }) => {
    const { container } = render(<Descriptions {...descriptionsPropsFactory(args)} />);
    const items = Array.from(container.querySelectorAll('[data-slot="descriptions-item"]'));
    expect(items.map((item) => item.textContent)).toEqual([
      `Version${release.version}`,
      `Channel${release.channel}`,
      `Changes${release.changes.join('')}`,
      `Checksum${release.checksum}`,
    ]);
    expect(container.querySelectorAll('dt')).toHaveLength(4);
    expect(container.querySelectorAll('dd')).toHaveLength(4);
  });

  it('is a box by default and says its size', () => {
    render(<Descriptions {...descriptionsPropsFactory()} data-testid="facts" />);
    const root = screen.getByTestId('facts');
    expect(root).toHaveAttribute('data-slot', 'descriptions');
    expect(root).toHaveAttribute('data-bordered', 'true');
    expect(root).toHaveAttribute('data-size', 'default');
    expect(root).toHaveClass('border');
  });

  it('bordered={false} draws no box and no padding of its own', () => {
    const { container } = render(
      <Descriptions {...descriptionsPropsFactory({ bordered: false })} data-testid="facts" />,
    );
    const root = screen.getByTestId('facts');
    expect(root).toHaveAttribute('data-bordered', 'false');
    expect(root).not.toHaveClass('border');
    expect(container.querySelector('dl')?.className).not.toMatch(/\bp[xy]-/);
  });

  it('size="small" is said on the root and tightens the list', () => {
    const { container } = render(
      <Descriptions {...descriptionsPropsFactory({ size: 'small' })} data-testid="facts" />,
    );
    expect(screen.getByTestId('facts')).toHaveAttribute('data-size', 'small');
    expect(container.querySelector('dl')).toHaveClass('px-3');
  });

  it('draws the title above the items when given', () => {
    const { container } = render(
      <Descriptions {...descriptionsPropsFactory({ title: 'Release' })} />,
    );
    expect(container.querySelector('[data-slot="descriptions-title"]')).toHaveTextContent(
      'Release',
    );
  });
});
