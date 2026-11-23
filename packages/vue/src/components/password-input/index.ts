// The entry of @fragiola/primitives-vue/password-input: a password field whose text a toggle button
// shows and hides (spec/password-input.md). Its Input is the form control; it is a Field control.

export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export { PasswordInput } from "./parts.ts";
export type { PasswordInputState } from "./password-input-context.ts";
export type {
    PasswordInputRootEmits,
    PasswordInputRootProps,
} from "./password-input-root.ts";
