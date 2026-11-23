---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Toggles and bars, natively in React, Vue and Angular, each in its own entry. `/toggle`: a pressed button (`aria-pressed`, `data-pressed`), `pressed`/`defaultPressed`/`onPressedChange`, `value` for a group, `disabled`, on Button's behaviour (`nativeButton`). `/toggle-group`: single or `multiple` (the value is always an array of strings), `orientation`, `loopFocus`, `disabled`, one tab stop with the orientation's arrows (mirrored in RTL), Home and End. `/toolbar` (`Root`, `Button`, `Link`, `Input`, `Group`, `Separator`): the APG toolbar, one tab stop for the whole bar, the arrows, Home and End between its items, `orientation`, `loopFocus`, disabled items skipped unless `focusableWhenDisabled`; a ToggleGroup inside it joins its roving focus with no tab stop of its own, and an `Input` keeps its caret keys. `/menubar`: the APG menubar on Menu (its menus are `Menu.Root`s, their triggers the bar's items), one tab stop, the arrows moving between menus and opening the neighbour's while one is open, Down/Up/Enter/Space opening on the first or last item, hover switching once a menu is open, Escape back to the item, submenus and checkable items, `orientation`, `loopFocus`, `modal`, `disabled`, RTL. The toolkit gains the roving focus in `/collection` (`rovingKeyTarget`, `rovingKeys`, `rovingTabStop`, `textFieldKeepsKey`, `inDocumentOrder`).
