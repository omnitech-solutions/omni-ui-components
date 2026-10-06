import * as React from 'react';

import { cn } from 'lib/utils';
import { Button } from '../Button';
import { composerNoticeVariants } from './Composer.variants';
import type { ComposerNoticeProps } from './Composer.types';

/**
 * A small inline callout above the composer, for a capability warning (an image is attached but the model cannot
 * see it) with one optional action (`Switch`). A polite `<output>` (as the original), tinted from the `--oui-tone-*`
 * scale in light and dark. The library `Alert` is a form-sized card with fixed spacing and no action slot, so this is
 * a purpose-built row instead. Slot: `data-slot="composer-notice"`.
 *
 * @example
 * <ComposerNotice message="Haiku can't see images. Switch to Sonnet?" icon={<EyeOff />} action={{ label: 'Switch', onClick: switchModel }} />
 */
export const ComposerNotice = React.forwardRef<HTMLOutputElement, ComposerNoticeProps>(({ message, icon, action, tone = 'warning', className, ...rest }, ref) => (
  <output ref={ref} data-slot="composer-notice" data-tone={tone} className={cn(composerNoticeVariants({ tone }), className)} {...rest}>
    {icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
    <span className="min-w-0 flex-1">{message}</span>
    {action ? (
      <Button type="button" variant="outline" buttonSize="sm" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null}
  </output>
));
ComposerNotice.displayName = 'ComposerNotice';
