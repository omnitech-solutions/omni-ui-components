import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import { Col, Row } from '@omnitech/omni-ui-core/Grid';

describe('omni-ui-components/Grid', () => {
  it('applies column width from span', () => {
    const { container } = render(<Row><Col span={12}>Half</Col></Row>);
    expect(container.firstElementChild?.firstElementChild).toHaveStyle({ width: '50%' });
  });
});
