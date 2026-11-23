// The entry of @fragiola/primitives-react/toggle-group: toggles sharing one value, one tab stop
// (spec/toggle-group.md, Base UI's ToggleGroup). Its toggles come from `/toggle`, which holds the
// group's context.

export type { RovingOrientation } from "@fragiola/primitives/collection";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export {
    ToggleGroup,
    type ToggleGroupProps,
    type ToggleGroupState,
} from "./toggle-group.tsx";
