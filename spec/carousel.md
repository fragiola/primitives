# Carousel

## Purpose

A set of slides shown a page at a time (one slide, or several side by side), with Previous and
Next controls, optional slide picker Indicators, and an optional automatic rotation the user can
stop. The slides scroll natively, with CSS scroll snapping: a touch swipe or a trackpad scrolls
them, and a mouse can drag them.

**Scope: stage 4** (Epic #97, Issue #96). The APG's **carousel** pattern decides it, in both its
styles: the **basic** carousel (Previous and Next, a group of picker buttons: the APG's "grouped"
style) and the **tabbed** carousel (picker controls that are a tablist, the slides tabpanels).
Base UI has no Carousel; Zag/Ark's Carousel is the behaviour reference (read, never copied) for
what the APG does not decide (pages of several slides, the snapping, the mouse drag), recorded in
`docs/decisions.md` (D4, the Epic's stop condition).

The rotation follows the APG: it **stops** when any element in the carousel receives focus and
does not restart until the user presses the AutoplayTrigger; it **pauses** while the pointer
hovers the carousel (but its AutoplayTrigger) and resumes when it leaves, with the time it had
left (Toast's pause rule, Epic #61); the slides' container is `aria-live="off"` while rotating and
`"polite"` otherwise.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Carousel.Root | `div` | `carousel-root` | `role="region"`, `aria-roledescription="carousel"`; the app names it |
| Carousel.ItemGroup | `div` | `carousel-item-group` | the slides' scroll container and live region |
| Carousel.Item | `div` | `carousel-item` | one slide (`index`) |
| Carousel.PrevTrigger | `button` | `carousel-prev-trigger` | the page before |
| Carousel.NextTrigger | `button` | `carousel-next-trigger` | the page after |
| Carousel.IndicatorGroup | `div` | `carousel-indicator-group` | the slide picker controls |
| Carousel.Indicator | `button` | `carousel-indicator` | picks one page (`index`) |
| Carousel.AutoplayTrigger | `button` | `carousel-autoplay-trigger` | stops and starts the rotation |

One entry, `/carousel` (D8), built on no other component. Its DOM side is the toolkit's
`/carousel` (the pages, the scroll to a page and the page a scroll settled on, the mouse drag over
`/pointer`'s drag session, the hover and focus watch and the rotation timer, all native listeners);
the tabbed Indicators use `/collection`'s `tabsKeyTarget` and `/direction`, as Tabs does, never
Tabs' modules.

## API

**Carousel.Root**:

- `slideCount` (required): the number of slides (each Item's `index` is below it).
- `page` / `defaultPage` (`0`) / `onPageChange(page, details)`: the current page, from `0`
  (Zag's; a Steps step is from 0 too). A page outside the pages is clamped.
- `slidesPerPage` (`1`): the slides a page shows side by side.
- `slidesPerMove` (`slidesPerPage`): the slides a page moves by.
- `loop` (`false`): Previous on the first page goes to the last, Next on the last to the first.
- `orientation` (`"horizontal"`, or `"vertical"`: the app gives the ItemGroup its height).
- `spacing` (`"0px"`): the gap between slides, a CSS length.
- `variant` (`"basic"`): `"tabbed"` makes the IndicatorGroup a tablist, each Indicator a tab and
  each Item a tabpanel (one slide per page: `slidesPerPage` 1).
- `playing` / `defaultPlaying` (`false`) / `onPlayingChange(playing, details)`: whether the slides
  rotate. `defaultPlaying` `true` starts the rotation on mount.
- `delay` (`5000`, the APG example's): the time a page shows while rotating, in ms.
- `allowMouseDrag` (`true`): a mouse drag scrolls the slides.

**The pages.** A page starts at slide `0`, then every `slidesPerMove` slides, while a page still
shows `slidesPerPage` slides; the last page starts at `slideCount - slidesPerPage` (so it is
always full, as a snapped scroll ends there). With 5 slides, `slidesPerPage` 2 and `slidesPerMove`
2: pages at slides 0, 2 and 3. The slides in view are the current page's `slidesPerPage` slides.

**Changes.** `onPageChange` reports `next-press`, `previous-press` (the triggers), `item-press`
(an Indicator's press), `keyboard` (a tabbed Indicator's arrow, Home or End), `autoplay` (the
rotation), `drag` (a mouse drag), `swipe` (any other scroll the user made: touch, a trackpad, the
wheel) (spec/README.md, "Change details"). `onPlayingChange` reports `trigger-press` (the
AutoplayTrigger) and `focus-in` (focus entered the carousel and stopped the rotation).

**The rotation.** While `playing` and not paused, each `delay` moves to the next page, from the
last back to the first (the APG's rotation; `loop` is for the triggers). A change of page by any
other reason starts the delay again. Focus entering the carousel from outside it stops the
rotation (`playing` becomes `false`, reason `focus-in`); the AutoplayTrigger toggles it; the
pointer over the carousel, but over the AutoplayTrigger, pauses it (`data-paused`), and leaving
resumes it with the time it had left. A pointer press on the AutoplayTrigger focuses it without
stopping the rotation: the press itself toggles it.

**Carousel.Item**: `index` (required).

**Carousel.Indicator**: `index` (required): the page it picks.

**Carousel.AutoplayTrigger**: its children are the app's label, which changes with the state
("Stop slide rotation", "Start slide rotation"; the APG's label and no `aria-pressed`): React
`children` as a node or `(state) => node`, Vue the default slot's `{ state }`, Angular the
directive's `state()` (`exportAs`).

**Carousel.PrevTrigger**, **NextTrigger**, **ItemGroup**, **IndicatorGroup**: no props of their
own.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `role="region"`, `aria-roledescription="carousel"`, the app's `aria-label`; `data-orientation`; `data-playing` while rotating; `data-paused` while a hover pauses it; the structural CSS variables `--carousel-slides-per-page` and `--carousel-spacing` |
| ItemGroup | an `id`; `aria-live="off"` while playing, `"polite"` otherwise; `aria-atomic="false"`; `tabindex="0"` while it holds nothing Tab reaches (below); `data-orientation`; `data-dragging` during a mouse drag; a structural style: a grid of one row (one column when vertical) whose cells are a page's share of the width less the spacing, its own scrolling on that axis with `scroll-snap-type` mandatory (none during a drag) and no visible scrollbar (`scrollbar-width: none`, ScrollArea's rule: no CSS shipped) |
| Item | an `id`; basic: `role="group"`, `aria-roledescription="slide"`; tabbed: `role="tabpanel"` (no role description, the APG's tabbed carousel; named by the app's `aria-label` as the APG example's tabpanels are, not by its tab); the app's `aria-label` ("2 of 4", from its own formatter); out of view: `inert` and `aria-hidden="true"`; `data-inview` while in view; `data-index`; `scroll-snap-align: start` on a page's first slide |
| PrevTrigger, NextTrigger | `type="button"`; `aria-controls` the ItemGroup; `disabled` and `data-disabled` at the first (last) page unless `loop` |
| IndicatorGroup | basic: `role="group"`; tabbed: `role="tablist"`, `aria-orientation`; the app's `aria-label` ("Choose slide to display"); `data-orientation` |
| Indicator | `type="button"`; `data-current` on the current page's; basic: `aria-disabled="true"` on the current one (the APG grouped style: a reader still finds it in the tab order), its press does nothing; tabbed: `role="tab"`, `aria-selected`, `aria-controls` its slide, the roving `tabindex` (`0` on the selected tab, `-1` on the others) |
| AutoplayTrigger | `type="button"`; `data-playing` while playing |

The parts set no accessible name: the app names the Root, the slides, the triggers, the
IndicatorGroup and the Indicators.

## Keyboard

Tab and Shift+Tab move through the carousel's controls and the in-view slides' content (the
out-of-view slides are `inert`); Enter and Space press a button. While the in-view slides hold
nothing Tab reaches, the ItemGroup takes a tab stop itself (`tabindex="0"`, checked after each
page change), so a keyboard can scroll it as any scroll container (ScrollArea's rule, Epic #64;
axe's `scrollable-region-focusable`): its native arrow-key scroll settles like a swipe. The APG puts the
AutoplayTrigger first in the carousel's tab sequence: the app places it first.

In the tabbed variant the IndicatorGroup is one tab stop and its keys are the APG tabs': ArrowRight
and ArrowLeft (ArrowDown and ArrowUp when vertical) move to the next or previous tab and select it
(automatic activation), wrapping at the ends; Home and End to the first and last. In RTL the
horizontal arrows swap.

## Focus

No press moves the focus (the APG: the triggers can be pressed again and again); a tabbed arrow
key focuses the tab it selects. Focus entering the carousel stops the rotation.

## Pointer

A click presses a control. A touch swipe, a trackpad or the wheel scroll the ItemGroup natively;
once the scroll settles (`scrollend`, or 100 ms after the last `scroll`) the page whose first slide
is nearest the scroll position becomes the current one (`swipe`). With `allowMouseDrag`, a mouse
press on the ItemGroup (not on an interactive element: `/swipe`'s rule for a mouse) drags the
slides along its axis once it moved `/swipe`'s lock distance, snapping off (through `/pointer`'s
drag session: `/swipe`'s `watchSwipe` hands a move over a scroller to that scroller, and the
ItemGroup is one); on release the page nearest the position is chosen, or the next one in the
drag's direction after a flick, and the ItemGroup scrolls to it (`drag`); the click that ends a
drag is not delivered.

A page change scrolls the ItemGroup to its first slide: smoothly, or at once on mount and when the
user prefers reduced motion. The settling of a scroll of the carousel's own reports nothing, nor
does one that stops on its way (a later page change replaced it); the user's input on the
ItemGroup (a pointer, the wheel, a touch, a key) makes the next settling the user's.

## Animation

The native smooth scroll; no enter or exit states.

## RTL

The slides run from the inline start (the right): the first slide is rightmost, Next scrolls
leftwards, and the tabbed Indicators' ArrowLeft moves to the next tab. Direction comes from a
DirectionProvider, else the element's computed direction (spec/direction.md).

## Scenarios

The slides are 320 px wide boxes holding their number in large text ("Slide 1", ...), the
Items named by the app "1 of 4", ...

### `/carousel/basic`

A Carousel `aria-label="Featured"`, `slideCount` 4, uncontrolled: a PrevTrigger "Previous slide",
a NextTrigger "Next slide", four Items, and an IndicatorGroup "Choose slide to display" of four
Indicators "Slide 1" to "Slide 4". `?dir=rtl` renders it right to left.

Output: `page: <the last onPageChange page>` and `reason: <its reason>` (`none` before any).

Checks:

1. A region "Featured" with the role description "carousel"; one slide in the accessibility tree,
   "1 of 4", a `group` with the role description "slide"; the ItemGroup scrolled to slide 0 (by
   index: its scroll offset over a slide's width); "Previous slide" disabled; "Slide 1" has
   `aria-disabled="true"`; the slides' container is `aria-live="polite"`.
2. "Next slide": `page: 1`, `reason: next-press`, "2 of 4" is the slide in view, scrolled to
   slide 1; twice more: page 3, "Next slide" disabled.
3. "Slide 2" (an Indicator): `page: 1`, `reason: item-press`; a press on the current Indicator
   reports nothing.
4. A scroll the user made (the ItemGroup scrolled to slide 2's offset): `page: 2`,
   `reason: swipe`.
5. A mouse drag from the middle of the slide leftwards by more than half a slide (rightwards in
   RTL): `page: 1`, `reason: drag`.
6. RTL: slide 2 sits left of slide 1; "Next slide" scrolls to it.
7. Axe finds no violation.

### `/carousel/autoplay`

A Carousel `aria-label="Highlights"`, `slideCount` 3, `defaultPlaying`, `delay` 3000, an
AutoplayTrigger first (its label "Stop slide rotation" while playing, "Start slide rotation"
otherwise), a PrevTrigger "Previous slide", a NextTrigger "Next slide", three Items. The test fixes
the clock (Playwright's `page.clock`) before the page loads.

Output: `page:`, `reason:` as above, and `playing: <true|false>` with `playingReason: <its
reason>` (`none` before any).

Checks:

1. Playing: the button "Stop slide rotation"; the slides' container `aria-live="off"`; after
   3000 ms `page: 1`, `reason: autoplay`; after 6000 more, page 0 again (it wraps).
2. The pointer over the slides pauses it: 5000 ms pass with no change; leaving resumes it, and the
   page moves after the time it had left.
3. Focus entering the carousel (Tab to "Stop slide rotation") stops it: `playing: false`,
   `playingReason: focus-in`, the label "Start slide rotation", `aria-live="polite"`, and 6000 ms
   pass with no change.
4. Pressing "Start slide rotation": `playing: true`, `playingReason: trigger-press`, and the pages
   rotate again; pressing it again stops them.
5. Axe finds no violation.

### `/carousel/tabbed`

A Carousel `aria-label="Features"`, `variant="tabbed"`, `slideCount` 3, uncontrolled: three Items
and an IndicatorGroup "Choose slide to display" of three Indicators "Slide 1" to "Slide 3".
`?dir=rtl` renders it right to left.

Output: `page:` and `reason:` as above.

Checks:

1. A tablist "Choose slide to display" of three tabs, "Slide 1" selected and the only tab stop;
   the slide in view is a `tabpanel` "1 of 3", controlled from its tab.
2. ArrowRight on the focused tab: "Slide 2" focused and selected, `page: 1`, `reason: keyboard`;
   End: "Slide 3"; ArrowRight wraps to "Slide 1"; Home stays there.
3. RTL: ArrowLeft moves to the next tab.
4. A click on "Slide 3": `page: 2`, `reason: item-press`.
5. Axe finds no violation.

### `/carousel/multiple`

A Carousel `aria-label="Products"`, `slideCount` 5, `slidesPerPage` 2, `slidesPerMove` 2,
`spacing="16px"`, uncontrolled, with a PrevTrigger "Previous slide" and a NextTrigger "Next
slide". The slides are named "1 of 5", ...

Output: `page:` and `reason:` as above.

Checks:

1. Two slides in view, "1 of 5" and "2 of 5"; three pages (the Next trigger reaches page 2 and
   is disabled there).
2. "Next slide": "3 of 5" and "4 of 5" in view; again: "4 of 5" and "5 of 5" (the last page
   starts at slide 3).
3. Axe finds no violation.

### `/carousel/vertical`

A Carousel `aria-label="Stories"`, `orientation="vertical"`, `slideCount` 3, a 240 px tall
ItemGroup, `loop`, with a PrevTrigger "Previous slide" and a NextTrigger "Next slide".

Output: `page:` and `reason:` as above.

Checks:

1. "1 of 3" in view, the ItemGroup scrolled vertically to slide 0; "Previous slide" enabled
   (`loop`).
2. "Previous slide": `page: 2` (it loops), scrolled down to slide 2; "Next slide": page 0.
3. Axe finds no violation.

## Differences from Base UI

Base UI has no Carousel; the behaviour above is the APG's, with the details decided as the
Purpose says.
