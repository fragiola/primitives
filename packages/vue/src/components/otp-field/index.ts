// The entry of @fragiola/primitives-vue/otp-field: a one-time code, one native input per slot
// (spec/otp-field.md). Its value rules are the toolkit's `/form`; it is a Field control.

export type { OtpValidationType } from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type {
    OTPFieldInputState,
    OTPFieldState,
} from "./otp-field-context.ts";
export type {
    OTPFieldRootEmits,
    OTPFieldRootProps,
} from "./otp-field-root.ts";
export { OTPField } from "./parts.ts";
