import { OTPField as Primitive } from "@fragiola/primitives-react/otp-field";
import { otpField } from "examples-shared/recipes/otp-field";
import type { ComponentProps } from "react";

export const OTPField = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={otpField.root} {...props} />
    ),
    Input: (props: ComponentProps<typeof Primitive.Input>) => (
        <Primitive.Input className={otpField.input} {...props} />
    ),
};
