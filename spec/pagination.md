# Pagination

## Purpose

Moves between the pages of a paged list: a results table, a search, an archive. A `nav` landmark
holds a button (or a link) for each page in a range around the current one, the first and last
pages, ellipses for the pages left out, and the Previous, Next, First and Last controls. It holds
no list of its own: the app renders the rows of the current page.

**Scope: stage 2** (Epic #64, Issue #63). The APG has no pagination pattern and Base UI has no
Pagination: the APG-closest behaviour is decided here (D4, the Epic's stop condition) and
recorded in `docs/decisions.md`:

- the APG's **landmark regions** decide the root: a `navigation` landmark the app names
  (`aria-label`), as the APG's breadcrumb (`nav` + `aria-label`) and WAI's own page navigation;
- the APG's **breadcrumb** decides the current page: `aria-current="page"` on it, never a
  `selected` or `pressed` state;
- each control is a native **button** (the APG's button pattern) or, through `render`, a link
  (the APG's link pattern); a disabled control is a native disabled button, or an
  `aria-disabled` link;
- the **keyboard** is the browser's: every control is in the tab order (no roving focus, no arrow
  keys), as a list of links in a `nav` is; the APG gives arrows only to composite widgets, which
  a pagination is not.

The behaviour references (`docs/catalog.md`: Zag/Ark's and Bits UI's pagination; React Aria has
none) were read, never copied; they agree on the range below.

## Anatomy

| part | element | `data-primitives-part` | notes |
| --- | --- | --- | --- |
| Pagination.Root | `nav` | `pagination-root` | the landmark; holds the page and the range |
| Pagination.Item | `button` | `pagination-item` | a page; `aria-current="page"` on the current one |
| Pagination.Ellipsis | `span` | `pagination-ellipsis` | stands for the pages left out |
| Pagination.Previous | `button` | `pagination-previous` | the page before |
| Pagination.Next | `button` | `pagination-next` | the page after |
| Pagination.First | `button` | `pagination-first` | the first page |
| Pagination.Last | `button` | `pagination-last` | the last page |

One entry, `/pagination` (D8), built on no other component. The range is the toolkit's
`/pagination` (`paginationRange`, `pageCount`: pure math), which no other entry imports.

## API

**Pagination.Root**:

- `page` / `defaultPage` (`1`) / `onPageChange(page, details)`: the current page, from 1
  (controlled and uncontrolled, spec/README.md). A page outside `[1, count]` is clamped.
- `count`: the number of pages. Or `total` and `pageSize` (`10`): `count` is
  `ceil(total / pageSize)`. Never less than 1 (an empty list has one, empty, page).
- `siblingCount` (`1`): the pages shown on each side of the current one.
- `boundaryCount` (`1`): the pages always shown at each end.
- `disabled` (`false`): every control is disabled.
- Children: a function of `{ items, page, count }` (React; Vue: the default scoped slot; Angular:
  the root directive's `items()`, `currentPage()` and `pageCount()` signals through `exportAs`,
  since `page` and `count` are its inputs), where each
  item is `{ type: "page", value }` or `{ type: "ellipsis", position: "start" | "end" }`, in
  order, to render as Items and Ellipses.

**Pagination.Item**: `value` (required): its page. `nativeButton` (`true`): `false` when `render`
gives a link (or another element that is no button): the part adds no `type` and no `disabled`.

**Pagination.Previous**, **Next**, **First**, **Last**: `nativeButton` (`true`), as the Item's.

**Pagination.Ellipsis**: no props of its own; its children are its text (`…`, the app's).

A press on an Item, or on an enabled Previous, Next, First or Last, calls `onPageChange` with the
page and the details `{ reason, event }`: `item-press`, `previous-press`, `next-press`,
`first-press` or `last-press` (spec/README.md, "Change details"). An Item of the current page
reports nothing. A link's own navigation is not prevented: the app's router, or the `href`, goes
on.

### The range

`paginationRange({ page, count, siblingCount, boundaryCount })` returns the items in order:

- When `count` is at most `2 × boundaryCount + 2 × siblingCount + 3`, every page.
- Otherwise always `2 × boundaryCount + 2 × siblingCount + 3` items: the `boundaryCount` first
  pages, a slot, the window of `2 × siblingCount + 1` pages around the current one (kept whole
  near the ends: it slides inward rather than shrinks), a slot, the `boundaryCount` last pages.
  A slot is an ellipsis, or the one page it would hide when it hides only one (no ellipsis ever
  stands for a single page).

With `count` 10, `siblingCount` 1, `boundaryCount` 1: page 1 gives `1 2 3 4 5 … 10`, page 5
gives `1 … 4 5 6 … 10`, page 10 gives `1 … 6 7 8 9 10`. With `boundaryCount` 0 and page 5:
`… 4 5 6 …`.

## State attributes and ARIA

| part | attributes |
| --- | --- |
| Root | `aria-label` (the app's); `data-disabled` |
| Item | `aria-current="page"` and `data-current` on the current page; `type="button"` (a native button); `data-disabled`; `disabled` (a native button) or `aria-disabled="true"` (a link) while disabled |
| Previous, First | disabled on the first page: `disabled` (a native button) or `aria-disabled="true"` (a link), `data-disabled` |
| Next, Last | disabled on the last page, the same |
| Ellipsis | none |

The controls have no accessible name of their own: the app names Previous, Next, First and Last
(`aria-label`, or text), and an Item is named by its text (its page number) unless the app gives
another name ("Page 5").

## Keyboard

The browser's: Tab and Shift+Tab move through the enabled controls in document order; Enter (and
Space on a button) presses one. A disabled button is out of the tab order (native); a disabled
link stays in it, `aria-disabled`, and its press does nothing (its default is prevented).

## Focus

A press moves no focus. When the focused control becomes disabled (Next on the last page) the
browser's rule applies: a disabled button loses the focus to the document's body. An app that
wants the focus kept moves it itself.

## Pointer

A click presses a control (a native button's, or a link's). A disabled link's click is prevented
and reports nothing.

## Animation

None.

## RTL

Nothing changes in the DOM: Previous and Next stay before and after the pages in document order,
so they read from the inline start; the app's icons follow the direction.

## Scenarios

### `/pagination/basic`

A Pagination `aria-label="Results pages"`, `count` 10, `page` held by the fixture starting at 5
(`onPageChange` sets it), `siblingCount` and `boundaryCount` at their defaults: a First
(`aria-label="First page"`), a Previous (`"Previous page"`), the Items (their page number as
text) and Ellipses (`…`), a Next (`"Next page"`) and a Last (`"Last page"`).

Output: `page: <the page>` and `reason: <the last onPageChange reason>` (`none` before any).

Checks:

1. A `navigation` named "Results pages" with the buttons `1`, `4`, `5`, `6`, `10` and two
   ellipses between them; button `5` has `aria-current="page"`, no other has it.
2. A click on `6`: `page: 6`, `reason: item-press`, `aria-current` on `6`, the range
   `1 … 5 6 7 … 10`.
3. "Next page": `reason: next-press`, page 7; "Last page": page 10, the range `1 … 6 7 8 9 10`,
   and "Next page" and "Last page" are disabled; "First page": page 1, `reason: first-press`,
   "Previous page" and "First page" disabled, the range `1 2 3 4 5 … 10`.
4. "Previous page" from page 5: `reason: previous-press`, page 4.
5. The keyboard: Tab moves from "First page" through "Previous page" and the page buttons; Enter
   on `4` reaches page 4; a press on the current page reports nothing.
6. Axe finds no violation.

### `/pagination/links`

A Pagination `aria-label="Archive pages"`, `total` 95, `pageSize` 10 (10 pages), uncontrolled
with `defaultPage` 1, `siblingCount` 2, `boundaryCount` 0: a Previous rendered as a link
(`aria-label="Previous page"`, `href="#previous"`), the Items rendered as links
(`href="#page-<n>"`), and a Next link (`aria-label="Next page"`, `href="#next"`), all with
`nativeButton` `false`.

Output: `page: <the last onPageChange page>` (`none` before any).

Checks:

1. Links `1` to `6`, then one ellipsis; link `1` has `aria-current="page"`; "Previous page" has
   `aria-disabled="true"` and no `disabled` attribute.
2. A click on "Previous page" reports nothing and leaves the URL's hash empty.
3. A click on `6`: `page: 6`, the hash `#page-6`, `aria-current` on `6`, the range
   `… 4 5 6 7 8 …` (no boundary page).
4. Axe finds no violation.

## Differences from Base UI

Base UI has no Pagination; the behaviour above is this library's, decided as the Purpose says.
