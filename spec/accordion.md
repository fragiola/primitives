# Accordion

## Purpose

A vertically (or horizontally) stacked set of headers, each one showing and hiding a section of
content (APG `accordion`). One section open at a time, or several with `multiple`. Its panels
have the same open and close mechanics as a [Collapsible](collapsible.md)'s (the size variables,
the enter and exit states, `keepMounted`, `hiddenUntilFound`), shared in the toolkit, not in a
component core. A single show and hide button with no header is a Collapsible.

**Scope: stage 1** (Epic #32). The APG `accordion` pattern decides the roles, the headings and the
keys; Base UI's `Accordion` (1.9) decides the parts, the value, `multiple`, `loopFocus`,
`orientation` and the panel options (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Accordion.Root | `div` | `accordion-root` | holds the value |
| Accordion.Item | `div` | `accordion-item` | one section |
| Accordion.Header | `h3` | `accordion-header` | the heading around the Trigger (`render` gives another level) |
| Accordion.Trigger | `button` | `accordion-trigger` | the header's button |
| Accordion.Panel | `div` | `accordion-panel` | the section's content |

## API

**Accordion.Root**:

- `value`, `defaultValue` (`[]`), `onValueChange(value, details)`: the values of the open items, an
  array of strings in every mode (Base UI). Reason `trigger-press` for a press (or Enter or
  Space) on a Trigger, `none` for a panel the browser's find-in-page revealed.
- `multiple` (`false`): several items may be open; without it, opening an item closes the open
  one. An open item's Trigger closes it in both modes (Base UI; the APG allows a panel that cannot
  be collapsed, which is not offered).
- `disabled` (`false`): every item is disabled.
- `orientation` (`"vertical"`): the arrow keys of the headers ("Keyboard").
- `loopFocus` (`true`): the arrow keys wrap from the last Trigger to the first and back.

**Accordion.Item**: `value` (a string, required), `disabled` (`false`).

**Accordion.Header**, **Accordion.Trigger**: no props of their own.

**Accordion.Panel**: `keepMounted`, `hiddenUntilFound`, as a [Collapsible's](collapsible.md#api).
Its `id` and the Trigger's are the Item's.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-orientation`, `data-disabled` |
| Item | `data-open` / `data-closed` (exactly one), `data-disabled`, `data-orientation` |
| Header | the Item's `data-open` / `data-closed`, `data-disabled` |
| Trigger | `type="button"`, an `id`, `aria-expanded` (`"true"` / `"false"`), `aria-controls` (its Panel's id) while open, `disabled` and `data-disabled` when disabled, `data-panel-open` while open |
| Panel | `role="region"`, an `id`, `aria-labelledby` (its Trigger's id), `data-open` / `data-closed`, `data-disabled`, `data-orientation`, `data-starting-style` / `data-ending-style`, `hidden` while closed and kept mounted (`hidden="until-found"` with `hiddenUntilFound`), the structural inline style `--accordion-panel-height` and `--accordion-panel-width` |

The Header is a heading through its element (`h3`); the Trigger's accessible name is its content,
which also names the Panel's `region`.

## Keyboard

| key | vertical | horizontal |
| --- | --- | --- |
| Enter, Space | toggles the focused Trigger's item (the native button's click) | same |
| next Trigger | ArrowDown | ArrowRight (ArrowLeft in RTL) |
| previous Trigger | ArrowUp | ArrowLeft (ArrowRight in RTL) |
| Home / End | the first / last Trigger | same |
| Tab | moves on through the Triggers and the open panels in document order | same |

The arrows, Home and End move focus among the enabled Triggers (a disabled Trigger is a disabled
button, skipped, as Base UI), wrapping with `loopFocus`. The keys of the other orientation do
nothing. The direction is a [DirectionProvider](direction.md)'s, else the Root's computed one.

## Focus

Every enabled Trigger is a tab stop (APG accordion: no roving tabindex). Opening and closing never
move focus.

## Pointer

A click on a Trigger toggles its item.

## Animation

As [Collapsible's](collapsible.md#animation), with `--accordion-panel-height` and
`--accordion-panel-width`. In single mode, opening an item while another is open closes that one:
both transitions run at once.

## Find in page

As [Collapsible's](collapsible.md#find-in-page): a match in a closed `hiddenUntilFound` panel opens
its item (`onValueChange` with the item's value added, reason `none`; in single mode it replaces
the open one).

## RTL

In horizontal orientation, ArrowLeft moves to the next Trigger and ArrowRight to the previous one.

## Server rendering

As Collapsible's: open panels render with their variables at `auto` and no transition state.

## Scenarios

The output prints `value: <values joined by ",">` (empty when none is open) and `reason: <reason>`
for the last `onValueChange` (`none` before any).

### `/accordion/basic`

An Accordion, uncontrolled with no default, with the items (each a Header holding a Trigger, then a
Panel holding the paragraph "<label> details"):

- **"Shipping"** (`shipping`), **"Returns"** (`returns`), **"Warranty"** (`warranty`, disabled),
  **"Support"** (`support`);

then a button **"After accordion"**.

Checks:

1. Four headings of level 3, each holding a button with `aria-expanded="false"`; "Warranty" is
   disabled; no Panel is in the DOM.
2. A click on "Shipping" expands it: the `region` named "Shipping" is visible with "Shipping
   details" (`value: shipping`, `reason: trigger-press`), and the Trigger's `aria-controls` names
   it.
3. A click on "Returns" expands it and collapses "Shipping" (`value: returns`); a second click on
   "Returns" collapses it (`value: ` empty).
4. Focus "Shipping", ArrowDown → "Returns"; ArrowDown → "Support" (the disabled "Warranty"
   skipped); ArrowDown wraps to "Shipping"; ArrowUp wraps to "Support"; Home → "Shipping"; End →
   "Support"; ArrowRight does nothing.
5. Enter on the focused "Support" expands it, Space collapses it.
6. Axe finds no violation (closed, and with an item open).

### `/accordion/multiple`

An Accordion with `multiple`, whose `value` the fixture holds, starting at `["shipping"]`, with
the items "Shipping", "Returns" and "Support" as above, each Panel `hiddenUntilFound`.

Checks:

1. "Shipping" is expanded from the first render, its Panel visible with no `data-starting-style`
   and its variables at `auto`; the other Panels are in the DOM with `hidden="until-found"`.
2. A click on "Returns" expands it and keeps "Shipping" expanded (`value: shipping,returns`); a
   click on "Shipping" collapses it alone (`value: returns`).
3. Finding "Support details" in the page (a text fragment, Chromium) expands "Support"
   (`value: returns,support`, `reason: none`).
4. With the recipe's transition: an opening Panel's `--accordion-panel-height` is in pixels when
   `data-starting-style` is removed, then `auto`; a closing one is in pixels when
   `data-ending-style` is set.

### `/accordion/horizontal`

An Accordion with `orientation="horizontal"` and `loopFocus={false}`, with the items "Shipping",
"Returns" and "Support" as above.

Checks: the Root has `data-orientation="horizontal"`; from "Shipping", ArrowRight → "Returns",
ArrowRight → "Support", ArrowRight stays on "Support" (no loop); ArrowLeft → "Returns"; ArrowDown
does nothing.

### `/accordion/horizontal?dir=rtl`

The horizontal scenario in `dir="rtl"`.

Checks: from "Shipping", ArrowLeft → "Returns" (next); ArrowRight → "Shipping" (previous).

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Item `value` is optional (a generated id) | required, as a Tab's (the open values are the app's to read) |
| Base UI's Item `onOpenChange` and Root `keepMounted` / `hiddenUntilFound` | not offered: the Root's `onValueChange` reports every change, and the panel options are the Panel's |
