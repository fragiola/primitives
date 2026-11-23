---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Virtual and async lists, natively in React, Vue and Angular, each an opt-in entry of its own, so a Listbox, Select, Combobox or Autocomplete that does not use them ships the same code. `/listbox-virtual` (`ListboxVirtual.Root` over `items`), `/select-virtual`, `/combobox-virtual` and `/autocomplete-virtual` (a `List` that replaces the component's List) render only the options in view of a list of thousands, with measured or fixed sizes (`itemSize`, `measure`), `overscan`, the keys, the typeahead, ranges and select all over every item, `aria-activedescendant` and the tab stop always on a rendered option, `aria-setsize` and `aria-posinset` on every option, `loading` (`data-loading`, `aria-busy`) and `onLoadMore` when the last row comes into view (Angular: a row directive per component and `loadMore`). `/async-list` (`useAsyncList`, Angular `injectAsyncList`) loads pages through a loader, with the filter text, load more, the loading and error states and a stale load aborted. The toolkit gains `/virtual` (`createVirtualizer`, `virtualLayout`, `pageIndex`, `scrollContainer`: written in-house, no new dependency) and `/async-list` (`createAsyncList`).
