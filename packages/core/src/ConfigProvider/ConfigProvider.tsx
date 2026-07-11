import * as React from 'react';

export interface ConfigProviderProps {
  children?: React.ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => <>{children}</>;
