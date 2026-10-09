import {
  Collapse,
  type CollapseItem,
  type CollapseProps,
} from '@oc-tech/omni-ui-components/Collapse';
import { Descriptions } from '@oc-tech/omni-ui-components/Descriptions';
import { Flex } from '@oc-tech/omni-ui-components/Flex';
import { Tag } from '@oc-tech/omni-ui-components/Tag';
import { useState } from 'react';
import type { Variant } from '../internal/support/makeFactory';

// The examples below are written exactly as a consumer writes them. The docs "Show code" of each story is read
// from this file, so the code shown is the code that runs.

/** A service as the caller keeps it: its own fields, turned into a `CollapseItem` where it is drawn. */
export interface Service {
  id: string;
  name: string;
  owner: string;
  region: string;
  uptime: string;
  pinned?: boolean;
}

export const services: Service[] = [
  { id: 'api', name: 'API', owner: 'Platform team', region: 'eu-west-1', uptime: '99.98%' },
  {
    id: 'search',
    name: 'Search',
    owner: 'Discovery team',
    region: 'us-east-1',
    uptime: '99.91%',
    pinned: true,
  },
  { id: 'mail', name: 'Mail', owner: 'Messaging team', region: 'eu-west-1', uptime: '99.99%' },
];

/** One service as one item: a `description` under the label, a `Tag` in `extra`, labelled values in the body. */
export const toServiceItem = (service: Service): CollapseItem => ({
  key: service.id,
  label: service.name,
  description: `${service.owner} · ${service.region}`,
  extra: <Tag variant="filled">{service.uptime}</Tag>,
  children: (
    <Descriptions
      columns={1}
      size="small"
      bordered={false}
      items={[
        { label: 'Owner', children: service.owner },
        { label: 'Region', children: service.region },
      ]}
    />
  ),
});

/** Build `<Collapse>` props for tests. */
export const collapsePropsFactory = (overrides: Partial<CollapseProps> = {}): CollapseProps => ({
  items: services.map(toServiceItem),
  ...overrides,
});

export const collapseVariants: Variant<CollapseProps>[] = [
  { name: 'Default', args: {} },
  { name: 'Small', args: { size: 'small' } },
  { name: 'Accent', args: { tone: 'accent' } },
  { name: 'One open at a time', args: { accordion: true } },
];

/** One group, each header with a quiet second line and a `Tag` at its end. */
export const ServicesGroup = () => (
  <Collapse items={services.map(toServiceItem)} defaultActiveKey="api" />
);

/** `size="small"` for a narrow column. */
export const ServicesSmall = () => (
  <Flex vertical style={{ width: 320 }}>
    <Collapse size="small" items={services.map(toServiceItem)} />
  </Flex>
);

/** One group a service, so each is its own box; `tone="accent"` marks the pinned one. The open keys are the caller's. */
export const ServiceCards = () => {
  const [open, setOpen] = useState<string[]>(['search']);
  return (
    <Flex vertical gap={8} style={{ width: 320 }}>
      {services.map((service) => (
        <Collapse
          key={service.id}
          size="small"
          tone={service.pinned ? 'accent' : 'default'}
          items={[toServiceItem(service)]}
          activeKey={open.includes(service.id) ? [service.id] : []}
          onChange={(keys) =>
            setOpen((before) =>
              keys.length > 0 ? [...before, service.id] : before.filter((id) => id !== service.id),
            )
          }
        />
      ))}
    </Flex>
  );
};
