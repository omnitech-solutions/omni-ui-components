import * as factories from './Table.factories';

import { registerFixtures } from './storySupport';

registerFixtures(factories as unknown as Record<string, unknown>);

export * from './Table.factories';
