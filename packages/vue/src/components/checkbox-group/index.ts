// The entry of @fragiola/primitives-vue/checkbox-group: checkboxes sharing one array value, with an
// optional parent checkbox (spec/checkbox.md). Its checkboxes come from `/checkbox`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export {
    CheckboxGroup,
    type CheckboxGroupEmits,
    type CheckboxGroupProps,
    type CheckboxGroupState,
} from "./checkbox-group.ts";
