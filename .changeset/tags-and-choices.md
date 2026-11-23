---
"@fragiola/primitives": minor
"@fragiola/primitives-react": minor
"@fragiola/primitives-vue": minor
"@fragiola/primitives-angular": minor
---

Tags, natively in React, Vue and Angular, each in its own entry. `/tag-group` (`Root`, `Label`, `List`, `Tag`, `TagCell`, `RemoveButton`): React Aria's grid of tags (a `grid` of `row`s with one `gridcell` each, a `group` while empty), one tab stop, the arrows of both axes (mirrored in RTL), Home and End, `loopFocus`, `selectionMode` `none`, `single` or `multiple` (Space, Enter, a press), `disabledKeys` and disabled tags that never take focus, `onRemove` from Delete, Backspace or a RemoveButton with the focus moved to the next tag, else the previous one, else the List, `data-empty`, and the Field layer's label and description. `/tags-input` (`Root`, `Control`, `Input`, `Tag`, `TagText`, `TagRemove`, `TagInput`, `ClearTrigger`): a text input whose Enter, `delimiter` and pasted lists add trimmed tags, refused as duplicates (unless `allowDuplicates`), past `max` or by `validate` (`onValueInvalid` with its `cause`), the tags reached with Backspace and the arrows and removed with Backspace or Delete, `editable` tags edited in place, `blurBehavior` (`"add"`, `"clear"`), a controlled text (`inputValue`), one hidden input per tag for native forms (submit, reset, `required`) and the Field layer. The toolkit gains the tags' keys in `/collection` (`tagGroupKeyTarget`, `removalFocusIndex`, `tagsInputInputKeyTarget`, `tagsInputTagKeyTarget`) and their rules in `/form` (`takeTags`, `editTag`). Every existing entry is unchanged.
