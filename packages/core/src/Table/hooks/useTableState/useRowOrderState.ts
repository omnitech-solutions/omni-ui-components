import * as React from 'react';

export function useRowOrderState() {
  const [rowOrder, setRowOrder] = React.useState<string[]>([]);
  return { rowOrder, setRowOrder };
}
