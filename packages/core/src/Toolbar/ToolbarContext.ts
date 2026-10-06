import * as React from 'react';

import type { ToolbarSize } from './Toolbar.types';

/** The size a Toolbar hands to the controls inside it. `undefined` outside a Toolbar. */
export const ToolbarSizeContext = React.createContext<ToolbarSize | undefined>(undefined);

/** Read the enclosing Toolbar's control size (`undefined` when not inside a Toolbar). */
export const useToolbarSize = (): ToolbarSize | undefined => React.useContext(ToolbarSizeContext);
