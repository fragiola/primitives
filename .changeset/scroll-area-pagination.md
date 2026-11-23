---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

ScrollArea, Pagination and AspectRatio, natively in React, Vue and Angular, each in its own entry, completing stage 2. `/scroll-area` (`Root`, `Viewport`, `Content`, `Scrollbar`, `Thumb`, `Corner`): native scrolling (keyboard, wheel, touch) with custom scrollbars whose thumb drags and whose track takes a press, a scrollbar rendered only while its axis overflows (`keepMounted`), `data-scrolling`, `data-hovering`, the overflow attributes (`data-has-overflow-*`, `data-overflow-{x,y}-{start,end}`, logical in RTL, `overflowEdgeThreshold`) and the `--scroll-area-overflow-*`, `--scroll-area-thumb-*` and `--scroll-area-corner-*` variables, and a viewport tab stop only while it overflows with nothing focusable in it. `/pagination` (`Root`, `Item`, `Ellipsis`, `Previous`, `Next`, `First`, `Last`): a `nav` landmark with `page`/`defaultPage`/`onPageChange`, `count` or `total` and `pageSize`, `siblingCount`, `boundaryCount`, `aria-current="page"`, buttons or links (`nativeButton`), disabled edges. `/aspect-ratio`: one box at a `ratio`. The toolkit gains `/scroll-area` (`createScrollArea`, the scroll area's measurement and pointer) and `/pagination` (`paginationRange`, `pageCount`, `clampPage`), which only these components import.
