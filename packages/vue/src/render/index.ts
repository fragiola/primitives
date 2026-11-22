// The entry of @fragiola/primitives-vue/render: the primitive contract's `render`, made public for
// an app that writes its own parts the same way (spec/README.md, "Render utilities"). It
// references no component.

export {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../utils/render-part.ts";
export { stateAttributes } from "../utils/state-attributes.ts";
