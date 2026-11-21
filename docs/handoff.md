# Handoff: starting `@fragiola/primitives`

This folder held only `docs/` when the project was started. Those docs come from a planning
session (2026-11-21) that ran the cross-framework POC and the component survey. Everything below
is **decided by the maintainer** unless it is marked as a recommendation. Do not ask about it
again.

Read, in order:
1. this page;
2. [`catalog.md`](catalog.md): every component in the reference libraries, and the staged scope;
3. the POC's reports (section 7).

## 1. What it is

`@fragiola/primitives` is a library of headless, accessible UI primitives (Dialog, Menu, Combobox,
Calendar, ...). It ships the **same catalog with the same behaviour in React, Vue and Angular**.
The goal is the most complete headless catalog available. It must not be a Base UI subset: Base UI
has no date picker, for example, and this library will.

The POC proved the approach works (`final.md`, verdict "yes"):
- 10 components in 5 frameworks with no shared component core;
- 140/140 behaviour tests and 24/24 contract tests in every framework;
- pixel-identical screenshots across frameworks;
- a new component costs 0.4–0.9× React once a framework's model is mapped.

## 2. Decisions

| # | topic | decision |
| --- | --- | --- |
| D1 | Name and packages | Project and repo `primitives` (`fragiola/primitives`). Packages: `@fragiola/primitives` is the framework-free DOM toolkit, the POC's `@poc/dom`; `@fragiola/primitives-react`, `@fragiola/primitives-vue` and `@fragiola/primitives-angular` are the framework packages. |
| D2 | Frameworks | React, Vue and Angular in v1. Svelte and Solid exist in the POC and can come later; they are out of scope now. |
| D3 | Architecture | **A second library pattern, not core + adapters.** The other Fragiola libraries have a stateful core with the model API (`run/can/check/get/is`) plus thin adapters. This library shares only a spec per component, the framework-free DOM toolkit, a styling layer for examples and tests, and one conformance suite. Each framework package is a **native implementation** in that framework's idioms. There is no model API and no command bus. Record this as a new pattern in `guidelines/` (`decisions.md`, plus the page it belongs to) in the first Epic, so no agent "fixes" it into core + adapters. |
| D4 | Behaviour rule | **APG first. Where the APG has no rule, follow Base UI.** It replaces the POC's earlier rule ("Base UI, with exceptions"). Section 3 applies it to every open difference. |
| D5 | Scope rule | Behaviour only. Markup-and-CSS components (Card, Badge, Alert, Skeleton, Kbd, Spinner, Empty, ...) belong to Fragiola UI. Components that already have a Fragiola library stay there: Tree (`@fragiola/tree`), Splitter (`@fragiola/splitter`), Table, GridList and Grid (`@fragiola/data-grid`), drag and drop (`@fragiola/dnd`). |
| D6 | Completeness | Every component in stages 0–4 of `catalog.md` §3, about 85, in all three frameworks. Stage 5 (niche) only on demand. A component is done only when all three frameworks pass its conformance suite. |
| D7 | Fragiola UI | **Base UI is not replaced; Fragiola UI gets several bases, as shadcn/ui does.** shadcn ships `base`, `radix` and `aria` from one authored source, with placeholder classes and a build that writes every base × style combination (`catalog.md` sources, `references/shadcn-ui/apps/v4/registry`). Fragiola UI will offer `@fragiola/primitives` as the **default, recommended base**, and keep Base UI as an option. This is later work in `../ui`, out of scope for the first Epics. |
| D8 | Tree-shaking (hard requirement) | A consumer that installs `@fragiola/primitives-react` and uses 2 components gets **only those 2 components**, and the DOM toolkit code they import, in their bundle. Section 4 lists the rules and the guard. |
| D9 | POC code | The POC is the maintainer's own code: its specs, `@poc/dom`, framework packages, recipes and conformance suite **may be moved over and adapted**. The rule "never copy code" applies only to the third-party `references/`. |
| D10 | Combobox | The decisions already applied in the POC stay: built-in filtering, object values, `multiple` with chips, form support, Escape resets the text, clicking the input opens the list. The APG either allows these or says nothing about them. |

## 3. The behaviour differences, decided (D4 applied)

These are the rows of the POC's `production-scope.md` §4. "Keep" means the POC's spec stays as
written; "change" means the spec and implementations change during the port.

| difference | decision | reason |
| --- | --- | --- |
| Select placement | **keep**: the list opens below the trigger. `alignItemWithTrigger` is not offered. | the APG select-only combobox uses a listbox popup; item alignment is a Base UI choice |
| Select focus and Tab | **keep**: DOM focus stays on the trigger with `aria-activedescendant`; Tab chooses the highlighted option and moves on | APG select-only combobox |
| Select typing while closed | **keep**: a printable key opens the list on the matching option. Record it in the Select spec. | APG select-only combobox ("opens the listbox … moves visual focus to the first option that matches") |
| Tabs activation default | **keep automatic**, with manual as an option | the APG recommends automatic when panels show without latency |
| Menu and Select `modal` | **keep non-modal by default**, and add a `modal` option (scroll lock, blocked outside pointer) | the APG menu button is non-modal; the option gives Base UI parity |
| Popover focus on open | **change**: focus the first tabbable element, or the popup when it has none; `initialFocus` overrides | the APG dialog pattern: "generally, focus is initially set on the first focusable element" |
| Popover focus after an outside press | **change**: follow Base UI, so focus returns to the trigger unless the press landed on a focusable element | the APG says nothing |
| Tooltip | **keep**: it wires `role="tooltip"` and `aria-describedby` itself, and stays open while hovered | the APG tooltip pattern, and WCAG 1.4.13 (hoverable content) |
| Naming | **change to Base UI names**: sides `inline-start` / `inline-end` (plus the physical `left` / `right`), `loopFocus`, `data-popup-open` on triggers | the APG says nothing |

**Guideline gap, recommended default:** `primitives.md` requires `data-<slug>-part` on every
element, but a library of many components has many parts with the same name. The recommendation
is `data-primitives-part="<component>-<part>"` (`"dialog-popup"`, `"menu-item"`). State keeps the
Base UI-style attributes (`data-open`, `data-highlighted`, ...), following the boolean rules of
`primitives.md`. Decide it in the first Epic and record it in `guidelines/decisions.md`.

## 4. Tree-shaking (D8)

The rules:
- ESM only, `"sideEffects": false` in every package, no top-level side effects in any module.
- **One entry per component** in every package, plus a root entry that only re-exports. Examples:
  `@fragiola/primitives-react/dialog` and `@fragiola/primitives/overlay`. Importing from the root
  must tree-shake to the same result.
- No registry, plugin or provider that references every component:
  - Vue: no global `app.use()` plugin that registers all components.
  - Angular: standalone directives, one ng-packagr **secondary entry point** per component
    (`@fragiola/primitives-angular/dialog`).
  - Global providers, such as direction or locale, live in their own entries.
- The DOM toolkit is split by mechanism (overlay session, positioning, collections, dates, ...).
  A component imports only the mechanisms it uses, so the calendar's date code never reaches an
  app that uses only Dialog.
- Heavy optional parts stay out of the component that does not need them: time zones, other
  calendar systems, virtualization.

The guard: a **bundle guard** test, run in CI for each framework.
- It builds a fixture app that imports 2 components, for example Dialog and Tabs.
- It fails if any other component's code, or an unused mechanism, appears in the output.
- Use markers or source maps, like the guards in `data-grid` and `tree`
  (`architecture/features.md`, "bundle guard").
- A per-component size report (`pnpm size`) is kept in the docs.

## 5. Stages

From `catalog.md` §3. The order is fixed; each stage can be split into several Epics.

| stage | content |
| --- | --- |
| 0. Port the POC (v1) | The repository bootstrap, D3 recorded in the guidelines, the tree-shaking guard, and the POC's 13 components in React, Vue and Angular with their specs and conformance suite: Dialog, Popover, Menu, Combobox, Select, Tooltip, Tabs, Checkbox and CheckboxGroup, Slider, Calendar, RangeCalendar, DatePicker, DateRangePicker. Section 3's changes are applied during the port. |
| 1. Production scope and Fragiola UI parity | The gaps in `production-scope.md` §2–3, with **Field first** (the base of every form control). Then Fieldset, Form, Button, RadioGroup, Switch, Accordion, Collapsible, AlertDialog, ContextMenu, Menu checkbox and radio items, Drawer, NavigationMenu, Progress, Avatar, Separator. |
| 2. The consensus set | Toast, HoverCard, Toggle, ToggleGroup, Toolbar, Menubar, ScrollArea, Meter, NumberField, OTP field, Autocomplete, Listbox, Pagination, Label, AspectRatio |
| 3. Dates and times | DateField, TimeField, the range fields, multiple-date calendar, month and year pickers (and ranges), presets, calendar systems and time zones |
| 4. Differentiators | Command palette, TagsInput, TagGroup, SegmentedControl, Editable, Rating, FileUpload and DropZone, the Color family, Steps, Carousel, PasswordInput, SearchField, Breadcrumbs, Link, CascadeSelect, Clipboard |
| 5. Niche, on demand | Tour, FloatingPanel, AngleSlider, SignaturePad, ImageCropper, Marquee, Timer, TOC, QR code, JSON tree, Highlight, chat message scroller |

Build each mechanism in the DOM toolkit before the stage that first needs it (`catalog.md` §3).
The mechanisms are: Field layer, collections, virtualizer and async list, detached triggers,
swipe gestures, segment editing and calendar systems, color model, toast queue.

## 6. Process

1. Start the project with `/fragiola-start-project`.
   - Reuse this folder. It holds only these docs, which become the repo's first `docs/`.
   - `catalog.md` is the survey: do not repeat the reference survey.
   - D3 overrides the core + adapters parts of the brief.
2. `tech-lead` plans stage 0 and implements it with `epic-implementer`.
3. Later stages each start with their own `tech-lead` run.

Open item that needs a person: the screen reader check (`screen-readers.md` in the POC). It does
not block stage 0.

## 7. Sources

- **POC:** `~/organizations/me/pocs/poc-cross-framework-primitives`, repo
  `maurodesouza/poc-cross-framework-primitives`.
  - Read it from `origin/main`. The local checkout may be behind: run `git fetch`, never switch
    or pull its branch.
  - `docs/reports/final.md`: verdict and evidence.
  - `docs/reports/production-scope.md`: the gaps from POC scope to Base UI and Fragiola UI parity.
  - `docs/reports/frameworks.md`: the per-framework lessons.
  - `docs/decisions.md`: the POC's decisions.
  - `AGENTS.md`: the port checklist, which carries a framework's model from one component to the
    next.
  - `spec/`, `packages/dom`, `packages/{react,vue,angular}`, `packages/styles`, `conformance/`.
- **POC gotchas worth keeping:**
  - Tailwind v4's `outline-hidden` needs `outline-solid` together with `outline-2`.
  - Vue's event invoker skips events under a fixed test clock, so use native listeners.
  - Golden screenshots are made in CI only.
- **Survey:** [`catalog.md`](catalog.md), with versions and the library keys.
- **References:** `~/organizations/fragiola/references/*`. Read-only, never copied.
- **Guidelines:** `~/organizations/fragiola/guidelines`, loaded with the `fragiola-ecosystem`
  skill.
