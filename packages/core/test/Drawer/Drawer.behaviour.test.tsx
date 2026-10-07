import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@oc-tech/omni-ui-components/Drawer';

describe('omni-ui-components/Drawer', () => {
  it('opens from its trigger, shows every part and closes via DrawerClose', async () => {
    const user = userEvent.setup();
    const titleRef = React.createRef<HTMLHeadingElement>();
    const descriptionRef = React.createRef<HTMLParagraphElement>();
    render(
      <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent side="left">
          <DrawerHeader>
            <DrawerTitle ref={titleRef}>Filters</DrawerTitle>
            <DrawerDescription ref={descriptionRef}>Narrow the list</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            <DrawerClose>Done</DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>,
    );
    await user.click(screen.getByText('Open'));
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(titleRef.current).toHaveTextContent('Filters');
    expect(descriptionRef.current).toHaveTextContent('Narrow the list');
    expect(dialog).toHaveClass('left-0');
    await user.click(within(dialog).getByText('Done'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('exposes overlay and portal parts for custom composition', () => {
    const overlayRef = React.createRef<HTMLDivElement>();
    render(
      <Drawer open>
        <DrawerPortal>
          <DrawerOverlay ref={overlayRef} data-testid="overlay" />
          <DrawerContent aria-describedby={undefined}>
            <DrawerTitle>Custom</DrawerTitle>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>,
    );
    expect(screen.getByTestId('overlay')).toBe(overlayRef.current);
    expect(screen.getByRole('dialog', { name: 'Custom' })).toBeInTheDocument();
  });
});
