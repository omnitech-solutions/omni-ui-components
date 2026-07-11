export type AlertVariant = 'info' | 'warning' | 'error' | 'loading' | 'success';
export type AlertSize = 'default' | 'sm';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  size?: AlertSize;
  icon?: React.ReactNode | null;
  title?: React.ReactNode;
}
