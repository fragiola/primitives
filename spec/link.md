# Link

## Purpose

A link that knows the two states an app's navigation gives it: **disabled** (it stays in the tab
order, announced as disabled, and its press navigates nowhere) and **current** (the page the app
is on, `aria-current="page"`). It renders the app's own anchor, or the app's router link, so the
router keeps its navigation; the package depends on no router.

**Scope: stage 4** (Epic #97, Issue #95). The APG's **link** pattern decides the element: a native
`<a href>` (Enter follows it; the browser gives the role and the tab stop). The APG has no
disabled link and Base UI has no Link: React Aria's Link is the behaviour reference (read, never
copied), and the APG-closest options are decided here (D4, the Epic's stop condition) and recorded
in `docs/decisions.md`:

- **current**: `aria-current="page"`, the APG breadcrumb's attribute for the link to the current
  page (Pagination's decision too, Epic #64);
- **disabled**: `aria-disabled="true"` on the anchor, which keeps its `href` and its tab stop
  (Pagination's disabled links, Epic #64: a reader still finds the link and hears that it is
  unavailable); its press is stopped (below).

Link is not a button: it has no Space key (the APG link has none) and no `role` of its own. An
element that is no anchor is out of scope: a link to nowhere is a Button, and Breadcrumbs'
current page that is no link is `Breadcrumbs.Current` ([breadcrumbs.md](breadcrumbs.md)).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Link | `a` | `link-root` | one component (as Label); the app's `href`, or its router link through `render` |

One entry, `/link` (D8), built on no other component. Breadcrumbs' Link has the same behaviour
through each framework's shared code (`utils/link-props.ts`, Vue's `utils/link-attributes.ts`,
Angular's `/internal` `link-press.ts`), never through this entry.

## API

- `disabled` (`false`): the link is unavailable: `aria-disabled="true"`, its press navigates
  nowhere and reaches no handler.
- `current` (`false`): it links to the page the app is on: `aria-current="page"`.
- Every other attribute is forwarded (`href`, `target`, `rel`, `aria-label`, ...); the consumer's
  `onClick` runs after the Link's own, never while disabled.

**With a router.** React: `render={<RouterLink to="/docs" />}` (any component that renders an
anchor and forwards its props); Vue: `:as="RouterLink" to="/docs"` (its attributes fall through to
the anchor); Angular: the directive sits on the router's own anchor, `<a routerLink="/docs" link>`
(selector `a[link]`, class `Link`). The app decides `current` from its router (Vue's `RouterLink`
sets its own `aria-current` on an exact match; the app passes `current` instead, or leaves
`current` unset and lets the router write it).

## State attributes and ARIA

| attribute | when |
| --- | --- |
| `aria-disabled="true"`, `data-disabled` | `disabled` |
| `aria-current="page"`, `data-current` | `current` |

No accessible name of its own: its text, or the app's `aria-label`.

## Keyboard

The browser's: Tab reaches the link (a disabled one too), Enter follows it. Enter on a disabled
link does nothing (its click is stopped).

## Focus

A disabled link stays focusable (the APG's guidance for a disabled control a reader needs to
find, and Pagination's links). A press moves no focus of its own.

## Pointer

A click follows the link (the browser's, or the router's handler). **A disabled link's press**:
the click is stopped in its capture phase on the anchor: its default is prevented (no navigation)
and its propagation stopped, so no listener of the anchor or around it runs after it, a router's
included (React Router's and Vue Router's handlers, which skip a prevented click, and Angular's
`RouterLink`, which does not). It is the same rule as Button's disabled press (spec/button.md: no
press reaches a handler while disabled), written for an anchor: Button's own code is not used, so
its entry does not change.

## Animation

None.

## RTL

Nothing changes.

## Scenarios

### `/link/basic`

Three Links: "Home" (`href="#home"`, `current`), "Docs" (`href="#docs"`) and "Archive"
(`href="#archive"`, `disabled`), each with an `onClick` that counts its presses.

Output: `clicks: <the presses the consumer's handlers saw>` (`0` at first).

Checks:

1. Three links; "Home" has `aria-current="page"`, the others none; "Archive" has
   `aria-disabled="true"` and an `href`.
2. A click on "Docs": the hash becomes `#docs`, `clicks: 1`.
3. A click on "Archive": the hash stays, `clicks` stays.
4. The keyboard: Tab moves from "Home" to "Docs" to "Archive" (the disabled link is a tab stop);
   Enter on "Archive" changes nothing; Enter on "Docs" follows it.
5. Axe finds no violation.

### `/link/router`

A fixture router (a few lines of the fixture, standing for an app's router: it renders an anchor,
prevents its default on a plain click and records the route) and two Links rendered through it:
"Settings" (route `/settings`) and "Billing" (route `/billing`, `disabled`). React passes it as
`render`, Vue as `as`, Angular puts the Link directive on the fixture router's anchor directive.

Output: `route: <the route the fixture router went to>` (`/` at first).

Checks:

1. A click on "Settings": `route: /settings`, the URL's hash unchanged (the router's navigation,
   not the browser's).
2. A click on "Billing", and Enter on it: `route` stays `/settings`; it has
   `aria-disabled="true"`.
3. Axe finds no violation.

## Differences from Base UI

Base UI has no Link; the behaviour above is this library's, decided as the Purpose says.
