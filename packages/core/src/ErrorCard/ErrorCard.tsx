import { cn } from 'lib/utils';
import * as React from 'react';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import type { ErrorCardProps, ErrorItem } from './ErrorCard.types';
import { errorCardVariants } from './ErrorCard.variants';

/**
 * Omni ErrorCard: a failed reply as a card (`role="alert"`: icon, title, message, a reassurance `note`, a Retry
 * button and any extra `actions`), or, with `variant="stopped"`, the quiet one-line Stopped banner (`role="status"`).
 * Retry appears when `onRetry` is set. Titles per error code belong to the caller; this draws what it is given.
 *
 * Slots: `data-slot="error-card" | "error-card-title" | "error-card-message" | "error-card-retry" | "error-card-actions"`.
 *
 * @example
 * <ErrorCard icon={<CircleAlert />} title="The model took too long" message={error.message}
 *   note="Your message is saved and nothing has been applied." onRetry={retry} retryIcon={<RefreshCw />} />
 * <ErrorCard variant="stopped" icon={<CircleStop />} title="Stopped. Nothing has been applied." />
 */
const ErrorCardImpl = React.forwardRef<HTMLDivElement, ErrorCardProps>(
  (
    {
      variant = 'error',
      error,
      title: titleProp,
      message: messageProp,
      note: noteProp,
      icon,
      onRetry,
      onDismiss,
      dismissLabel = 'Dismiss',
      dismissIcon,
      retryLabel = 'Retry',
      retryIcon,
      retryDisabled,
      actions,
      className,
      ...rest
    },
    ref,
  ) => {
    const title = titleProp ?? error?.title;
    const message = messageProp ?? error?.message;
    const note = noteProp ?? error?.note;
    // The item handed to callbacks: the host's own object when given (by reference), else one built from the props.
    const item = error ?? ({ id: 'error', title, message, note } as ErrorItem);
    const iconNode = icon ? (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex flex-none',
          variant === 'error'
            ? 'mt-px text-[color:var(--oui-tone-danger-fg)] [&_svg]:size-5'
            : '[&_svg]:size-4',
        )}
      >
        {icon}
      </span>
    ) : null;

    if (variant === 'stopped') {
      return (
        <div
          ref={ref}
          role="status"
          data-slot="error-card"
          data-variant="stopped"
          className={cn(errorCardVariants({ variant }), className)}
          {...rest}
        >
          {iconNode}
          <span data-slot="error-card-title">{title}</span>
          {onDismiss ? (
            <IconButton
              variant="ghost"
              iconSize="sm"
              label={dismissLabel}
              data-slot="error-card-dismiss"
              icon={dismissIcon ?? <span aria-hidden="true">×</span>}
              className="flex-none"
              onClick={() => onDismiss(item)}
            />
          ) : null}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="alert"
        data-slot="error-card"
        data-variant="error"
        className={cn(errorCardVariants({ variant }), className)}
        {...rest}
      >
        {iconNode}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div data-slot="error-card-title" className="text-sm font-semibold">
            {title}
          </div>
          {message || note ? (
            <div data-slot="error-card-message" className="text-[color:var(--oui-panel-meta-fg)]">
              {message}
              {message && note ? ' ' : null}
              {note}
            </div>
          ) : null}
          {onRetry || actions ? (
            <div data-slot="error-card-actions" className="mt-2 flex flex-wrap gap-2">
              {onRetry ? (
                <Button
                  buttonSize="sm"
                  icon={retryIcon}
                  disabled={retryDisabled}
                  data-slot="error-card-retry"
                  onClick={() => onRetry(item)}
                >
                  {retryLabel}
                </Button>
              ) : null}
              {actions}
            </div>
          ) : null}
        </div>
        {onDismiss ? (
          <IconButton
            variant="ghost"
            iconSize="sm"
            label={dismissLabel}
            data-slot="error-card-dismiss"
            icon={dismissIcon ?? <span aria-hidden="true">×</span>}
            className="flex-none"
            onClick={() => onDismiss(item)}
          />
        ) : null}
      </div>
    );
  },
);
ErrorCardImpl.displayName = 'ErrorCard';

/** Generic over the item type: an extended item reaches every callback by reference. */
export const ErrorCard = ErrorCardImpl as unknown as <T extends ErrorItem = ErrorItem>(
  props: ErrorCardProps<T> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
