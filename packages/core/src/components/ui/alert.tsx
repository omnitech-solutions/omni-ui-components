import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from 'lib/utils';

const alertVariants = cva('relative mb-5 text-sm font-normal text-foreground border rounded-md leading-[1.43]', {
  variants: {
    variant: {
      info: 'bg-grey-fc border-border',
      warning: 'bg-danger/10 border-danger',
      error: 'bg-danger-light border-danger/20',
      success: 'bg-primary/10 border-primary',
      loading: 'bg-grey-fc border-border',
    },
    size: {
      default: 'p-4 pl-12',
      sm: 'py-2.5 px-4 pl-12',
    },
  },
  defaultVariants: {
    variant: 'info',
    size: 'default',
  },
});

const alertNoIconVariants = cva('', {
  variants: {
    size: {
      default: 'pl-5',
      sm: 'pl-4',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export type AlertVariant = 'info' | 'warning' | 'error' | 'loading' | 'success';
export type AlertSize = 'default' | 'sm';

export type AlertProps = {
  variant?: AlertVariant;
  size?: AlertSize;
  icon?: React.ReactNode | null;
  title?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const Alert = forwardRef<HTMLDivElement, AlertProps>((props, ref) => {
  const { variant = 'info', size = 'default', icon, title, className, children } = props;

  const isLoading = variant === 'loading';
  const hasIcon = isLoading || (icon !== undefined && icon !== null);

  const role = variant === 'warning' || variant === 'error' ? 'alert' : 'status';
  const ariaLive = variant === 'warning' || variant === 'error' ? 'assertive' : 'polite';

  const iconColorClass = variant === 'warning' || variant === 'error' ? 'text-danger' : variant === 'success' ? 'text-primary' : 'text-light-foreground';

  return (
    <div
      className={cn(alertVariants({ variant, size }), !hasIcon && alertNoIconVariants({ size }), className)}
      ref={ref}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
    >
      {hasIcon && (
        <>
          {isLoading ? (
            <Loader2 className="absolute left-4 top-4 size-5 opacity-50 animate-spin" aria-hidden="true" />
          ) : (
            icon &&
            React.isValidElement(icon) &&
            React.cloneElement(icon, {
              className: cn(
                'absolute left-4 top-4 size-4',
                size === 'sm' && 'top-3',
                variant === 'success' && 'left-4 top-4 size-5.5',
                iconColorClass,
                (icon.props as React.HTMLAttributes<HTMLElement>).className,
              ),
              'aria-hidden': 'true',
            } as React.HTMLAttributes<HTMLElement>)
          )}
        </>
      )}
      <div>
        {title && <div className="mb-1 text-sm font-medium">{title}</div>}
        {children}
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';

export { Alert, alertVariants };
