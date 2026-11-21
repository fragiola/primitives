// The entry of @fragiola/primitives/layers: the stack of open overlays of a document (Escape, outside press) and the focus-outside watch.

export { watchFocusOutside } from "./focus-outside.ts";
export {
    type Layer,
    type LayerOptions,
    pushLayer,
} from "./layer-stack.ts";
