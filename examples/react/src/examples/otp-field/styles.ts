import { label } from "examples-shared/recipes/label";
import { otpField } from "examples-shared/recipes/otp-field";

// The example's classes: the OTPField recipe (one string per part), the Label's, the stack and
// the status line.
export const styles = {
    ...otpField,
    label: label.root,
    stack: "flex flex-col items-start gap-(--pr-gap) font-primitives text-(length:--pr-size) text-palette-contrast",
    status: "text-xs text-palette-accent",
};
