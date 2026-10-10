import { type TreeSelectNode, TreeSelectPrimitive } from '@oc-tech/omni-ui-components';
import type { WidgetProps } from '@rjsf/utils';
import * as React from 'react';
import type { OmniTreeOption } from '../../lib/formContext';
import { useStableRjsfCallbacks } from '../../lib/useStableRjsfCallbacks';
import { booleanOption, stringOption, treeOf, widgetField, widgetLook } from '../../lib/widgetKit';

const toNodes = (tree: OmniTreeOption[]): TreeSelectNode[] =>
  tree.map((option) => ({
    value: option.value,
    title: option.label,
    disabled: option.disabled,
    children: option.children ? toNodes(option.children) : undefined,
  }));

/**
 * `treeSelect`: a choice from a tree that opens and closes. The schema type picks the mode: a string stores one
 * node's value, an array of strings stores several. The tree is
 * `formContext.optionTrees[ui:options.optionTreeKey]`, or plain data in `ui:options.tree`.
 * `ui:options.selectableParents: false` allows leaves only; `defaultExpandAll`.
 */
export const TreeSelectWidget = (props: WidgetProps) => {
  const { value, placeholder, options, schema, required } = props;
  const { onChange } = useStableRjsfCallbacks<string | string[]>(props, (next) =>
    next.length > 0 ? next : undefined,
  );
  const tree = treeOf(props);
  const shared = {
    ...widgetField(props),
    ...widgetLook(props),
    treeData: React.useMemo(() => toNodes(tree), [tree]),
    placeholder: stringOption(options, 'placeholder') ?? (placeholder || undefined),
    selectableParents: booleanOption(options, 'selectableParents'),
    defaultExpandAll: booleanOption(options, 'defaultExpandAll'),
    allowClear: !required,
  };
  return schema.type === 'array' ? (
    <TreeSelectPrimitive
      {...shared}
      mode="multiple"
      value={Array.isArray(value) ? (value as unknown[]).map(String) : []}
      onChange={onChange}
    />
  ) : (
    <TreeSelectPrimitive
      {...shared}
      value={(value as string | undefined) ?? ''}
      onChange={onChange}
    />
  );
};
