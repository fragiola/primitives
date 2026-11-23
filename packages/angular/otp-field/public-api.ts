// The entry of @fragiola/primitives-angular/otp-field: a one-time code, one native input per slot
// (spec/otp-field.md), as standalone directives on the consumer's own elements. Its value rules
// are the toolkit's `/form`; it is a Field control.

export type { OtpValidationType } from "@fragiola/primitives/form";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export {
    OTPFieldInput,
    type OTPFieldInputState,
} from "./directives/otp-field-input.directive.ts";
export {
    OTPFieldRoot,
    type OTPFieldState,
} from "./directives/otp-field-root.directive.ts";
