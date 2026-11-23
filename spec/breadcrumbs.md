# Breadcrumbs

## Purpose

The trail of links to the parent pages of the current page, in hierarchical order, before a
page's main content. A `nav` landmark the app names holds an ordered list of links; the last item
is the current page. A long trail may collapse its middle into an Ellipsis the app opens as a
Menu.

**Scope: stage 4** (Epic #97, Issue #95). The APG's **breadcrumb** pattern decides it: a
`navigation` landmark labelled by the app (`aria-label`), an ordered list of links, and
`aria-current="page"` on the link to the current page (optional on a current page that is no
link). Its keyboard is "not applicable": the browser's Tab through the links. Base UI has no
Breadcrumbs; where the APG says nothing (the separators, the collapsed middle), the APG-closest
options are decided here and recorded in `docs/decisions.md`; React Aria's and Ark's breadcrumbs
were read as behaviour references, never copied.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Breadcrumbs.Root | `nav` | `breadcrumbs-root` | the landmark; the app names it |
| Breadcrumbs.List | `ol` | `breadcrumbs-list` | the trail, in order |
| Breadcrumbs.Item | `li` | `breadcrumbs-item` | one step of the trail |
| Breadcrumbs.Link | `a` | `breadcrumbs-link` | a parent page: Link's behaviour ([link.md](link.md)) |
| Breadcrumbs.Current | `span` | `breadcrumbs-current` | the current page when it is no link |
| Breadcrumbs.Separator | `li` | `breadcrumbs-separator` | between two Items, hidden from assistive technology |
| Breadcrumbs.Ellipsis | `button` | `breadcrumbs-ellipsis` | stands for the collapsed middle; the app opens its Menu with it |

One entry, `/breadcrumbs` (D8), built on no other component: the Link part shares Link's behaviour
through each framework's shared code, never `/link`'s entry, and the Ellipsis never imports Menu
(the app composes them, below).

## API

**Breadcrumbs.Root**, **List**, **Item**: no props of their own; every attribute is forwarded.

**Breadcrumbs.Link**: `current` (`false`): `aria-current="page"` (the APG's link to the current
page); `disabled` (`false`): as Link's. A router link through `render` (React), `as` (Vue) or on
the router's anchor (Angular: `<a routerLink="/docs" breadcrumbsLink>`), as Link's.

**Breadcrumbs.Current**: no props of its own; it is the current page that is no link, with
`aria-current="page"` (the APG makes it optional there; it is set, so a reader hears the same
state either way).

**Breadcrumbs.Separator**: its children are the app's (`/`, `›`, an icon). An `li` between two
Items, so the list holds only list items (the HTML content model of `ol`), with
`aria-hidden="true"`: a reader counts and reads only the Items.

**Breadcrumbs.Ellipsis**: a native `button` (`type="button"`) the app names ("Show the hidden
pages") and composes with a Menu's trigger: React `<Breadcrumbs.Ellipsis render={<Menu.Trigger
/>}>`, Vue `<Breadcrumbs.Ellipsis :as="Menu.Trigger">`, Angular `<button menuTrigger
breadcrumbsEllipsis>`; the Menu's items are the app's links to the collapsed pages. The Menu
gives it `aria-haspopup`, `aria-expanded` and its keys (spec/menu.md); the Ellipsis gives the
element and its place in the trail.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `aria-label` (the app's) |
| Link | Link's: `aria-current="page"` and `data-current` when `current`; `aria-disabled="true"` and `data-disabled` when `disabled` |
| Current | `aria-current="page"` |
| Separator | `aria-hidden="true"` |
| Ellipsis | `type="button"`; the Menu's attributes when composed |

## Keyboard

The browser's: Tab and Shift+Tab move through the links and the Ellipsis in document order;
Enter follows a link; Enter or Space presses the Ellipsis, whose Menu then takes the keys
(spec/menu.md).

## Focus

Nothing moves the focus but the Menu (spec/menu.md: its first item on a keyboard open, back to
the Ellipsis on close).

## Pointer

A click follows a link (Link's rules); a click on the Ellipsis opens its Menu.

## Animation

None.

## RTL

Nothing changes in the DOM: the trail reads from the inline start; the app's separator icons
follow the direction.

## Scenarios

### `/breadcrumbs/basic`

A Breadcrumbs `aria-label="Breadcrumb"`: Items "Home" (a Link, `href="#home"`), "Docs" (a Link,
`href="#docs"`), "Components" (a Link, `href="#components"`, `disabled`) and "Breadcrumbs" (a
Link, `href="#breadcrumbs"`, `current`), with a Separator (`/`) between each two Items.

Checks:

1. A `navigation` named "Breadcrumb" holding a list of four list items (the Separators are hidden
   from assistive technology); the links "Home", "Docs", "Components" and "Breadcrumbs".
2. "Breadcrumbs" has `aria-current="page"`, no other link has it; "Components" has
   `aria-disabled="true"`.
3. A click on "Docs" moves the hash to `#docs`; a click on "Components" moves nothing.
4. Axe finds no violation.

### `/breadcrumbs/collapsed`

A Breadcrumbs `aria-label="Breadcrumb"`: "Home" (a Link, `href="#home"`), an Item holding an
Ellipsis named "Show the hidden pages" composed with a Menu's trigger, whose Menu holds "Docs"
and "Components" (menu items that set the output), then "Guides" (a Link, `href="#guides"`) and
"Routing" (a Current), with Separators (`/`).

Output: `chosen: <the last menu item chosen>` (`none` at first).

Checks:

1. The list holds four list items; "Routing" has `aria-current="page"` and is no link; the
   Ellipsis is a button named "Show the hidden pages" with `aria-haspopup="menu"`.
2. A click on the Ellipsis opens a menu holding "Docs" and "Components"; choosing "Components"
   closes it (`chosen: Components`) and returns the focus to the Ellipsis.
3. Enter on the focused Ellipsis opens the menu with its first item focused; Escape closes it.
4. Axe finds no violation, with the menu open too.

## Differences from Base UI

Base UI has no Breadcrumbs; the behaviour above is the APG's, with the details decided as the
Purpose says.
