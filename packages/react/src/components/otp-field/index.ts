// The entry of @fragiola/primitives-react/otp-field: a one-time code, one native input per slot
// (spec/otp-field.md). Its value rules are the toolkit's `/form`; it is a Field control.

export type { OtpValidationType } from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type {
    OTPFieldInputState,
    OTPFieldState,
} from "./otp-field-context.ts";
export type { OTPFieldInputProps } from "./otp-field-input.tsx";
export type { OTPFieldRootProps } from "./otp-field-root.tsx";
export { OTPField } from "./parts.ts";
