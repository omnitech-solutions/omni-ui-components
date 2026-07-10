/**
 * @fileoverview
 * A process-wide registry mapping identifier → value for story fixtures.
 * A fixture module registers its exports once at module load, and any
 * `<StoryPreview>` in the same session automatically picks up the same
 * identifier → const emission without every story restating a `fixtures={}`
 * prop.
 *
 * Usage in a fixtures module:
 *
 *     import { registerFixtures } from '.../ShowCodePanel/fixtureRegistry';
 *     export const defaultColumns = […];
 *     export const projects = […];
 *     registerFixtures({ defaultColumns, projects });
 */

const registry = new Map<string, unknown>();

export const registerFixtures = (fixtures: Record<string, unknown>): void => {
  for (const [name, value] of Object.entries(fixtures)) {
    // Non-primitive values only — primitives can't be reliably matched by
    // reference and are better inlined verbatim.
    if (value !== null && (typeof value === 'object' || typeof value === 'function')) {
      registry.set(name, value);
    }
  }
};

export const getRegisteredFixtures = (): Record<string, unknown> => Object.fromEntries(registry);

// Test-only helper. The registry is module-level and never cleared during
// normal runtime (fixtures register once at module load), so tests need to
// reset it between cases to avoid leakage across files.
export const clearFixtures = (): void => {
  registry.clear();
};
