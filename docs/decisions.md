# Decisions

This library's guideline decisions, recorded on 2026-11-21 (Epic #5, Issue #2). Each one is
written in the Fragiola guidelines (`../guidelines`, paths below relative to it), and this page
mirrors them. The maintainer's decisions D1–D10 are in [`handoff.md`](handoff.md); they are not
repeated here.

| topic | decision | guideline page |
| --- | --- | --- |
| Library pattern | Core + adapters is the default. This library is the second pattern, **native primitives**: a spec per component, the framework-free DOM toolkit, one native implementation per framework, a styling layer for examples and tests, one conformance suite. No model API, no command bus, no stateful core (D3). | `architecture/native-primitives.md`, `decisions.md#library-pattern` |
| Part attribute | `data-primitives-part="<component>-<part>"` on every element (`"dialog-popup"`, `"menu-item"`, `"tabs-tab"`). State stays Base UI-style (`data-open`, `data-highlighted`, `data-popup-open`, ...) under the boolean rules: present or absent, never `"false"`. The POC's `data-<component>-part` is converted during the port. | `components/primitives.md#the-primitive-contract`, `decisions.md#np-part-attribute` |
| Toolkit re-export | The framework packages **do not** `export *` the toolkit (it would defeat D8). A toolkit type that appears in a component's API (`PlainDate`, `Side`, `Align`) is re-exported as a type from that component's entry. The toolkit is a regular `dependency`, published as the exact version. | `architecture/native-primitives.md#the-toolkit-boundary`, `decisions.md#np-toolkit-re-export` |
| Entries | One entry per component in every framework package, one per mechanism in the toolkit, and a root entry that only re-exports. tsdown multi-entry `exports` for the toolkit, React and Vue; one ng-packagr secondary entry point per component in Angular (as `../tree/packages/angular` does for features). Global providers (direction, locale) in their own entries. `check:package` checks every subpath. | `architecture/native-primitives.md#tree-shaking-a-hard-requirement`, `decisions.md#np-entries` |
| Source layout | Per-component folders inside the responsibility folders (`components/dialog/dialog-popup.tsx`) satisfy `repository.md#source-layout`. The toolkit has one folder per mechanism. Angular: each component's code lives in its ng-packagr secondary entry point's folder, organized like a `src/` (`packages/angular/dialog/directives/dialog-popup.directive.ts`, `dialog/inject/`), and the code the entries share in the `internal` entry (`packages/angular/internal/utils/`): ng-packagr compiles an entry point from its own folder (a file outside it fails with TS6059, `rootDir`), as Tree's feature entries do; `src/` holds only the root entry, which re-exports the components' entries (amended during Issue #3). | `architecture/native-primitives.md#source-layout`, `decisions.md#np-source-layout` |
| Tests | `conformance/` is the per-component referee: behaviour (with axe), contract and visual layers over the `fixtures/<framework>` apps, with one golden set made by React in CI. `examples/shared` holds the site examples' shared Playwright specs. No `apps/playground`. | `architecture/native-primitives.md#tests`, `decisions.md#np-tests` |
| Examples styling | Fragiola UI is Base UI + React, so it styles neither the Vue and Angular examples nor these primitives' examples. The examples and fixtures use the POC's recipes (Tailwind v4, keyed on `data-*`) on Fragiola UI's palette roles, with the five example themes (`light`, `dark`, `ide`, `paper`, `terminal`, shape tokens included). | `architecture/native-primitives.md#examples-styling`, `decisions.md#np-examples-styling` |
| Vue and Angular idioms | As the API mapping table of `spec/README.md`, cross-checked with `../tree` and `../splitter`. Vue: `as` or the `render` scoped slot, `class` / `style` values (state through `data-*` or the slot), template refs (`$el`), `v-model:<prop>`. Angular: attribute directives on the consumer's element, `state()` through `exportAs`, template reference variables, two-way `[(prop)]` bindings (an input with its `*Change` output, the shape of a `model()` input; the input plus output is used where a one-way binding must stay controlled). | `components/primitives.md#in-vue-and-angular`, `decisions.md#np-idioms` |
| Bundle guard | Per framework, a fixture app importing two components (Dialog and Tabs). It fails when any other component's code or an unused toolkit mechanism is in the output, by markers or source maps. Run by `pnpm build` and in CI; a test plants an import and sees it fail. | `architecture/native-primitives.md#tree-shaking-a-hard-requirement`, `architecture/features.md#guarantees-to-enforce`, `decisions.md#np-bundle-guard` |
| Modal overlays in the embeds | Each framework's embed host ports `../ui/examples/react/src/host/overlay-promotion.ts` (CONTRACT §5.4). The copyable example files never know about it. | `docs/site.md#examples`, `decisions.md#np-modal-overlays` |
| Site IA | "API: core (model, commands)" becomes "API: DOM toolkit (`@fragiola/primitives`)", plus one page per component: behaviour summary with the APG pattern, anatomy, per-framework usage, props, state and part attributes. Concepts: the pattern, the primitive contract, state and part attributes, tree-shaking, the behaviour rule (D4). | `docs/site.md#a-native-primitives-library`, `decisions.md#np-site-ia` |
| Runtime dependency | The toolkit keeps the POC's single runtime dependency, `@floating-ui/dom`, in the positioning entry only: the recorded exception to "zero runtime deps". | `architecture/native-primitives.md#the-toolkit-boundary`, `decisions.md#np-runtime-dependency` |
| Site contract | Target `../www/CONTRACT.md` v1.7 (`CONTRACT_VERSION` `"1.7"`), the current version. The dev port is 5191 (`site:dev`); the library is not in `../www/projects.json` until the maintainer validates it. | `docs/site.md#what-a-new-library-provides`, `decisions.md#np-contract-version` |

## Recommendations of the Epic, recorded

| topic | decision | guideline page |
| --- | --- | --- |
| The POC's playground | **Not ported.** The fixtures (`pnpm dev`) and `site:dev` cover what it showed. | `architecture/native-primitives.md#tests`, `decisions.md#np-tests` |
| Recipes location | `examples/shared/src/recipes/`, private, never published. | `architecture/native-primitives.md#examples-styling`, `decisions.md#np-examples-styling` |
| Toolkit entry granularity | One entry per POC folder (mechanism): `overlay`, `positioning`, `layers`, `focus`, `scroll-lock`, `inert`, `collection`, `presence`, `pointer`, `hover`, `range`, `form`, `id`, `direction`, `date`. | `architecture/native-primitives.md#tree-shaking-a-hard-requirement`, `decisions.md#np-entries` |

## Behaviour differences

The differences between the POC and Base UI, decided with the behaviour rule (D4: APG first,
then Base UI), are in [`handoff.md` §3](handoff.md#3-the-behaviour-differences-decided-d4-applied).
They replace the POC's own `docs/decisions.md` ("follow Base UI, with two exceptions"). A new
difference is decided the same way and written in the component's spec with its reason.
