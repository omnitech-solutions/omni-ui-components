import * as React from 'react';

import { Select } from '../Select';
import type { SelectOption } from '../Select';

export interface TreeSelectNode {
  value: string;
  title: string;
  children?: TreeSelectNode[];
}

export interface TreeSelectProps extends Omit<React.ComponentProps<typeof Select>, 'options'> {
  treeData: TreeSelectNode[];
}

function flatten(nodes: TreeSelectNode[], depth = 0): SelectOption[] {
  return nodes.flatMap((node) => [
    { value: node.value, label: `${'  '.repeat(depth)}${node.title}` },
    ...flatten(node.children ?? [], depth + 1),
  ]);
}

export const TreeSelect = ({ treeData, ...props }: TreeSelectProps) => <Select {...props} options={flatten(treeData)} />;
