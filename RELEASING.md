# Releasing

Publishing is done by the owner with their own npm credentials. Nothing here is run by CI or by an agent.

1. Merge the release PR into the release branch, then into `master`. Check out `master` and pull.
2. Confirm the version in `packages/core/package.json` (currently `0.1.0`) and that `CHANGELOG.md` has a matching entry.
3. Run the gate and inspect the tarball:

   ```sh
   pnpm install
   pnpm verify
   cd packages/core && pnpm pack --pack-destination /tmp/pack && tar -tzf /tmp/pack/oc-tech-omni-ui-components-0.1.0.tgz && cd ../..
   ```

   It must contain `dist/`, `dist-types/`, `dist/styles.css` and `README.md`.
4. Publish (after the PR merges):

   ```sh
   pnpm --filter @oc-tech/omni-ui-components publish --access public
   ```

   `prepublishOnly` runs typecheck and build first.
5. Tag and push:

   ```sh
   git tag v0.1.0
   git push origin v0.1.0
   ```
