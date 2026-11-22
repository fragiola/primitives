// The entry of @fragiola/primitives-react/render: the primitive contract's `render`, public for an
// app that writes its own parts the same way (spec/README.md, "Render utilities"; Base UI's
// `useRender` and `mergeProps`). It references no component.

export type { RenderProp } from "../utils/render-element.tsx";
export { mergeProps } from "./merge-props.ts";
export {
    type UseRenderOptions,
    type UseRenderProps,
    useRender,
} from "./use-render.ts";
