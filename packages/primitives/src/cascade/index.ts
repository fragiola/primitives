// The entry of @fragiola/primitives/cascade: a cascading select's tree, its open levels, its
// chosen path and its keys (spec/cascade-select.md), pure functions.

export {
    type CascadeKeyAction,
    cascadeKeyAction,
} from "./cascade-key-action.ts";
export {
    type CascadeItem,
    cascadeLevels,
    cascadePathItems,
    hasCascadeChildren,
} from "./cascade-levels.ts";
