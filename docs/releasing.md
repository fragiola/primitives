# Releasing

Adapted from Dockable's runbook (fragiola/dockable, `docs/releasing.md`), same author and licence.

Releasing is a merge. [Changesets](https://changesets.dev) versions every package under
`packages/` together (one `fixed` group, `@fragiola/*`, so they always share a version) and writes
their changelogs:

| package | folder | published from |
| --- | --- | --- |
| `@fragiola/primitives` | `packages/primitives` | the package folder (`files`: `dist`, README, LICENSE, CHANGELOG), `publishConfig.exports` |
| `@fragiola/primitives-react` | `packages/react` | the same |
| `@fragiola/primitives-vue` | `packages/vue` | the same |
| `@fragiola/primitives-angular` | `packages/angular` | its build output: `publishConfig.directory` is `dist`, ng-packagr's output (`fesm2022/`, `types/`, one secondary entry point per component) with the manifest `scripts/publish-manifest.ts` writes there |

The release workflow, [`.github/workflows/release.yml`](../.github/workflows/release.yml),
publishes them with pnpm through npm **trusted publishing** (OIDC, with provenance): there is no
npm token anywhere.

On every push to `main` the workflow does one of three things:

- **changesets are pending:** it opens or updates the **Version Packages** PR, which bumps the
  versions, writes the `CHANGELOG.md` files and deletes the changesets;
- **no changeset, and `main`'s version is not on npm** (the Version Packages PR was just merged):
  it builds the packages, packs them with pnpm (`changeset pack`), checks those tarballs
  (`scripts/check-package.ts --tarballs`: dist-only exports, every subpath, publint, attw, each
  adapter's exact pin of the core, a scratch smoke app per framework), publishes those very
  tarballs from the `npm` environment, then pushes the git tags (`@fragiola/primitives@0.1.0`, …)
  and creates the GitHub releases;
- otherwise nothing.

Packing and publishing always go through pnpm: it applies `publishConfig` (the dist-only
`exports`, the Angular package's `directory`) and replaces `workspace:*` with the core's exact
version; npm does neither. Never publish with `npm publish`.

## The first release (0.1.0)

npm can only trust a publisher for a package that already exists, so the first publish is a manual
`0.0.0` stub of the four packages. Do these steps in order, once. Steps 1 to 5 come **before**
merging the PR that adds this runbook (the release PR, Epic #116): its merge starts the release.

1. **The scope.** Done: the npm scope `@fragiola` exists (Dockable publishes there). Your npm
   account owns it (`npm org ls fragiola`) and has 2FA enabled.

2. **Let the workflow open PRs.** Done (2026-11-25): *Settings → Actions → General → Workflow
   permissions → Allow GitHub Actions to create and approve pull requests* is enabled on this
   repository. Without it, the workflow cannot open the Version Packages PR.

3. **The `npm` environment.** Done (2026-11-25): the repository environment `npm`, its
   deployment branches limited to `main`. The publish job runs in this environment, and npm trusts
   only a run of `release.yml` in it, so a run from any other branch cannot publish.

4. **The stub.** From a clean checkout of `main` (without the release PR), with the four packages
   at `0.0.0`:

   ```sh
   git switch main && git pull && git status   # clean, up to date
   pnpm install --frozen-lockfile
   pnpm --filter "./packages/*" build
   pnpm --filter "./packages/*" publish --access public --dry-run   # what would be published
   pnpm --filter "./packages/*" publish --access public
   ```

   The build is required: it writes every package's `dist`, and the Angular package is published
   from `packages/angular/dist` (ng-packagr, then `scripts/publish-manifest.ts`), not from its
   folder. pnpm asks for your 2FA code. It publishes the core first, then the three adapters, each
   depending on the core at exactly `0.0.0`.

   The dry run was checked on `main` at `06c818f` (2026-11-25, pnpm 12.21.0): it lists
   `@fragiola/primitives@0.0.0` (191 files: `dist/`, README, LICENSE, `package.json`),
   `@fragiola/primitives-angular@0.0.0` (289 files: `fesm2022/` and `types/` with the root, the
   `/internal` entry and one secondary entry point per component, README, LICENSE, the
   `dist/package.json` manifest), `@fragiola/primitives-react@0.0.0` (578 files) and
   `@fragiola/primitives-vue@0.0.0` (543 files), no source file in any. `pnpm check:package`
   checks the same tarballs.

5. **The trusted publishers.** With npm 11.15 or later (`npm --version`; `npm install -g
   npm@latest` updates it) and your account's 2FA, for each package:

   ```sh
   npm trust github @fragiola/primitives --file release.yml --repo fragiola/primitives --environment npm --allow-publish
   npm trust github @fragiola/primitives-react --file release.yml --repo fragiola/primitives --environment npm --allow-publish
   npm trust github @fragiola/primitives-vue --file release.yml --repo fragiola/primitives --environment npm --allow-publish
   npm trust github @fragiola/primitives-angular --file release.yml --repo fragiola/primitives --environment npm --allow-publish
   ```

   `--allow-publish` is required: since 2026-09-03 a trusted publisher only gets staged publishing
   unless `npm publish` is allowed explicitly, and Changesets does not do staged publishing.
   `npm trust list <package>` shows the configuration. The repository, the filename and the
   environment are all part of it: never rename `release.yml` or its `npm` environment.

6. **Merge the release PR.** Its push to `main` runs the release workflow, which opens the
   **Version Packages** PR (`changeset-release/main`): the four packages at `0.1.0` (the pending
   changesets, all `minor`), four changelogs. The site rebuilds on this merge, so from now on its
   installation page says to install the packages while npm has only the `0.0.0` stub: go straight
   on to step 7.

7. **Merge the Version Packages PR.** A PR opened with the workflow's token starts no other
   workflow, so CI does not run on it by itself: close and reopen the PR (or run *CI* on its
   branch from the Actions tab) to get the checks, then merge it. The release workflow publishes
   `0.1.0` with provenance. Merge nothing else until that run is over (see *While a release
   runs*). Then check the four packages on npm (`0.1.0` is `latest`, with provenance), the four
   tags and the four GitHub releases.

8. **Lock it down.** On npm, for each package, *Settings → Publishing access*: **Require
   two-factor authentication and disallow tokens**. From now on only the workflow publishes (and
   you, interactively with 2FA, if ever needed).

## Later releases

- **Every PR that changes what a package ships** adds a changeset: `pnpm changeset`, pick the bump
  and write the summary for the changelog (what changed and, for a break, how to update). Commit
  the `.changeset/*.md` file with the PR. "What a package ships" is `changedFilePatterns` in
  `.changeset/config.json`: its `src`, `package.json`, `README.md`, `LICENSE`, the build configs
  (`tsdown.config.ts`, `ng-package.json`, the Angular entry points' `ng-package.json`) and
  `scripts/publish-manifest.ts`. A PR that touches only tests, specs, docs, fixtures, examples,
  the conformance suite, the site or the tooling needs none. CI's *Changesets* job fails a PR that
  should have one (the Version Packages PR is skipped).
- **The bump.** The packages are one `fixed` group: a changeset for any of them bumps them all.
  While the library is `0.x`, a breaking change is a `minor` (`0.1` → `0.2`), anything else a
  `patch`.
- **Releasing.** Merging such PRs keeps the Version Packages PR up to date. Merge it when you want
  to release (re-trigger its CI first, as in step 7). Never bump the versions or edit the
  changelogs by hand. `pnpm changeset status --verbose` shows what the next release contains.
- **Possible improvement.** The Version Packages PR would get its CI by itself if the version job
  pushed with a GitHub App's token (the `github-token` input of `changesets/action/version`)
  instead of the workflow's. That needs an App installed on the repository and its key as a
  secret.

## Adding a package

A new framework package (`packages/svelte` as `@fragiola/primitives-svelte`, if D2 is ever
reopened) needs nothing in the release workflow: it builds and packs `./packages/*`, and the
`fixed` group of `.changeset/config.json` is `@fragiola/*`, so the new package is versioned with
the others from its first release. What it does need:

1. **In the PR that adds it:** the package at version `0.0.0`, depending on the core with
   `workspace:*` (published as the exact version); its entry in `ADAPTERS` in
   `scripts/check-package.ts` with its smoke app (`check:package` fails on a package under
   `packages/` that is neither the core nor listed); and a changeset that names it, so the
   Version Packages PR brings it to the family's next version.
2. **Before merging that PR, the stub.** npm trusts a publisher only for a package that exists, so
   publish the new package once by hand at `0.0.0`, as in step 4 of *The first release*, but for
   that package only, from a clean checkout of the PR's branch, with 2FA:
   `pnpm --filter @fragiola/primitives-svelte build`, then
   `pnpm --filter @fragiola/primitives-svelte publish --access public` (`--no-git-checks` off
   `main`). A package published from its build output (`publishConfig.directory`, as the Angular
   one) is published from that directory, with the manifest its build writes there.
3. **Its trusted publisher,** as in step 5: `npm trust github @fragiola/primitives-svelte --file
   release.yml --repo fragiola/primitives --environment npm --allow-publish`.
4. **After its first release,** lock it down as in step 8.

Without steps 2 and 3, the first publish of the new package fails with `E404` or `ENEEDAUTH`
while the others publish: the release is then half published (see *When a publish fails*).

## While a release runs

From the merge of the Version Packages PR until its *Release* run has finished, merge nothing
else. Each push to `main` starts its own run, and each run decides on its own: a PR merged in the
meantime with no changeset would also be in publish mode, and could publish the same version from
a different commit. The publish of one commit is never cancelled by a later push.

## When a publish fails

After a failed publish, `main` holds the bumped version (say `0.2.0`) and no changeset, and npm
lacks that version for one package or more. The release workflow publishes it on the next run
**that finds no changeset on `main`**, so:

- **The cause was outside the repository** (npm down, a trusted publisher or the `npm`
  environment misconfigured): fix that, then open the failed run of *Release* and choose *Re-run
  all jobs* (possible for 30 days). Its select-mode job computes the plan again: only what npm
  lacks.
- **The cause is in the repository** (a build or the tarball check fails): fix it in a PR that
  **adds no changeset**. Its merge leaves `main` with no changeset, so that run publishes the
  bumped version, fix included. CI's *Changesets* job fails on that PR when it touches a package's
  shipped files; that is expected here, and the check is not required: merge it anyway. Do not
  add an empty changeset (`pnpm changeset --empty`) to quiet it: any changeset on `main` stops the
  publish, and an empty one releases nothing.
- **Until the stuck version is out, merge no PR that adds a changeset.** It would turn the next
  run into a version run, which bumps past the stuck version (`0.2.1`), and that version would
  never be published. If that is what you want (give up on the stuck version), deprecate whatever
  part of it reached npm (below) and release the next one.
- **Half published** (the core is on npm, an adapter is not): any of the above publishes the
  rest. Changesets skips a version npm already has; the failed run already pushed the tags and
  created the releases of what it did publish.
- **Published, but a tag or a release is missing** (the run failed after npm): the workflow will
  not publish again, so create them by hand: the tag `<package>@<version>` on the commit the
  publish ran from, and a GitHub release from it with the changelog's section.
- **`ENEEDAUTH`, `E404` or `E403` on publish:** the trusted publisher does not match the run.
  Check `npm trust list <package>`: the repository `fragiola/primitives`, the file `release.yml`,
  the environment `npm`, publishing allowed. The packages' `repository.url` must point to this
  repository (it does: `git+https://github.com/fragiola/primitives.git`).
- **A broken version went out:** npm versions cannot be reused. Deprecate it
  (`npm deprecate @fragiola/primitives@<version> "<why>"`, the same for each adapter) and release a
  fix with a new changeset.
