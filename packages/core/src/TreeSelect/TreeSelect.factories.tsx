import type { TreeSelectNode, TreeSelectProps } from '@oc-tech/omni-ui-components/TreeSelect';

/** A consumer's own node: the library's node plus the fields the app needs back in `onChange`. */
export interface PlaceNode extends TreeSelectNode {
  code: string;
  children?: PlaceNode[];
}

export const SAMPLE_PLACES: PlaceNode[] = [
  {
    value: 'europe',
    title: 'Europe',
    code: 'EU',
    children: [
      { value: 'ireland', title: 'Ireland', code: 'IE' },
      { value: 'france', title: 'France', code: 'FR' },
    ],
  },
  {
    value: 'north-america',
    title: 'North America',
    code: 'NA',
    children: [
      {
        value: 'canada',
        title: 'Canada',
        code: 'CA',
        children: [
          { value: 'ontario', title: 'Ontario', code: 'CA-ON' },
          { value: 'quebec', title: 'Quebec', code: 'CA-QC', disabled: true },
        ],
      },
      { value: 'united-states', title: 'United States', code: 'US' },
    ],
  },
  { value: 'remote', title: 'Remote', code: 'XX' },
];

/** Build `<TreeSelect>` props for stories and tests. */
export const treeSelectPropsFactory = (
  overrides: Partial<TreeSelectProps<PlaceNode>> = {},
): TreeSelectProps<PlaceNode> =>
  ({
    id: 'demo-tree-select',
    label: 'Location',
    description: 'Where the team is based.',
    placeholder: 'Choose a place',
    treeData: SAMPLE_PLACES,
    value: 'ireland',
    layout: 'vertical',
    ...overrides,
  }) as TreeSelectProps<PlaceNode>;
