// The entry of @fragiola/primitives-react/toggle: a two-state button, alone, in a ToggleGroup or
// in a Toolbar (spec/toggle.md, the APG's toggle button). It holds the group's context, so a
// Toggle alone ships no ToggleGroup code.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export { Toggle, type ToggleProps, type ToggleState } from "./toggle.tsx";
