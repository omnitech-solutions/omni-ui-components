/**
 * Absolutely-positioned dropdown container that flips its horizontal /
 * vertical anchor when it would overflow the viewport. Used by the built-in
 * column filter popover so the menu stays inside the table view.
 *
 * The anchor decision is based on the dropdown's own bounding rect after
 * mount. Attributes exposed for styling / testing:
 *   - `data-align-x="left"` (default) | `"right"`
 *   - `data-align-y="bottom"` (default) | `"top"`
 */

import * as React from 'react';
import { createPortal } from 'react-dom';

interface AutoFlipDropdownProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

/**
 * Portals the dropdown into `<body>` and positions it with `position: fixed`
 * anchored to its logical trigger (the parent element in the original DOM
 * tree). This guarantees the dropdown is fully decoupled from the row layout
 * — siblings like a Show code panel can never move when the dropdown opens.
 *
 * Auto-flips horizontally/vertically to stay inside the viewport and, when
 * present, inside the nearest `.pb-overview-row-preview` /
 * `[data-dropdown-boundary]` ancestor of the trigger.
 */
export const AutoFlipDropdown: React.FC<AutoFlipDropdownProps> = ({ children, className, style, ...rest }) => {
  // Anchor stays in the original DOM tree so we can find the trigger + boundary.
  const anchorRef = React.useRef<HTMLSpanElement | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number; alignX: 'left' | 'right'; alignY: 'top' | 'bottom' } | null>(null);

  React.useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const dropdown = dropdownRef.current;
    if (!anchor || !dropdown) return;
    const trigger = anchor.parentElement;
    if (!trigger) return;

    const measure = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const dropdownRect = dropdown.getBoundingClientRect();
      const viewportW = document.documentElement.clientWidth;
      const viewportH = document.documentElement.clientHeight;
      const boundaryEl = trigger.closest<HTMLElement>('.pb-overview-row-preview, [data-dropdown-boundary]');
      const boundary = boundaryEl?.getBoundingClientRect();
      const rightLimit = boundary ? Math.min(boundary.right, viewportW) : viewportW;
      const bottomLimit = boundary ? Math.min(boundary.bottom, viewportH) : viewportH;
      const topLimit = boundary ? Math.max(boundary.top, 0) : 0;
      const leftLimit = boundary ? Math.max(boundary.left, 0) : 0;

      const spaceBelow = bottomLimit - triggerRect.bottom;
      const spaceAbove = triggerRect.top - topLimit;
      const alignY: 'top' | 'bottom' = dropdownRect.height > spaceBelow && spaceAbove > spaceBelow ? 'top' : 'bottom';

      const openLeftFits = triggerRect.left + dropdownRect.width <= rightLimit;
      const alignX: 'left' | 'right' = openLeftFits ? 'left' : 'right';

      const top =
        alignY === 'top'
          ? Math.max(topLimit, Math.min(triggerRect.top - dropdownRect.height, bottomLimit - dropdownRect.height))
          : Math.max(topLimit, Math.min(triggerRect.bottom, bottomLimit - dropdownRect.height));
      const left =
        alignX === 'left'
          ? Math.max(leftLimit, Math.min(triggerRect.left, rightLimit - dropdownRect.width))
          : Math.max(leftLimit, Math.min(triggerRect.right - dropdownRect.width, rightLimit - dropdownRect.width));
      setPos({ top, left, alignX, alignY });
    };

    measure();
    const raf = window.requestAnimationFrame(measure);
    const onScrollOrResize = () => measure();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [children]);

  const dropdownStyle: React.CSSProperties = {
    position: 'fixed',
    top: pos?.top ?? -9999,
    left: pos?.left ?? -9999,
    visibility: pos ? 'visible' : 'hidden',
    ...style,
  };

  const portalTarget = typeof document !== 'undefined' ? document.body : null;
  return (
    <>
      <span ref={anchorRef} style={{ display: 'none' }} aria-hidden />
      {portalTarget &&
        createPortal(
          <div ref={dropdownRef} className={className} style={dropdownStyle} data-align-x={pos?.alignX} data-align-y={pos?.alignY} {...rest}>
            {children}
          </div>,
          portalTarget,
        )}
    </>
  );
};
