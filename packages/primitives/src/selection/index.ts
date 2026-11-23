// The entry of @fragiola/primitives/selection: the collections mechanism (spec/listbox.md, "The
// collections mechanism"): the list model over a list's options, the selection rules (`none`,
// `single`, `multiple`; the APG's toggle and replace models, ranges and select all) and the
// listbox's key map and page measure. Pure functions: the framework holds the value, the focus and
// the anchor. Only the list collections (Listbox) import it, so Menu, Tabs or Dialog never do.

export {
    type ListKeyEvent,
    type ListKeyOptions,
    type ListKeyResult,
    listKeyTarget,
    listPressSelection,
} from "./list-keys.ts";
export {
    createListModel,
    type ListModel,
    type ListNode,
} from "./list-model.ts";
export { pageTarget } from "./page-target.ts";
export {
    applySelection,
    inModelOrder,
    type SelectionBehavior,
    type SelectionChange,
    type SelectionMode,
    type SelectionOptions,
    type SelectionState,
    sameSelection,
} from "./selection.ts";
