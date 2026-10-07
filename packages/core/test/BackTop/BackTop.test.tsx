import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

import { BackTop } from '@oc-tech/omni-ui-components/BackTop';

const setScrollY = (value: number) => {
  Object.defineProperty(window, 'scrollY', { value, configurable: true, writable: true });
};

describe('omni-ui-components/BackTop', () => {
  afterEach(() => {
    setScrollY(0);
    vi.restoreAllMocks();
  });

  it('stays hidden until the window scrolls past the visibility height', () => {
    setScrollY(0);
    render(<BackTop visibilityHeight={200} />);
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument();

    act(() => {
      setScrollY(199);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    act(() => {
      setScrollY(200);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('shows immediately when already scrolled and hides again when scrolled back up', () => {
    setScrollY(900);
    render(<BackTop />);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();

    act(() => {
      setScrollY(10);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('smooth-scrolls the window to the top and calls onClick with the event', () => {
    setScrollY(500);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const onClick = vi.fn();
    render(<BackTop onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0][0]).toHaveProperty('type', 'click');
  });

  it('jumps instantly when duration is 0', () => {
    setScrollY(500);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    render(<BackTop duration={0} />);
    fireEvent.click(screen.getByRole('button'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
  });

  it('listens to a custom scroll target element via scrollTop and scrolls it', () => {
    const box = document.createElement('div');
    const boxScrollTo = vi.fn();
    (box as unknown as { scrollTo: typeof boxScrollTo }).scrollTo = boxScrollTo;
    box.scrollTop = 0;
    render(<BackTop target={() => box} visibilityHeight={50} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    act(() => {
      box.scrollTop = 80;
      box.dispatchEvent(new Event('scroll'));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(boxScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('scrolls the documentElement when the target is a Document', () => {
    const documentScrollTo = vi.fn();
    const fakeDocument = Object.assign(document.createElement('div'), {
      documentElement: { scrollTo: documentScrollTo },
      scrollY: 0,
    }) as unknown as Document;
    // A plain object without scrollTo mimics a Document target.
    const target = {
      addEventListener: (type: string, fn: () => void) => fakeDocument.addEventListener(type, fn),
      removeEventListener: (type: string, fn: () => void) => fakeDocument.removeEventListener(type, fn),
      scrollY: 1000,
      documentElement: { scrollTo: documentScrollTo },
    } as unknown as Document;
    render(<BackTop target={() => target} visibilityHeight={10} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to top' }));
    expect(documentScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('removes its scroll listener on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BackTop />);
    unmount();
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('renders custom children', () => {
    setScrollY(1000);
    render(<BackTop>Top</BackTop>);
    expect(screen.getByRole('button', { name: 'Back to top' })).toHaveTextContent('Top');
  });
});
