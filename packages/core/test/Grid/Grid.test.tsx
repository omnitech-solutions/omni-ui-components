import '@testing-library/jest-dom';

import { Col, Row } from '@oc-tech/omni-ui-components/Grid';
import { render } from '@testing-library/react';

describe('omni-ui-components/Grid', () => {
  it('applies column width from span', () => {
    const { container } = render(
      <Row>
        <Col span={12}>Half</Col>
      </Row>,
    );
    expect(container.firstElementChild?.firstElementChild).toHaveStyle({ width: '50%' });
  });
});

describe('omni-ui-components/Row options', () => {
  it('without the new props it is the same flex row as before', () => {
    const { container } = render(<Row gutter={12}>x</Row>);
    const row = container.firstElementChild as HTMLElement;
    expect(row.className).toBe('flex flex-wrap');
    expect(row).toHaveStyle({ gap: '12px' });
    expect(row).not.toHaveAttribute('data-layout');
  });

  it('takes a horizontal and a vertical gutter', () => {
    const { container } = render(<Row gutter={[16, 8]}>x</Row>);
    expect(container.firstElementChild).toHaveStyle({ columnGap: '16px', rowGap: '8px' });
  });

  it('columns as a number is a grid of fixed tracks', () => {
    const { container } = render(<Row columns={3}>x</Row>);
    const row = container.firstElementChild as HTMLElement;
    expect(row).toHaveClass('grid');
    expect(row).toHaveAttribute('data-layout', 'grid');
    expect(row.style.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))');
  });

  it('minItemWidth fits as many tracks as there is room for', () => {
    const { container } = render(<Row minItemWidth={260}>x</Row>);
    expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toBe(
      'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
    );
  });

  it('columns per width sits in a query container and each step falls back to the one before', () => {
    const { container } = render(
      <Row columns={{ base: 1, sm: 2, lg: 4 }} className="mine" data-testid="grid">
        x
      </Row>,
    );
    const outer = container.firstElementChild as HTMLElement;
    expect(outer).toHaveClass('@container');
    const grid = outer.firstElementChild as HTMLElement;
    expect(grid).toHaveClass('grid', 'mine');
    expect(grid).toHaveAttribute('data-testid', 'grid');
    expect(grid.style.getPropertyValue('--oui-row-columns')).toBe('1');
    expect(grid.style.getPropertyValue('--oui-row-columns-sm')).toBe('2');
    expect(grid.style.getPropertyValue('--oui-row-columns-md')).toBe('2');
    expect(grid.style.getPropertyValue('--oui-row-columns-lg')).toBe('4');
  });
});
