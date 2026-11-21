// The entry of @fragiola/primitives/layers: the stack of open overlays of a document (Escape, outside press), the focus-outside watch, and an Escape taken before the layers (a tooltip's).

export { watchFocusOutside } from "./focus-outside.ts";
export { interceptEscape } from "./intercept-escape.ts";
export {
    type Layer,
    type LayerOptions,
    pushLayer,
} from "./layer-stack.ts";
