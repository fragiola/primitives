# Direction

## Purpose

Tells the components the reading direction (`ltr` or `rtl`) without reading the DOM: a provider
around a part of the app, and a way to read it. Every component that depends on the direction
(Tabs, Slider, Menu, Combobox's chips, the calendars, and every positioned popup through its
`inline-start` / `inline-end` sides) takes the provider's direction when there is one, and the
element's computed `direction` (from the document's `dir`, or CSS) otherwise. Base UI's
`DirectionProvider` (1.9) is the model (D4); the APG only says what changes in RTL, which each
component's spec states.

The provider sets no `dir` attribute and no style: the app still sets `dir` on its document (or
an element) so the page's layout flows right to left. The provider is for an app that knows its
direction before the DOM does (a server-rendered page, a subtree whose direction the app
switches), or that renders the components where the computed style is not the reading direction.

It is a global provider in its own entry (D8, `docs/handoff.md` §4): `/direction` in every
framework package. The provider references no component, and a component reads it through a
context the entry does not own (the bundle guard reads `/direction` alone and finds no component
code in it).

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| DirectionProvider | none | | renders only its children (Angular: a directive on the consumer's element) |

## API

**DirectionProvider**: `direction` (`"ltr"`): the direction of everything inside it. A nested
provider wins inside it.

**Reading it**:

| framework | name | returns |
| --- | --- | --- |
| React | `useDirection()` | the nearest provider's direction, or `"ltr"` without one |
| Vue | `useDirection()` | a computed ref of the same |
| Angular | `injectDirection()` | a signal of the same (an injection context: a constructor or a field initializer) |

Each framework expresses the provider in its own idiom:

| framework | provider |
| --- | --- |
| React | `<DirectionProvider direction="rtl">…</DirectionProvider>` |
| Vue | `<DirectionProvider direction="rtl">…</DirectionProvider>` (`provide`) |
| Angular | the `[directionProvider]` directive on the consumer's own element (`<div directionProvider="rtl">`), or `provideDirection("rtl")` in an injector's `providers` (an application, a route, a component) |

**What the components do with it.** A component that needs the direction asks for the provider's
first; without a provider around it, it reads the computed `direction` of its element when it
needs it (a key press, a positioning), as before (`@fragiola/primitives/direction`'s
`getDirection(element, provided)`). Measurements that follow the layout stay with the computed
direction: the Tabs Indicator's position variables are measured in the List's own box.

## State attributes and ARIA

None: the provider renders nothing.

## Keyboard

Nothing of its own: each component's RTL keys follow the direction it reads.

## Focus

Nothing of its own.

## Pointer

Nothing of its own. A Slider maps the pointer with the direction it reads: an app that provides
`rtl` sets `dir="rtl"` too, so the track's layout and the mapping agree.

## Animation

None.

## RTL

This page is about it.

## Scenarios

### `/direction/provider`

A document with **no** `dir` (left to right): a DirectionProvider `direction="rtl"` around the
scenario's output and four components. Output: `direction: rtl` (`useDirection()` /
`injectDirection()` read inside the provider).

- the Tabs of [`/tabs/automatic`](tabs.md#tabsautomatic) ("Account", "Password", "Billing"
  disabled, "Team"; the Indicator; the panels);
- a Slider **"Volume"** (`aria-label`), `defaultValue` `50`, its Control 200 px wide;
- a Menu, Trigger **"File"**, items **"New file"**, a SubmenuTrigger **"Share"** whose submenu has
  **"Email"** and **"Link"**, its Trigger 24 rem from the page's left edge (`ms-96`), so a submenu
  opening to the left has room and does not flip;
- a Calendar (en-US, "today" 2026-11-20) with **"Previous month"** / **"Next month"**.

Checks:

1. The output reads `direction: rtl`; the document has no `dir`.
2. Tabs: focus "Account", ArrowLeft: "Password" is selected; ArrowRight: "Account".
3. Slider: focused, ArrowRight → 49, ArrowLeft → 50.
4. Menu: open "File" with ArrowDown, move to "Share", ArrowLeft opens the submenu with "Email"
   focused; the submenu's popup lies to the left of "Share" (its right edge at or before the
   trigger's left edge: `inline-end` is the left in RTL); ArrowRight closes it and focuses
   "Share".
5. Calendar: focus November 20, ArrowRight → November 19, ArrowLeft → November 20.
6. Axe finds no violation.

## Differences from Base UI

- **Angular's `provideDirection()`**, besides the directive: Angular's providers are an injector's,
  not only an element's.
- **The computed direction as fallback**: Base UI's components without a provider read `ltr`;
  here they read the element's computed `direction`, so a document's `dir` keeps working with no
  provider (the RTL scenarios of every spec).
