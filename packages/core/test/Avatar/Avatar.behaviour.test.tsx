import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import * as React from 'react';

import { Avatar, OmniAvatarFallback, OmniAvatarImage } from '@oc-tech/omni-ui-components/Avatar';

describe('omni-ui-components/Avatar', () => {
  it('shows the fallback when there is no image source', () => {
    render(<Avatar fallback="AL" />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('shows the fallback while the image is not loaded and renders extra children', () => {
    render(
      <Avatar src="https://example.test/a.png" alt="Ada" fallback="AD">
        <span data-testid="badge" />
      </Avatar>,
    );
    // happy-dom never loads the image, so Radix keeps the fallback.
    expect(screen.getByText('AD')).toBeInTheDocument();
    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders nothing but the container with neither src nor fallback, and forwards ref and className', () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} className="extra" data-testid="a" />);
    expect(ref.current).toBe(screen.getByTestId('a'));
    expect(ref.current).toHaveClass('extra');
    expect(ref.current).toBeEmptyDOMElement();
  });

  it('exposes standalone image and fallback parts that forward refs', () => {
    const fallbackRef = React.createRef<HTMLSpanElement>();
    render(
      <Avatar>
        <OmniAvatarImage src="https://example.test/b.png" alt="Bea" />
        <OmniAvatarFallback ref={fallbackRef}>BE</OmniAvatarFallback>
      </Avatar>,
    );
    expect(fallbackRef.current).toHaveTextContent('BE');
  });
});
