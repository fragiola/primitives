// The entry of @fragiola/primitives-vue/form: a native form that validates its Fields on
// submission, focuses the first invalid one and shows server errors (spec/form.md). Built on
// Field, whose fields read it.

export type {
    FieldValidationMode,
    FormErrors,
} from "@fragiola/primitives/form";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export {
    Form,
    type FormEmits,
    type FormProps,
    type FormState,
} from "./form.ts";
