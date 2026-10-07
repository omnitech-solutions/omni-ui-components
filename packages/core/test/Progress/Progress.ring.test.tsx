import '@testing-library/jest-dom';

import { Progress } from '@oc-tech/omni-ui-components/Progress';
import { render, screen } from '@testing-library/react';
import { progressRingVariants } from 'factories/omni-ui-components/Progress/Progress.factories';

const TONES = ['neutral', 'accent', 'success', 'warning', 'danger', 'dim'] as const;

describe('omni-ui-components/Progress ring', () => {
  it('keeps the linear bar as the default shape', () => {
    render(<Progress percent={45} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  describe('determinate', () => {
    it('is a progressbar with aria-valuenow and a 0-100 range', () => {
      render(<Progress shape="ring" value={40} />);
      const ring = screen.getByRole('progressbar', { name: 'Progress' });
      expect(ring).toHaveAttribute('aria-valuenow', '40');
      expect(ring).toHaveAttribute('aria-valuemin', '0');
      expect(ring).toHaveAttribute('aria-valuemax', '100');
      expect(ring).not.toHaveAttribute('aria-busy');
      expect(ring).not.toHaveAttribute('data-indeterminate');
    });

    it('clamps out-of-range values', () => {
      const { rerender } = render(<Progress shape="ring" value={140} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
      rerender(<Progress shape="ring" value={-5} />);
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    });

    it('draws the arc in proportion to the value and does not spin', () => {
      const { container } = render(<Progress shape="ring" value={25} />);
      const arc = container.querySelector('[data-slot="progress-ring-arc"]')!;
      const circumference = Number(arc.getAttribute('stroke-dasharray'));
      expect(Number(arc.getAttribute('stroke-dashoffset'))).toBeCloseTo(circumference * 0.75, 3);
      expect(container.querySelector('svg')).not.toHaveClass('animate-spin');
    });
  });

  describe('indeterminate', () => {
    it('is aria-busy without aria-valuenow, and spins', () => {
      const { container } = render(<Progress shape="ring" />);
      const ring = screen.getByRole('progressbar', { name: 'Loading' });
      expect(ring).toHaveAttribute('aria-busy', 'true');
      expect(ring).not.toHaveAttribute('aria-valuenow');
      expect(ring).toHaveAttribute('data-indeterminate', 'true');
      expect(container.querySelector('svg')).toHaveClass('animate-spin');
    });

    it('takes a custom accessible name', () => {
      render(<Progress shape="ring" aria-label="Analysing" />);
      expect(screen.getByRole('progressbar', { name: 'Analysing' })).toBeInTheDocument();
    });
  });

  describe('tone and size', () => {
    TONES.forEach((tone) => {
      it(`tone=${tone} colours the ring with the ${tone} token`, () => {
        render(<Progress shape="ring" tone={tone} />);
        const ring = screen.getByRole('progressbar');
        expect(ring).toHaveAttribute('data-tone', tone);
        expect(ring).toHaveClass(`text-[color:var(--oui-tone-${tone}-fg)]`);
      });
    });

    it('defaults to the accent tone and a 20px (control icon) size', () => {
      render(<Progress shape="ring" />);
      const ring = screen.getByRole('progressbar');
      expect(ring).toHaveAttribute('data-tone', 'accent');
      expect(ring).toHaveStyle({ width: '20px', height: '20px' });
    });

    it('sizes the ring from the size prop', () => {
      render(<Progress shape="ring" size={36} />);
      expect(screen.getByRole('progressbar')).toHaveStyle({ width: '36px', height: '36px' });
    });
  });

  it('a decorative (aria-hidden) ring carries no progressbar role', () => {
    const { container } = render(<Progress shape="ring" aria-hidden="true" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot="progress-ring"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('renders every factory ring variant', () => {
    progressRingVariants.forEach((variant) => {
      const { unmount } = render(<Progress {...variant.args} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      unmount();
    });
  });
});
