# ScrollArea

## Purpose

A scrolling container with custom scrollbars: the content scrolls natively (keyboard, wheel,
touch, the browser's own momentum and find-in-page), and the native scrollbars are replaced by
parts the app styles, which a pointer drags (the thumb) and presses (the track). It is no widget
of its own: it adds no role, no key and no focus stop to what a scrollable `div` already has,
except the stop a scrollable region with nothing focusable inside needs.

**Scope: stage 2** (Epic #64, Issue #62). The APG has no scroll area pattern: Base UI's
`ScrollArea` (1.9, `references/base-ui`) decides the parts, the attributes, the CSS variables and
the pointer (D4); WCAG 2.1.1 and axe's `scrollable-region-focusable` decide the viewport's tab
stop.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| ScrollArea.Root | `div` | `scroll-area-root` | `role="presentation"`; the box the scrollbars are placed in |
| ScrollArea.Viewport | `div` | `scroll-area-viewport` | the element that scrolls, natively |
| ScrollArea.Content | `div` | `scroll-area-content` | `role="presentation"`; the scrolled content, measured |
| ScrollArea.Scrollbar | `div` | `scroll-area-scrollbar` | `aria-hidden="true"`; the track of one axis (`orientation`) |
| ScrollArea.Thumb | `div` | `scroll-area-thumb` | inside a Scrollbar; its size and position follow the scroll |
| ScrollArea.Corner | `div` | `scroll-area-corner` | `aria-hidden="true"`; the square where both scrollbars meet |

```
Root
├── Viewport
│   └── Content
├── Scrollbar (vertical)
│   └── Thumb
├── Scrollbar (horizontal)
│   └── Thumb
└── Corner
```

One entry, `/scroll-area` (D8), built on no other component. Its measurement, the thumb drag, the
track press and the scrollbar's wheel are the toolkit's `/scroll-area` (`createScrollArea`, which
writes the measured CSS variables and the thumb's transform and reports the state), so each
framework holds the state and renders the attributes only. No other entry imports it.

## API

**ScrollArea.Root**:

- `overflowEdgeThreshold` (`0`): how far, in pixels, the content must be scrolled from an edge
  before that edge's `data-overflow-*` attribute is set. A number for every edge, or
  `{ xStart, xEnd, yStart, yEnd }` (a missing edge is `0`).

**ScrollArea.Viewport**, **ScrollArea.Content**, **ScrollArea.Thumb**, **ScrollArea.Corner**: no
props of their own.

**ScrollArea.Scrollbar**:

- `orientation` (`vertical`): `vertical` or `horizontal`; a ScrollArea has at most one of each.
- `keepMounted` (`false`): rendered even when its axis does not overflow (it is hidden,
  `visibility: hidden`, until the first measurement).

Every other attribute and handler is forwarded; handlers compose internal first, then the
consumer's (AGENTS.md rule 7). The consumer names the viewport when the content needs a name
(`role="region"` and `aria-label` on the Viewport, as the scenarios do): the primitive gives no
name.

## State attributes and ARIA

The overflow attributes, on the Root, the Viewport, the Content and each Scrollbar:

| attribute | when |
| --- | --- |
| `data-has-overflow-x`, `data-has-overflow-y` | the content is wider (taller) than the viewport |
| `data-overflow-x-start`, `data-overflow-x-end` | the content is scrolled more than the threshold from the inline start (is more than the threshold from the inline end); logical: in RTL, the start is the right edge |
| `data-overflow-y-start`, `data-overflow-y-end` | the same from the top and the bottom |
| `data-scrolling` | the user scrolls (a wheel, a key, a touch, a thumb drag, a track press), until 500 ms after the last scroll; a programmatic scroll (`scrollTop = ...`) sets none. On a Scrollbar and a Thumb: its own axis only |

| part | attributes |
| --- | --- |
| Root | `role="presentation"`; the overflow attributes; structural style `position: relative`, and `--scroll-area-corner-width` / `--scroll-area-corner-height` (the corner's size in pixels: the vertical scrollbar's width and the horizontal one's height while both are shown, else `0px`) |
| Viewport | the overflow attributes; `tabindex="0"` while the content overflows **and** holds no focusable element ("Focus"); structural style `overflow: scroll`, `scrollbar-width: none` (the native scrollbars hidden), and `--scroll-area-overflow-x-start`, `-x-end`, `-y-start`, `-y-end`: the distance in pixels to each edge (`0px` on an axis that does not overflow) |
| Content | `role="presentation"`; the overflow attributes; structural style `min-width: fit-content` (wide content widens it, so the horizontal overflow is measured) |
| Scrollbar | `aria-hidden="true"`; `data-orientation`; `data-hovering` while the pointer (not a touch) is over the Root; `data-scrolling` (its axis); the overflow attributes; structural style `position: absolute`, `touch-action: none`, `user-select: none`; vertical: `top: 0`, `bottom: var(--scroll-area-corner-height)`, `inset-inline-end: 0`, and `--scroll-area-thumb-height`; horizontal: `inset-inline-start: 0`, `inset-inline-end: var(--scroll-area-corner-width)`, `bottom: 0`, and `--scroll-area-thumb-width` |
| Thumb | `data-orientation`; `data-scrolling` (its axis); structural style `height: var(--scroll-area-thumb-height)` (vertical) or `width: var(--scroll-area-thumb-width)` (horizontal), and a `transform: translate3d(...)` that places it along the track |
| Corner | `aria-hidden="true"`; structural style `position: absolute`, `bottom: 0`, `inset-inline-end: 0`, `width: var(--scroll-area-corner-width)`, `height: var(--scroll-area-corner-height)` |

**Measurement.** The thumb's size is the track's room (its size less its padding and the thumb's
margins) times the visible fraction (`clientHeight / scrollHeight`), never less than 16 px; its
offset is the scroll's fraction of its range times the track's room left. The measurement runs on
mount, on every scroll, when the viewport or the content is resized (`ResizeObserver`, through
the element's `defaultView`), when a scrollbar or a thumb mounts, and when the direction or the
threshold changes. A position within 1 px of an edge counts as the edge.

**Hidden when nothing overflows.** A Scrollbar is rendered only while its axis overflows (unless
`keepMounted`), and the Corner only while both do. On a server nothing is measured: the parts
render with no overflow attribute, no scrollbar, no corner and no `tabindex`, and the first
measurement after hydration adds them (spec/README.md, "Server rendering").

## Keyboard

The browser's own, on the Viewport (it is the element that scrolls): the arrows, Page Up,
Page Down, Space, Home and End scroll it while it, or an element in it, has the focus. The
Scrollbars and the Thumbs take no key and no focus (`aria-hidden`, as a native scrollbar).

## Focus

The Viewport takes a tab stop (`tabindex="0"`) only while it overflows and nothing in it can take
the focus: a keyboard user then reaches it and scrolls it (WCAG 2.1.1, axe's
`scrollable-region-focusable`). When its content holds a focusable element (a link, a button,
an input, an element with a `tabindex`), Tab reaches those, the browser scrolls each into view,
and the Viewport takes no stop of its own. Whether the content holds one is checked at each
measurement.

A press on a Scrollbar or a Thumb moves no focus (its `mousedown` default is prevented, as a
native scrollbar's).

## Pointer

- **Wheel and touch** scroll the Viewport natively. A wheel over a Scrollbar scrolls its axis
  (with no Ctrl), and lets the event go on to the page once the viewport is at that edge.
- **Thumb drag**: a primary-button press on a Thumb captures the pointer; each move scrolls the
  viewport by the move's share of the track's room left (a move of the whole room scrolls the
  whole range). The drag ends on release, cancel or a lost capture; `data-scrolling` stays until
  then and goes at once after. CSS scroll snapping is turned off during the drag (the inline
  `scroll-snap-type: none`) and restored after it.
- **Track press**: a primary-button press on a Scrollbar outside its Thumb scrolls the viewport so
  the Thumb's center is under the pointer, then goes on as a thumb drag until the release.
- **Hover**: `data-hovering` on the Scrollbars while a mouse or pen is over the Root, so a recipe
  can show them only then.

## Animation

None of its own; a recipe fades the scrollbars with `data-hovering` and `data-scrolling`.

## RTL

The vertical Scrollbar and the Corner sit at the inline end (`inset-inline-end`: the left edge in
RTL), and the horizontal Thumb starts at the right edge. The x edges are logical: in RTL,
`data-overflow-x-start` is set once the content is scrolled from its right edge, and
`--scroll-area-overflow-x-start` measures from it (Chromium's negative `scrollLeft` is read as a
distance from the start). A thumb drag or a track press toward the left scrolls toward the end.
The direction is the DirectionProvider's, else the Viewport's computed `direction`.

## Scenarios

### `/scroll-area/basic`

- Buttons **"Toggle items"** and **"Toggle width"**, then a ScrollArea `h-48`, `w-64` (the toggle
  widens it to `w-[48rem]`): its Viewport `role="region"`, `aria-label="Changelog"`; its Content
  holds 40 lines **"Release 1.<n>: ..."** (n from 40 down to 1; the toggle leaves 3), each
  `white-space: nowrap` and wider than `w-64`, and no focusable element; a vertical and a
  horizontal Scrollbar, each with its Thumb, and a Corner.
- A second ScrollArea of the same size, its Viewport `role="region"`, `aria-label="Shortcuts"`,
  with 3 short lines: nothing overflows.

Checks:

1. "Changelog" overflows on both axes: both Scrollbars, both Thumbs and the Corner are rendered;
   its Viewport has `tabindex="0"`; the Thumb's height over its track's is the viewport's
   `clientHeight` over its `scrollHeight`.
2. The keyboard scrolls it natively: focused, End reaches the bottom, Home the top, ArrowDown
   moves down.
3. The wheel over the viewport scrolls it, and the vertical Thumb moves down its track in
   proportion (its offset over the room left equals `scrollTop` over the range).
4. Dragging the vertical Thumb down by half the room left scrolls half the range; dragging the
   horizontal Thumb by the whole room scrolls the whole width.
5. A press near the bottom of the vertical track scrolls until the Thumb's center is under the
   pointer; a press on a track moves no focus.
6. "Shortcuts" does not overflow: no Scrollbar, no Corner, no `tabindex` on its Viewport.
7. "Toggle items" (3 lines): the vertical Scrollbar and the Corner unmount, the horizontal one
   stays; "Toggle width" then: no Scrollbar is left and the Viewport loses its `tabindex`; both
   again bring them back (the content and the viewport resized).
8. Axe finds no violation.

### `/scroll-area/basic?dir=rtl`

The same page in a right-to-left document: the vertical Scrollbar sits at the Root's left edge;
at rest the horizontal Thumb touches its track's right edge; dragging it left scrolls toward the
end (`data-overflow-x-start` set, a negative `scrollLeft`).

### `/scroll-area/links`

A ScrollArea `h-48`, `w-64`, vertical only (one Scrollbar with its Thumb), its Viewport
`role="region"`, `aria-label="Chapters"`, holding 20 links **"Chapter <n>"** (`href="#chapter-<n>"`),
one per line; then a button **"After"**.

Checks:

1. The Viewport has no `tabindex`: Tab from the page start reaches "Chapter 1".
2. Tabbing to "Chapter 20" scrolls the viewport to its bottom (the browser's own), and the Thumb
   follows it to the end of its track.
3. Axe finds no violation.

## Differences from Base UI

| difference | decision |
| --- | --- |
| Base UI's Viewport takes `tabindex="0"` whenever it overflows (`-1` otherwise) | only while it overflows and holds nothing focusable (the Issue: "the viewport focusable when it has no focusable content"), no `tabindex` otherwise: a region of links needs no stop of its own (WCAG 2.4.3, fewer stops) |
| Base UI renders a `<style>` element that hides the native scrollbars (`scrollbar-width: none` and `::-webkit-scrollbar`) | an inline `scrollbar-width: none` on the Viewport: no CSS shipped (AGENTS.md); `::-webkit-scrollbar` cannot be inline, so a Safari older than 18.2 shows its native scrollbars too (a recipe may add the rule) |
| Base UI registers the `--scroll-area-overflow-*` properties as non-inherited (`CSS.registerProperty`, once per realm) | not registered: a global side effect (AGENTS.md rule 6); the variables inherit, as any custom property |
| Base UI's Scrollbar and Corner sizes are React state, written as inline styles | the toolkit writes the CSS variables on the elements (`--scroll-area-corner-*` on the Root, `--scroll-area-thumb-*` on the Scrollbars) and the Corner reads them (`var(...)`): one measurement, the same DOM in every framework |
| Base UI's thumb shrinks while the viewport overscrolls (Safari's rubber band) | not done: an overscroll keeps the thumb at its edge (no `scrollTop` beyond the range outside Safari) |
| Base UI's `data-id` attributes (`<id>-viewport`, `<id>-scrollbar`) | not rendered: no part needs them |
