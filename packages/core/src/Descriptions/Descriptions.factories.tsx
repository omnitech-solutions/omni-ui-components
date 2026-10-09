import {
  type DescriptionItem,
  Descriptions,
  type DescriptionsProps,
} from '@oc-tech/omni-ui-components/Descriptions';
import { Flex } from '@oc-tech/omni-ui-components/Flex';
import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { Typography } from '@oc-tech/omni-ui-components/Typography';
import type { Variant } from '../internal/support/makeFactory';

// The examples below are written exactly as a consumer writes them. The docs "Show code" of each story is read
// from this file, so the code shown is the code that runs.

/** A release as the caller keeps it. */
export interface Release {
  version: string;
  channel: 'stable' | 'beta';
  changes: string[];
  checksum: string;
}

export const release: Release = {
  version: '4.2.0',
  channel: 'stable',
  changes: ['Faster cold start', 'Keyboard shortcuts for every menu', 'Fixes a crash on export'],
  checksum: '3f9a1c2d4e',
};

/** A value is any node: text, a `Tag`, a list of lines. */
export const toReleaseItems = (shown: Release): DescriptionItem[] => [
  { key: 'version', label: 'Version', children: shown.version },
  { key: 'channel', label: 'Channel', children: <Tag variant="filled">{shown.channel}</Tag> },
  {
    key: 'changes',
    label: 'Changes',
    children: (
      <Flex vertical>
        {shown.changes.map((change) => (
          <Typography.Text key={change}>{change}</Typography.Text>
        ))}
      </Flex>
    ),
  },
  { key: 'checksum', label: 'Checksum', children: <Tag mono>{shown.checksum}</Tag> },
];

/** Build `<Descriptions>` props for tests. */
export const descriptionsPropsFactory = (
  overrides: Partial<DescriptionsProps> = {},
): DescriptionsProps => ({
  items: toReleaseItems(release),
  columns: 1,
  ...overrides,
});

export const descriptionsVariants: Variant<DescriptionsProps>[] = [
  { name: 'One column', args: {} },
  { name: 'Titled', args: { title: 'Release' } },
  { name: 'Small', args: { size: 'small' } },
  { name: 'No box', args: { bordered: false } },
  { name: 'Small, no box', args: { size: 'small', bordered: false } },
];

/** `size="small"` in a narrow column: one column, tighter padding and gaps. */
export const ReleaseSmall = () => (
  <Flex vertical style={{ width: 320 }}>
    <Descriptions title="Release" columns={1} size="small" items={toReleaseItems(release)} />
  </Flex>
);

/** `bordered={false}`: the rows only, for use inside a part that already draws a box. */
export const ReleaseRowsOnly = () => (
  <Flex vertical style={{ width: 320 }}>
    <Descriptions columns={1} size="small" bordered={false} items={toReleaseItems(release)} />
  </Flex>
);
