import { registerFixtures } from './storySupport';
import * as factories from './Table.factories';

registerFixtures(factories as unknown as Record<string, unknown>);

export * from './Table.factories';
