// The entry of @fragiola/primitives-vue/radio-group: a set of radios of which one can be
// checked, with form support (spec/radio-group.md, the APG's radio group). Its radios come from
// `/radio`.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export {
    RadioGroup,
    type RadioGroupEmits,
    type RadioGroupProps,
    type RadioGroupState,
} from "./radio-group.ts";
