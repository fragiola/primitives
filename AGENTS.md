# Fragiola Primitives

A library of **headless, accessible UI primitives** (Dialog, Tabs, Menu, Combobox, Calendar, ...)
that ships **the same catalog with the same behaviour in React, Vue and Angular**. It ships
behaviour, accessibility and composable parts; it ships **no CSS, no icons and no text**. Styling
belongs 100% to the consumer.

The maintainer's decisions are in [`docs/handoff.md`](docs/handoff.md) (D1–D10, the behaviour
table §3, the tree-shaking rules §4, the stages §5) and the survey in
[`docs/catalog.md`](docs/catalog.md). They are not reopened. Every other Fragiola rule comes from
the guidelines (`../guidelines`, the `fragiola-ecosystem` skill); this file wins for this project.

| workspace | name | contains | depends on |
| --- | --- | --- | --- |
| `spec/` | (docs) | the source of truth: one spec per component (anatomy, API, states, keyboard, focus, scenarios), and the per-framework API mapping (`spec/README.md`) | |
| `packages/primitives` | `@fragiola/primitives` | the framework-free **DOM toolkit**, one entry per mechanism (`/overlay`, `/positioning`, `/focus`, `/date`, ...) | `@floating-ui/dom` only |
| `packages/react` | `@fragiola/primitives-react` | the React primitives, one entry per component (`/dialog`, `/tabs`) | the toolkit (exact version); peer `react`, `react-dom` ^19 |
| `packages/vue` | `@fragiola/primitives-vue` | the Vue primitives, one entry per component | the toolkit (exact version); peer `vue` ^3.5 |
| `packages/angular` | `@fragiola/primitives-angular` | the Angular standalone directives, one ng-packagr secondary entry point per component | the toolkit (exact version); peer `@angular/core` ^22 |
| `fixtures/<framework>` | private | one app per framework, rendering every spec scenario at `/<component>/<scenario>` with the recipes, in the browser and on a server (`src/server/entry-server`, `build:ssr`) | the framework package, the recipes |
| `conformance` | private | the Playwright suite: behaviour (with axe), contract, visual and ssr layers, run against every fixture (the ssr layer against its server render, `conformance/src/ssr-server.ts`) | |
| `examples/shared` | `examples-shared`, private | the styling layer (recipes keyed on `data-*`, the five example themes), the examples' metadata, the embed protocol, the manifest builder, the overlay promotion, every examples Playwright spec | no framework |
| `examples/<framework>` | private | the site's examples, one embed app per framework | the framework package |
| `site` | private | the site export (`export.ts`, `contract.ts`, `dev.ts`, `dev-proxy.ts`), the pages of fragiola.com/primitives, the repository's script tests | |

## Non-negotiable rules

Do not "fix" these. A change that breaks one is a decision for the maintainer.

1. **Native primitives, not core + adapters (D3).** This library is the Fragiola exception to
   principles 1–2 (`../guidelines/architecture/native-primitives.md`). There is **no model API**
   (`run/can/check/get/is`), **no command bus** and **no stateful core**. What is shared is a spec
   per component, the framework-free DOM toolkit, the styling layer of the examples and tests, and
   one conformance suite. Each framework package is a **native implementation** that owns its
   components' state, lifecycle and API, in that framework's idioms. Never move component logic
   into a shared package to "remove duplication": the duplication is the design.
2. **The toolkit boundary.** `@fragiola/primitives` holds framework-free DOM behaviours and pure
   math only: functions and small classes that take elements and options and return values or a
   cleanup (the overlay session, layers, focus, scroll lock, inert, positioning, collection key
   maps, typeahead, presence, pointer drags, hover intent, range math, form bridges, ids,
   direction, dates, image loading, swipes, a scroll area's measurement, page ranges, a clipboard write, a carousel's scrolling and rotation delay, the color model, a command palette's scorer, a cascading select's levels, a drop target for files and a file upload's checks). It never holds a component's open/selected/value state, its lifecycle or
   its API; it never imports a framework; it never touches the global `document` or `window`
   (only an element's `ownerDocument` / `defaultView`); it has no top-level side effects and no
   `any` in its exported declarations; its **only runtime dependency is `@floating-ui/dom`**
   (the positioning entry). `packages/primitives/tests/guard.test.ts` enforces it. A new runtime
   dependency in any published package is the maintainer's decision.
3. **The behaviour rule (D4): APG first. Where the WAI-ARIA APG has no rule, follow Base UI.**
   The decided differences are `docs/handoff.md` §3; a new difference is decided the same way
   and written in the component's spec with its reason.
4. **The scope rule (D5): behaviour only.** Markup-and-CSS components (Card, Badge, Alert,
   Skeleton, Kbd, Spinner, Empty, ...) belong to Fragiola UI. Components that already have a
   Fragiola library stay there: Tree (`@fragiola/tree`), Splitter (`@fragiola/splitter`), Table,
   GridList and Grid (`@fragiola/data-grid`), drag and drop (`@fragiola/dnd`).
5. **The spec is the source of truth, the conformance suite the referee (D6).** A behaviour
   change starts as a spec change (with its reason), then the tests, then the three
   implementations. A component is done only when React, Vue and Angular all pass its
   conformance layers. A test is never weakened or written for one framework; the visual layer
   has **one golden set, made by React in CI**: fix a framework's DOM, never the snapshots.
6. **Tree-shaking is a hard requirement (D8).** An app that uses two components gets only those
   two and the toolkit code they import.
   - ESM only, `"sideEffects": false` in every package, no top-level side effects in any module.
   - **One entry per component** in every framework package (`@fragiola/primitives-react/dialog`)
     and **one per mechanism** in the toolkit (`@fragiola/primitives/overlay`), plus a root entry
     that **only re-exports**; importing from the root tree-shakes to the same output.
   - No registry, plugin or provider that references every component: no Vue `app.use()` plugin,
     no Angular NgModule of every directive (standalone directives, one ng-packagr secondary entry
     point per component); global providers (direction, locale) live in their own entries. The
     entries that are no component (`scripts/components.ts` `UTILITIES`: `/direction`, `/render`)
     hold no component's code, which the bundle guard checks.
   - A component imports only the toolkit mechanisms it uses; heavy optional parts (time zones,
     calendar systems, virtualization) stay out of the components that do not need them.
   - The **bundle guard** (`scripts/check-bundle.ts`, run by `pnpm build` and in CI) builds a
     fixture app per framework importing two components and fails when any other component's code
     or an unused mechanism is in its output; it then reads every component entry of the built
     packages alone (its chunks and the entries it imports, through their source maps) and fails
     when one holds another component's code, but the ones it is built on (`ENTRY_DEPENDENCIES`:
     Field, Checkbox's group, the calendars); tests plant imports and see them fail.
     `pnpm size` keeps the per-entry size report in `docs/size.md` (`--check`: minified sizes
     exact, gzip sizes within a small tolerance, since Node's zlib is not pinned), and fails when a
     date entry is over its budget (`scripts/size-budgets.ts`, Epic #88).
7. **The primitive contract** (`../guidelines/components/primitives.md`, with this library's
   decisions in [`docs/decisions.md`](docs/decisions.md)):
   - one namespace per component (`Dialog.Root`, `Dialog.Trigger`, ...; Angular: standalone
     directives `[dialogRoot]`, ...);
   - `render`, never `asChild` (`render={<section />}` merges the part's props into the element,
     `render={(props, state) => ...}` receives them plus the state); each framework expresses it,
     and `class` / `style` as functions of the state, refs and controlled state, as the API
     mapping table of `spec/README.md` says;
   - `ref` is a plain prop (React 19); arbitrary props are forwarded; handlers compose internal
     first, then the consumer's;
   - inline style is structural only (position, size, `display`, transforms for positioning,
     CSS variables a recipe reads); nothing cosmetic;
   - state only through `data-*` and ARIA, Base UI-style names (`data-open`, `data-selected`,
     `data-highlighted`, `data-popup-open`, `data-starting-style`, ...); a boolean `data-*` is
     present or absent, never `"false"`;
   - **every element carries `data-primitives-part="<component>-<part>"`** (`"dialog-popup"`,
     `"tabs-tab"`), so selectors and tooling never depend on class names;
   - **no text and no accessible names**: primitives render only their children and set no
     `aria-label` of their own (the recorded exception: a calendar's locale data from `Intl`,
     which the consumer can replace);
   - sides are logical: Base UI's `inline-start` / `inline-end`, plus the physical `left` /
     `right`; `loopFocus`; `data-popup-open` on triggers (D4, §3 "Naming").
8. **No Fragiola model API in the components.** Components use controlled and uncontrolled state:
   `value` / `defaultValue` / `onValueChange` in React, `v-model:<prop>` in Vue, a two-way
   `[(prop)]` binding in Angular (an `input()` with its `*Change` output, the shape of a `model()`
   input; a plain input plus output where a one-way binding must stay controlled, since `model()`
   writes its own value), as `spec/README.md` maps it. Only React takes `className` / `style` as
   functions of the state; Vue and Angular style state through `data-*`, the `render` slot or the
   part's `state()` (`exportAs`).
9. **Dates** are a plain `{ year, month, day }` value with no time zone; no external date library:
   the date math is the toolkit's `/date` entry, the locale comes from `Intl`.
10. **Releasing is a merge (Epic #116).** `.github/workflows/release.yml` opens the Version
    Packages PR, and merging it publishes the four packages with pnpm through npm trusted
    publishing (OIDC, no token). After the maintainer's first `0.0.0` stub, nobody but that
    workflow publishes; never `npm publish`, never a version bump or a changelog by hand
    ([`docs/releasing.md`](docs/releasing.md); `site/tests/ci-workflow.test.ts` checks both
    workflows). fragiola.com is told about every push to `main` (the www trigger, Epic #17); the
    registration in `../www/projects.json` is fragiola/www's own Epic.

## Decisions

The guideline gaps of this domain were decided on 2026-11-21 (Epic #5, Issue #2) and written in the
guidelines: the pattern page `../guidelines/architecture/native-primitives.md`, and rows of
`../guidelines/decisions.md` (`library-pattern`, `np-*`). [`docs/decisions.md`](docs/decisions.md)
mirrors every row: the part attribute, the toolkit re-export (framework packages never
`export *` the toolkit; a toolkit type in a component's API is re-exported as a type from that
component's entry), the entries, the source layout, the test layers (no playground), the examples
styling (the recipes and the five themes in `examples/shared`, not Fragiola UI), the Vue and
Angular idioms, the bundle guard, the modal overlays in the embeds, the site IA, the runtime
dependency exception and the site contract (v1.7, dev port 5191).

## Source layout

From the guidelines (`../guidelines/repository.md#source-layout`). `pnpm check` runs
`check:layout` (`scripts/check-layout.ts`, tested by `site/tests/check-layout.test.ts`), which
fails on a tracked name that is not kebab-case and on a non-entry file at the root of a package's
`src/`.

- **Every file and folder name is kebab-case**, the kebab-case of its main export
  (`DialogPopup` → `dialog-popup.tsx`); tool suffixes stay (`.test.ts`, `.d.ts`,
  `.directive.ts`); only names a tool fixes are exceptions (`README.md`, `AGENTS.md`, `LICENSE`,
  `CHANGELOG.md`, `index.html`, `package.json`).
- **A package's `src/` is never flat.** Its root holds only its entries (`index.ts`, or
  `public-api.ts` in Angular). Everything else lives in a folder named after what it holds, and a
  component has a folder of its own inside it:

  | package | folders |
  | --- | --- |
  | `primitives` | one folder per mechanism, each an entry: `positioning/`, `overlay/`, `layers/`, `focus/`, `scroll-lock/`, `inert/`, `collection/`, `presence/`, `pointer/`, `hover/`, `range/`, `form/`, `id/`, `direction/`, `date/`, `image/`, `swipe/`, `number/`, `selection/`, `virtual/`, `async-list/`, `toast/`, `scroll-area/`, `pagination/`, `clipboard/`, `carousel/`, `cascade/`, `color/`, `command/`, `file/` |
  | `react` | `components/<component>/` (its parts, its context, `parts.ts` the namespace), `hooks/`, `utils/` |
  | `vue` | `components/<component>/`, `composables/`, `utils/` |
  | `angular` | one ng-packagr secondary entry point per component, its folder organized like a `src/`: `packages/angular/<component>/` (`public-api.ts`, `ng-package.json`, `directives/`, `inject/`); the code the entries share in `packages/angular/internal/` (`utils/`, the `/internal` entry: not an app's API); `src/public-api.ts` only re-exports the components' entries. ng-packagr compiles an entry point from its own folder (a file outside fails with TS6059), as Tree's feature entries; `check:layout` also keeps an entry folder's root to `public-api.ts` and `ng-package.json` |

- **One public component, hook or function per file**, with its types beside it.
- **A primitive has the same file name in every framework** (`dialog-popup.tsx`,
  `dialog-popup.ts`, `dialog-popup.directive.ts`).
- **No barrel files inside the folders.** An entry imports each module directly.
- The toolkit's `tests/` mirrors `src/`; a test of the whole package stays at its root
  (`tests/guard.test.ts`).

## Porting a component to a framework

The checklist that carries a framework's model from one component to the next (from the POC's
`AGENTS.md`, "Porting a framework"). Before a component's port is done, check:

1. **Logic first in the toolkit**: the overlay session (`openOverlaySession`: layer, focus-out,
   focus return by reason), the key maps (`tabsKeyTarget`, `menuKeyTarget`, `submenuKeys`,
   `calendarKeyTarget`, `stepThroughNone`), positioning, focus, presence. A port writes state,
   lifecycle and the framework's API only.
2. **Focus targets** (`initialFocus`, `finalFocus`): where a framework's templates unwrap refs at
   render time, also take a getter, read when the focus moves.
3. **Element refs through wrappers**: a styled wrapper must keep a ref to the part's element
   (Vue: a stateful component, not a functional one).
4. **Children normalization**: an element's children must be what the framework expects (Vue's
   `h()` reads a single vnode as a slots object).
5. **The calendar's focus after render**: a cell that mounts after the keyboard moved to it (a new
   month, a picker opening) takes the pending focus itself; in a picker, only once its popup is a
   layer (the binding's `layered`), or an enclosing Dialog's focus trap takes it back (Epic #128).
6. **Fixture DOM identical to React's**, text nodes included: JSX splits `{label} settings` into
   two text nodes; a template that merges them changes glyph positions in CI's screenshots.
7. **Never a framework-specific snapshot or test**: fix the DOM.
8. **A key that moves focus renders before the next key**: opening a menu level, closing one, or
   moving a calendar's focus into another month must reach the DOM within the event (React does;
   zoneless Angular renders later, so its overlays and grid call `ApplicationRef.tick()`), or a
   quick second key reaches the old element.

Gotchas worth keeping:

- Tailwind v4's `outline-hidden` sets `--tw-outline-style: none`, which `outline-2` reads: a focus
  ring states `outline-solid` together with `outline-2` (`FOCUS_RING` in the recipes).
- Vue's event invoker skips events whose timestamp is older than the handler under a fixed test
  clock (Playwright's `page.clock`): parts that must react under it use native listeners.
- Golden screenshots are made in CI only, in Playwright's image (local fonts differ): the visual
  layer is skipped locally unless `VISUAL=1`.

## Toolchain

| tool | version |
| --- | --- |
| Node | >= 24 |
| pnpm | 12.21.0 (`packageManager`) |
| TypeScript | 7.0.2 (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `customConditions: ["@fragiola/source"]`) |
| TypeScript 6.0.x | only in the Angular workspaces (`@angular/compiler-cli` 22 peers `>=6.0 <6.1`) and for `vue-tsc` |
| React / Vue / Angular | 19.3 / 3.5 / 22.2 (standalone, signals, zoneless) |
| tsdown | toolkit, React and Vue builds (multi-entry); ng-packagr 22 for Angular |
| Vite / Vitest / Playwright | 8 / 5 / 1.65 (Chromium) |
| Tailwind CSS | 4.3 (fixtures and examples only) |
| Biome | 2.6 |
| Changesets | 3 (`fixed` group `@fragiola/*`) |

Pin dependencies to exact versions published at least 7 days ago (`npm view <pkg> time`).

## Scripts

| script | does |
| --- | --- |
| `pnpm check` / `check:fix` | Biome lint and format, then `check:layout` |
| `pnpm typecheck` | every workspace's `typecheck` |
| `pnpm test` | Vitest: the toolkit, the framework packages, the fixtures, the examples, the site |
| `pnpm build` | every workspace's `build`, then `check-dts` (no `any` in the declarations) and the bundle guard |
| `pnpm conformance` | the conformance suite (`--project react|vue|angular`) |
| `pnpm e2e` | the conformance suite, then every examples app's Playwright suite |
| `pnpm dev` | every fixture's dev server (`--framework vue` for one) |
| `pnpm site:export` / `site:dev` | the site export (`--base /primitives`), the embeds with hot reload on port 5191 |
| `pnpm check:package` | pack, check every `exports` subpath, `publint`, `attw --profile esm-only`, the toolkit's exact pin, a scratch app per framework (installed and built with the pinned pnpm, `pnpm dlx pnpm@<version>` when the machine's differs); `node scripts/check-package.ts --tarballs <dir>` checks the tarballs in `dir` instead of packing, which the release workflow does on what `changeset pack` wrote |
| `pnpm size` | the per-entry size report (`docs/size.md`; `--check` fails when it is stale); both fail when a date entry is over its budget (`scripts/size-budgets.ts`) |
| `pnpm changeset` | Changesets: a changeset for a PR that changes what a package ships |
| `pnpm release:version` | `changeset version`: bumps every package and writes their `CHANGELOG.md`. Only the release workflow runs it (the Version Packages PR) |

## CI

`.github/workflows/ci.yml` (its comment header describes every job) runs its tests on pull requests
and on a manual run: **Checks** (`pnpm check`, `typecheck`, `test`, `build`, `size --check`), **Package**
(`pnpm check:package`), **Changesets** (a PR that changes what a package ships needs a changeset;
skipped for `changeset-release/*`), **Changes**, **Conformance** (one job per framework),
**E2E** (one job per examples app) and **Site export** (`--base /primitives`). A push to `main`
runs only **Trigger www build**: a `repository_dispatch` `project-updated` (slug `primitives`) to
`fragiola/www`, with the `WWW_DISPATCH_TOKEN` secret (an organization secret the maintainer shares
with this repository); without the secret the step is skipped, not failed.

- A `Changes` job picks the suites a pull request can affect (`scripts/e2e-suites.ts`, a `git diff`
  against the base, tested by `site/tests/e2e-suites.test.ts`): none for docs only
  (`site/docs/**`, `*.md`, `AGENTS.md`); `packages/<framework>`, `fixtures/<framework>` or
  `examples/<framework>`: that framework's conformance and examples suites; any other path, and a
  manual run: every suite. It is an allow-list of what may skip: a new rule names what it skips,
  never what it runs.
- Every Playwright job runs in `mcr.microsoft.com/playwright:v<version>-noble` (`--user 1001`),
  its tag the exact pinned `@playwright/test`, with no `playwright install`
  (`site/tests/ci-workflow.test.ts`): upgrading Playwright changes both in the same PR.
- The golden screenshots are written by React's conformance job when missing and uploaded as the
  `conformance-snapshots` artifact; they are reviewed and committed from it
  (`conformance/README.md`). Vue and Angular run with `--update-snapshots none`.
- CI publishes nothing. `.github/workflows/release.yml` (adapted from Dockable's) runs on every
  push to `main`, in `fragiola/primitives` only: pending changesets open or update the Version
  Packages PR (`changeset-release/main`, which CI's Changesets job skips); with none, and a
  version npm lacks, it builds, packs (`changeset pack`), checks those tarballs
  (`check-package.ts --tarballs`) and publishes them from the `npm` environment (deployments from
  `main` only), then pushes the tags and the GitHub releases. Never rename the file or the
  environment: npm's trusted publishers name both. Its actions are pinned by commit, it grants no
  permission by default and an OIDC token to the publish job only. The Version Packages PR gets
  no CI by itself (the workflow's token starts no workflow): close and reopen it before merging
  (`docs/releasing.md`).
- Pushing a change under `.github/workflows/` needs the `workflow` scope, or a push over SSH (this repository's `origin`).

## Provenance

- **The POC** (`~/organizations/me/pocs/poc-cross-framework-primitives`, repo
  `maurodesouza/poc-cross-framework-primitives`) is the maintainer's own code (D9): its specs,
  `@poc/dom` (now `@fragiola/primitives`), framework packages, recipes, fixtures and conformance
  suite are moved over and adapted. Read it from `origin/main` only (`git show origin/main:<path>`,
  `git archive origin/main`); never switch, pull or commit in its checkout. Its Svelte and Solid
  packages, its baseline fixture and its playground are not ported.
- **Fragiola projects** (`../tree`, `../splitter`, `../dockable`, `../ui`) are the same author's:
  code reused from one starts with `// Adapted from <project> (fragiola/<repo>, <path>), same author
  and licence.`
- **References** (`~/organizations/fragiola/references/*`: Base UI, Radix, React Aria, Zag, Ark,
  Reka UI, Bits UI, Kobalte, Angular CDK, Spartan, the APG, ...) are **read-only and never copied**.
  They inspire behaviour; the code is written here.

## Conventions

- Biome: 4-space indent, double quotes, LF, organized imports.
- Commits: gitmoji-conventional with a scope and the issue number
  (`✨ feat(react): ... (#4)`, `🐛 fix(primitives): ...`, `✅ test(conformance): ...`,
  `🔧 chore: ...`, `📝 docs(spec): ...`, `👷 ci: ...`).
- Branches `<type>/epic-<n>-<short-description>`; worktrees under `.worktrees/`.
- Code, docs, issues, pull requests and commit messages in English.
- Every rule a reviewer would otherwise have to remember is a test (guard tests, contract tests,
  the bundle guard, docs-reference tests, the examples import test).
- Every PR that changes what a package ships carries a changeset.
