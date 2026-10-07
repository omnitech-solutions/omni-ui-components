import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { Result } from '@oc-tech/omni-ui-components/Result';

describe('omni-ui-components/Result', () => {
  it.each([
    ['info', 'lucide-info', 'text-muted-foreground'],
    ['success', 'lucide-circle-check', 'text-primary'],
    ['warning', 'lucide-circle-alert', 'text-muted-foreground'],
    ['error', 'lucide-circle-x', 'text-destructive'],
  ] as const)('%s status uses its icon and tone', (status, iconClass, toneClass) => {
    const { container } = render(<Result status={status} />);
    const icon = container.querySelector('svg') as SVGElement;
    expect(icon.getAttribute('class')).toContain(iconClass);
    expect(icon).toHaveClass(toneClass);
  });

  it('defaults to info and renders title, sub title and extra when given', () => {
    const { container } = render(<Result title="Done" subTitle="All saved" extra={<button type="button">Back</button>} className="extra" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('lucide-info');
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('All saved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('extra');
  });

  it('omits title and sub title when absent', () => {
    const { container } = render(<Result status="success" />);
    expect(container.querySelectorAll('div > div')).toHaveLength(0);
  });
});
