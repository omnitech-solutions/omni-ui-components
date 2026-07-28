import * as React from 'react';
import { FloatButton } from '../FloatButton';

export interface BackTopProps extends React.ComponentProps<typeof FloatButton> {
  visibilityHeight?: number;
  target?: () => HTMLElement | Window | Document;
  duration?: number;
}
export const BackTop = ({ visibilityHeight = 400, target, duration = 450, children = '↑', onClick, ...props }: BackTopProps) => {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const element = target?.() ?? window;
    const update = () => setVisible(('scrollY' in element ? element.scrollY : (element as HTMLElement).scrollTop) >= visibilityHeight);
    element.addEventListener('scroll', update);
    update();
    return () => element.removeEventListener('scroll', update);
  }, [target, visibilityHeight]);
  if (!visible) return null;
  return (
    <FloatButton
      aria-label="Back to top"
      onClick={(event) => {
        const element = target?.() ?? window;
        if ('scrollTo' in element) {
          element.scrollTo({ top: 0, behavior: duration ? 'smooth' : 'auto' });
        } else {
          element.documentElement?.scrollTo({ top: 0, behavior: duration ? 'smooth' : 'auto' });
        }
        onClick?.(event);
      }}
      {...props}
    >
      {children}
    </FloatButton>
  );
};
