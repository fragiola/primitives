# Tabs

## Purpose

Layered sections of content, one visible at a time, chosen from a list of tabs (APG `tabs`).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Root | `div` | `tabs-root` | holds the state |
| List | `div` | `tabs-list` | the `tablist` |
| Tab | `button` | `tabs-tab` | |
| Indicator | `span` | `tabs-indicator` | follows the selected tab; optional |
| Panel | `div` | `tabs-panel` | the content of one tab |

## API

**Root**: `value`, `defaultValue` (the first enabled tab's value), `onValueChange(value,
details)`, `orientation` (`"horizontal"`), `activation` (`"automatic"`, the APG's recommendation when panels show without latency, D4 §3: moving focus selects;
`"manual"`: Enter or Space selects), `loopFocus` (`true`: the arrow keys wrap from the last tab
to the first and back; Base UI's name, D4 §3 "Naming", the POC's `loop`). With neither `value`
nor `defaultValue`, the first enabled tab is selected once the tabs are known, and reported
through `onValueChange` with the reason `none` (as the POC; Base UI does not report its default),
so a consumer that mirrors the value sees it.

**Tab**: `value` (any string, required; the tab's and its panel's ids encode it, so a value with
spaces still gives valid `aria-controls` / `aria-labelledby`), `disabled`.

**Panel**: `value` (string, required), `keepMounted` (`false`: an inactive panel is not rendered
once its exit has ended; `true`: it is then rendered with `hidden`). Panels have enter and exit
states ("Animation").

**Indicator**: `renderBeforeHydration` ("Server rendering"). It exposes the selected tab's box, relative to the List, as structural
CSS variables: the logical `--tabs-indicator-inset-inline-start`, `--tabs-indicator-inset-block-start`,
`--tabs-indicator-inline-size`, `--tabs-indicator-block-size`, and the physical ones (Base UI's
names, Epic #32) `--active-tab-left`, `--active-tab-right`, `--active-tab-top`,
`--active-tab-bottom` (the tab's offsets from the List's left, right, top and bottom edges),
`--active-tab-width` and `--active-tab-height`. It is not rendered while no tab is
selected, in every framework: Angular's is structural (`<span *tabsIndicator>`), as its panels
are, so it leaves the DOM too (Epic #22; it was an attribute directive that stayed, with no
variables).

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-orientation`, `data-activation`, `data-activation-direction` |
| List | `role="tablist"`, `aria-orientation`, `data-orientation`, `data-activation-direction` |
| Tab | `role="tab"`, an `id`, `aria-selected` (`"true"` / `"false"`, as ARIA requires both), `aria-controls` (its panel's id), `tabindex` (`0` on the tab that holds the roving focus, `-1` on the others), `aria-disabled="true"` and `data-disabled` when disabled, `data-selected`, `data-orientation`, `data-activation-direction` |
| Indicator | `aria-hidden="true"`, `data-orientation`, `data-activation-direction` |
| Panel | `role="tabpanel"`, an `id`, `aria-labelledby` (its tab's id), `tabindex="0"`, `data-selected` when its tab is selected, `hidden` when kept mounted and inactive (once its exit ended), `inert` while its exit runs, `data-starting-style` / `data-ending-style` ("Animation"), `data-orientation`, `data-activation-direction` |

The tab that holds the roving focus (`tabindex="0"`) is the selected tab, else the first tab.

**`data-activation-direction`** (Base UI, Epic #32): where the newly selected tab sits from the
one selected before it, measured on the page: `left` or `right` in horizontal orientation, `up` or
`down` in vertical orientation, `none` before the first change (and when either tab is not in the
DOM). It is **physical**, as the Indicator's travel and Base UI's: in RTL the next tab sits on the
left, so moving to it gives `left` (a recipe slides the new panel in from the side the Indicator
moves toward, in either direction). It is set in the same render as the new selection, so a
panel's first frame (`data-starting-style`) already carries it.

## Keyboard

| key | horizontal | vertical |
| --- | --- | --- |
| next tab | ArrowRight (ArrowLeft in RTL) | ArrowDown |
| previous tab | ArrowLeft (ArrowRight in RTL) | ArrowUp |
| Home / End | first / last tab | same |
| Enter, Space | selects the focused tab (`manual`; in `automatic` it is already selected) | same |
| Tab | from the tab list to the selected panel | same |

Arrow keys and Home/End move focus to every tab, wrapping when `loopFocus`. **Disabled tabs stay
focusable** (the APG keyboard practice keeps tabs focusable when disabled, so they can be
discovered) but are never selected: focusing one in `automatic` activation leaves the selection
where it was, and Enter, Space and clicks on it do nothing. In `automatic` activation, moving focus
to an enabled tab selects it (reason `list-navigation`). A click reports `trigger-press`.

## Focus

Roving tabindex: the tab list is one tab stop. The panel is the next one (`tabindex="0"`), so its
content is reachable even when it holds nothing focusable.

## Pointer

Clicking an enabled tab selects it and focuses it.

## Dismissal and layering

Not applicable.

## Positioning

Not applicable (the Indicator's variables are measurements, not positioning).

## Animation

The Indicator's variables change when the selection changes, so a CSS transition on them animates
it.

The panels have enter and exit states, through the toolkit's presence (Epic #32; it said "no
animation of its own" before):

- a panel that becomes selected renders with `data-starting-style` for its first frame, so a
  transition starts from it; a panel shown by the first render (or a server render) has none;
- a panel that stops being selected stays rendered with `data-ending-style` and `inert` until
  every animation on it has finished, then unmounts (or takes `hidden` with `keepMounted`); with
  no transition, at once;
- selected again during its exit, it drops `data-ending-style` and is the same element.

The two panels exist together while one exits: a recipe that animates both stacks them (a grid
cell), or animates the enter only.

## RTL

In horizontal orientation, ArrowLeft moves to the next tab and ArrowRight to the previous one. The
direction is a [DirectionProvider](direction.md)'s, else the List's computed one. The
Indicator's inline-start variable is measured from the List's inline-start edge (the layout's,
so always the computed direction).

## Server rendering

The Indicator is rendered once the selected tab is measured, which only a browser can do, so it
first appears in place. **`renderBeforeHydration`** (Base UI's name, default
`false`; Angular: `*tabsIndicator="true"`): a server render writes a small inline script inside the
Indicator that measures the selected tab (`aria-selected="true"` in its list) as the page parses,
sets the four variables, and removes itself, so the hydration finds the Indicator as the browser
renders it (the toolkit's `placeTabsIndicator`). Off by default: a page whose Content Security
Policy blocks inline scripts leaves it off. Decided by the behaviour rule: the APG says nothing,
Base UI has this option.

## Scenarios

### `/tabs/automatic`

Content: tabs **"Account"**, **"Password"**, **"Billing"** (disabled), **"Team"** with panels
holding the paragraphs "Account settings", "Password settings", "Billing settings", "Team
settings"; an Indicator; a button **"After tabs"** after the panels. Output: `value: ...`.

Checks:

1. A `tablist` with four `tab`s; "Account" has `aria-selected="true"` and `tabindex="0"`, the
   others `aria-selected="false"` and `tabindex="-1"`.
2. The visible `tabpanel` is named "Account" and contains "Account settings".
3. Focus "Account", ArrowRight: "Password" is focused, selected (`value: password`), and its panel
   is visible.
4. ArrowRight → "Billing" (`aria-disabled="true"`): focused but not selected ("Password" stays
   selected); ArrowRight → "Team" (selected); ArrowRight wraps to "Account"; End → "Team"; Home →
   "Account".
5. Tab from the selected tab focuses its panel; Tab again focuses "After tabs".
6. Clicking "Team" selects it.
7. Axe finds no violation.

### `/tabs/manual`

The same content with `activation="manual"`.

Checks: ArrowRight moves focus to "Password" while "Account" stays selected (`value: account`);
Enter selects "Password"; ArrowRight twice (through the disabled "Billing") reaches "Team", and
Space selects it.

### `/tabs/vertical`

The same content with `orientation="vertical"`.

Checks: the tablist has `aria-orientation="vertical"`; ArrowDown and ArrowUp move between tabs;
ArrowRight does nothing; ArrowDown gives `data-activation-direction="down"` and ArrowUp `up`; the
Indicator's `--active-tab-top` equals its `--tabs-indicator-inset-block-start`.

### `/tabs/none-selected`

Tabs **"Account"** and **"Password"**, both disabled, with panels "Account settings" and
"Password settings", an Indicator, and no `value` nor `defaultValue`.

Checks: no tab is selected (`aria-selected="false"`, no `data-selected`), no panel and no
Indicator is rendered.

### `/tabs/animated`

Tabs **"Overview"**, **"Projects"**, **"Settings"**, uncontrolled with `defaultValue="overview"`,
an Indicator, and panels with `keepMounted` holding the paragraphs "Overview content", "Projects
content", "Settings content", stacked in one grid cell; the recipe fades and slides a panel in
and out along `data-activation-direction` over `--pr-motion`. Output: `value: ...`.

Checks:

1. Every part has `data-activation-direction="none"`; the "Overview"
   panel has no `data-starting-style`.
2. A click on "Settings": the Root, the List, the tabs, the Indicator and the panels have `data-activation-direction=
   "right"`; the "Settings" panel carried `data-starting-style` on its first frame shown; the
   "Overview" panel carries `data-ending-style` and `inert`, not `hidden`, while its transition
   runs, then `hidden` (the same element, kept mounted).
3. A click on "Overview": `data-activation-direction="left"`.
4. The Indicator's `--active-tab-left` equals `--tabs-indicator-inset-inline-start`, and
   `--active-tab-width` its `--tabs-indicator-inline-size`, in pixels.

### `/tabs/animated?dir=rtl`

The animated scenario in `dir="rtl"`.

Checks: a click on "Projects" (next, on the left) gives `data-activation-direction="left"`; a
click on "Overview" gives `right`; the Indicator's `--active-tab-right` equals its
`--tabs-indicator-inset-inline-start`.

### `/tabs/automatic?dir=rtl`

The automatic scenario in `dir="rtl"`.

Checks: from "Account", ArrowLeft moves to "Password" (next); from "Password", ArrowRight moves
back to "Account" (previous); from "Account", ArrowRight wraps to "Team" (previous, skipping
nothing).

## Differences from Base UI

None in behaviour (the POC measured Base UI 1.9's `Tabs.List activateOnFocus` for the automatic
activation). Automatic activation stays the default, manual an option (D4 §3).
