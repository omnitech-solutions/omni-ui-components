import * as React from 'react';

export interface AppProps {
  children?: React.ReactNode;
}

export const App = ({ children }: AppProps) => <>{children}</>;
