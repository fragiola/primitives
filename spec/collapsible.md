# Collapsible

## Purpose

A button that shows and hides one section of content (APG `disclosure`). The panel opens and
closes in place and can be animated in CSS with no layout jump: it exposes its content's size as
CSS variables and its enter and exit states. Several sections where the keyboard moves between
the headers are an [Accordion](accordion.md); content laid over the page is a
[Popover](popover.md).

**Scope: stage 1** (Epic #32). The APG `disclosure` pattern decides the roles and the keys; Base
UI's `Collapsible` (1.9) decides the parts, `keepMounted`, `hiddenUntilFound` and the size
variables (D4).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Collapsible.Root | `div` | `collapsible-root` | holds the open state |
| Collapsible.Trigger | `button` | `collapsible-trigger` | the disclosure button |
| Collapsible.Panel | `div` | `collapsible-panel` | the content shown and hidden |

## API

**Collapsible.Root**:

- `open`, `defaultOpen` (`false`), `onOpenChange(open, details)`: reason `trigger-press` for a
  press (or Enter or Space) on the Trigger, `none` for a panel the browser's find-in-page revealed
  ("Find in page").
- `disabled` (`false`): the Trigger is a disabled button and nothing opens or closes it but a
  controlled `open`.

**Collapsible.Trigger**: no props of its own (a native `button`, `type="button"`).

**Collapsible.Panel**:

- `keepMounted` (`false`): a closed panel is not rendered; with `true` it stays in the DOM with
  `hidden`.
- `hiddenUntilFound` (`false`): a closed panel stays in the DOM with `hidden="until-found"`, so the
  browser's find-in-page searches it and opens it ("Find in page"). It implies `keepMounted`.

The Panel's `id` is the Root's (the Trigger's `aria-controls` names it): a consumer's `id` on the
Panel is not supported.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `data-open` / `data-closed` (exactly one), `data-disabled` |
| Trigger | `type="button"`, `aria-expanded` (`"true"` / `"false"`), `aria-controls` (the Panel's id) while open, `disabled` and `data-disabled` when disabled, `data-panel-open` while open |
| Panel | an `id`, `data-open` / `data-closed`, `data-disabled`, `data-starting-style` / `data-ending-style` ("Animation"), `hidden` while closed and kept mounted (`hidden="until-found"` with `hiddenUntilFound`), the structural inline style `--collapsible-panel-height` and `--collapsible-panel-width` |

The Trigger's accessible name is its content; the Panel has no role (APG disclosure: the content
is any content).

## Keyboard

| key | action |
| --- | --- |
| Enter, Space | toggles the panel (the native button's click) |
| Tab | moves on: the Trigger, then the Panel's content in document order |

## Focus

The Trigger is a native `button`. Opening and closing never move focus.

## Pointer

A click on the Trigger toggles the panel. A disabled Trigger is a disabled button: it takes no
click.

## Animation

The Panel is animatable in CSS with no layout jump, through the toolkit's presence and panel size
(`@fragiola/primitives/presence`):

- **The size variables.** `--collapsible-panel-height` and `--collapsible-panel-width` are
  `auto` while the panel is open and at rest, and the content's size in pixels (`scrollHeight`,
  `scrollWidth`) while it opens or closes: set **before** the transition starts, so a recipe's
  `height: var(--collapsible-panel-height)` with `data-starting-style` / `data-ending-style` at
  `height: 0` transitions between two lengths (a transition from or to `auto` would jump).
- **Opening**: the Panel renders (or drops `hidden`) with `data-starting-style`; its size is
  measured and written; the next frame removes `data-starting-style`, so the transition runs from
  the starting style to the measured size; once every animation on the Panel has finished, the
  variables return to `auto` (the content may then change size freely).
- **Closing**: the size is measured and written, and the styles are applied (a style flush), then
  `data-ending-style` is set, so the transition runs from the measured size; once every animation
  on the Panel has finished it unmounts (or takes `hidden` when kept mounted).
- **Interrupted**: reopened while closing, the Panel drops `data-ending-style` without
  `data-starting-style` and transitions back from where it is to its measured size; closed while
  opening, it transitions from where it is to the ending style.
- **No transition on the first render**: a panel open from the start (`defaultOpen`, or `open`)
  renders with `auto` and no `data-starting-style`, so a page (and a server render) shows it at
  once.
- A panel with no transition or animation opens and closes at once.

## Find in page

With `hiddenUntilFound`, a closed panel is `hidden="until-found"`: the browser's find-in-page (and
a text fragment, `#:~:text=`) searches its content. On a match the browser fires `beforematch` on
the Panel and removes `hidden`; the Root then opens (`onOpenChange(true, { reason: "none" })`)
**with no transition** (the match is shown at once, Base UI). A controlled Root that keeps
`open` `false` gets `hidden="until-found"` back after the event. Browsers without
`hidden="until-found"` (it ships in Chromium) treat the attribute as `hidden`: the panel is
hidden and not searchable, and everything else works.

## RTL

Nothing changes.

## Server rendering

An open panel renders with its variables at `auto` and no transition state; a closed one renders
nothing (or `hidden`). React writes the `until-found` value once mounted (it renders `hidden` as a
boolean), so a server render has `hidden` and the hydrated page `hidden="until-found"`.

## Scenarios

The output prints `open: <true|false>` and `reason: <reason>` for the last `onOpenChange` of the
first Root (`none` before any).

### `/collapsible/basic`

- A Collapsible with a Trigger **"Recovery keys"** and a Panel holding the paragraphs
  "alpha-1234" and "beta-5678", closed;
- a Collapsible **disabled** and `defaultOpen`, with a Trigger **"Archived keys"** and a Panel
  holding the paragraph "gamma-9012";
- a button **"After collapsible"**.

Checks:

1. "Recovery keys" is a button with `aria-expanded="false"` and no `aria-controls`; no Panel of
   it is in the DOM.
2. A click on "Recovery keys": `aria-expanded="true"`, `aria-controls` names the Panel, which is
   visible with "alpha-1234" (`open: true`, `reason: trigger-press`); a second click closes it
   and the Panel leaves the DOM (`open: false`).
3. Focused, Enter opens it and Space closes it.
4. Tab from "Recovery keys" moves to "After collapsible": the panels hold nothing focusable and
   the disabled "Archived keys" is no tab stop.
5. "Archived keys" is disabled, `aria-expanded="true"`; its Panel is visible with "gamma-9012",
   with no `data-starting-style` and its variables at `auto` on the first render; a forced click
   does nothing.
6. With the recipe's transition: while the Panel opens, `--collapsible-panel-height` is its
   content height in pixels when `data-starting-style` is removed, then `auto` once the
   transition ended; while it closes, it is in pixels when `data-ending-style` is set, and the
   Panel stays in the DOM until the transition ended.
7. Axe finds no violation (closed, and open).

### `/collapsible/hidden-until-found`

- A Collapsible with a Trigger **"Shipping details"** and a Panel `hiddenUntilFound` holding the
  paragraph "Ships within two business days", closed;
- a Collapsible with a Trigger **"Return policy"** and a Panel `keepMounted` holding the paragraph
  "Returns are free for thirty days", closed.

Checks:

1. The "Shipping details" Panel is in the DOM with `hidden="until-found"`; the "Return policy"
   Panel with `hidden` (no value).
2. Finding "two business days" in the page (a text fragment, Chromium) opens "Shipping details":
   `aria-expanded="true"`, the paragraph visible, `open: true`, `reason: none`, and no
   `data-starting-style` on its Panel.
3. "Return policy": a click shows its Panel (no `hidden`); a second click hides it again
   (`hidden`), the element kept.
4. Axe finds no violation.

## Differences from Base UI

None in behaviour. Not offered here: Base UI's `onOpenChangeComplete` and its CSS keyframe
animation path (a recipe animates the panel with a transition; a keyframe `animation` still
delays the unmount until it ends, as every presence does).
