---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Hardening: the Stage 0 follow-ups and server rendering. Angular's overlays play their exit transition before they unmount, as React's and Vue's, and can be reopened during it; Angular's Tabs Indicator is structural (`*tabsIndicator`), not rendered while no tab is selected. A close made through a controlled `open` uses its own reason for the focus return (a Popover returns focus left inside it); a Tooltip.Provider keeps one delay group when its props change and reads `timeout` reactively; a key on an open Menu trigger leaves no pending highlight; Escape cancels a RangeCalendar's started range before an enclosing picker, dialog or popover closes; Vue decides a calendar's picker binding from its current props, and types the Combobox callbacks by the consumer's own item (`ComboboxFilter`, `ComboboxItemEquality`, `ComboboxItemToString`). Every component renders on the server and hydrates without a mismatch: a calendar with no `locale` renders `en-US` first and takes the document's language once mounted, Angular's ids come from an application's own counter, Angular's hidden inputs are added after hydration, and the Tabs Indicator's `renderBeforeHydration` places it before hydration with an inline script (the toolkit's `placeTabsIndicator`). The toolkit's `createDelayGroup` takes a `timeout` getter, `interceptEscape` a `when` filter, and an overlay session returns focus left inside a closing overlay for its `whenUnfocused` reasons.
