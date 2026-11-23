# Conformance suite

One Playwright suite, run against every framework's fixture app (`fixtures/<framework>`). It is
the referee of the library (AGENTS.md rule 5, D6): a component is done when React, Vue and Angular
all pass every layer, without a test written for one framework. Moved from the POC
(`conformance/`), without its baseline project.

## Layers

| layer | file | checks |
| --- | --- | --- |
| behaviour | `tests/<component>/behaviour.test.ts` | roles, accessible names, ARIA states, keyboard, focus, dismissal, geometry, axe (WCAG 2.1 A/AA). Finds elements by role and name only |
| contract | `tests/<component>/contract.test.ts` | the spec's part attributes (`data-primitives-part="<component>-<part>"`) and state attributes (present or absent, never `"false"`) |
| visual | `tests/<component>/visual.test.ts` | screenshots against **one** golden set, made by React |
| ssr | `tests/ssr/ssr.test.ts` | every scenario of the specs (their `### \`/path\`` headings) rendered on a server, hydrated: no console warning or error, the server's ids kept, and the same DOM as the browser's own render (`src/ssr.ts` compares the trees); the Tabs Indicator and the Slider thumb in place before hydration |

The ssr layer runs against a second server per framework (`ssrPort`, `src/ssr-server.ts`), which
serves the fixture's `build:ssr` output (`dist-ssr/`): its client build, and each page rendered by
its server entry (`fixtures/<framework>/src/server/entry-server.ts(x)`: `react-dom/server`,
`vue/server-renderer`, `@angular/platform-server`). The fixture hydrates a page whose `#root` has
`data-ssr`, and marks `<html data-fixture-ready>` once rendered or hydrated. The server runs in
German (`LANG=de_DE.UTF-8`), so a page falling back to the server's own language fails.

## Running

```sh
pnpm conformance                      # every framework (each fixture is built and served)
pnpm conformance --project vue        # one framework
pnpm --filter conformance exec playwright test tests/tabs --project angular
```

Only the fixtures of the selected projects are built and served (`playwright.config.ts`); locally,
a server already running on the port is reused (`pnpm dev` starts them all).

## Registering a framework

Add it to `IMPLEMENTATIONS` in `src/implementations.ts` (`name` is the fixture's folder):

```ts
{ name: "react", fixture: "fixture-react", port: 5320, ssrPort: 5321, layers: ["behaviour", "contract", "visual", "ssr"] }
```

The fixture must have `build`, `build:ssr` and `preview` scripts and a server entry
(`src/server/entry-server`, `render(url, template)`), and render every scenario of the specs at
`/<component>/<scenario>`, reading `?locale=` and `?dir=`.

## Golden screenshots

The visual layer's `snapshotPathTemplate` leaves the project name out, so every framework compares
against the same images in `snapshots/`. They are made by React **in CI's Playwright image**, since
local fonts render differently: the visual tests are skipped unless `CI` or `VISUAL=1` is set.

To create or update them:

1. Push without the images (or with the changed ones removed). CI's `Conformance (react)` job
   writes the missing screenshots, fails, and uploads them as the `conformance-snapshots` artifact.
2. Download it into `conformance/snapshots`
   (`gh run download <run> -n conformance-snapshots -D conformance/snapshots`), review the images,
   commit them.

Vue and Angular never write snapshots (`--update-snapshots none` in CI): when one differs, its DOM
is fixed, not the image. Animations are disabled, the caret hidden and the pointer parked at the
top-left corner.

## Helpers (`src/`)

| file | what |
| --- | --- |
| `implementations.ts` | the registered frameworks, and the `--project` parsing |
| `scenario.ts` | `openScenario(page, path, { locale, dir, today, cancel })` |
| `output.ts` | `expectOutput(page, key, value)` reads the fixture's `key: value` lines (of a page or a frame) |
| `frame.ts` | `openInFrame(page, path)`: a scenario inside an iframe of a same-origin host page (the pointer leaving the iframe), `FRAME_BOX` |
| `focus.ts` | `expectFocusWithin`, `isInertOrHidden` |
| `axe.ts` | `expectNoAxeViolations` |
| `contract.ts` | `part(page, component, name)`, `parts(page, component)`, `expectNoFalseStates`, `expectOpenState` (exactly one of `data-open` and `data-closed`) |
| `visual.ts` | `visualOnlyInCi`, `expectScreen` |
| `lifecycle.ts` | `LIFECYCLE_OVERLAYS`: the overlays of the lifecycle scenarios (`tests/lifecycle`) |
| `presence.ts` | `settleAnimations`, `slowMotion`, `recordExit`, `markElement`, `isSameElement`: the exit transitions (`tests/presence`) |
| `ssr.ts` | `scenarioPaths` (every spec scenario), `snapshotRoot` (the comparable `#root`) |
| `ssr-server.ts` | the ssr layer's server: `node conformance/src/ssr-server.ts <fixture dir> <port>` |
| `form.ts` | `expectSubmitted(page, entries)`: the form scenarios' `form: ...` line |
| `pointer.ts` | `pointAlong`, `pressAlong`, `dragFrom`: whole-pixel presses and drags along a box |
| `touch.ts` | `holdTouch`: a touch held at a point for a time (a long press), through Chromium's input pipeline (CDP), in a `hasTouch` context |
| `slider.ts` | `sliderState`, `expectSliderValue` |
| `dates.ts` | `fullDate`, `monthHeading`, `shortWeekday`: the calendar's expected names, computed with `Intl` |
