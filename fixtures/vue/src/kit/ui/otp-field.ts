import { OTPField as Primitive } from "@fragiola/primitives-vue/otp-field";
import { otpField } from "examples-shared/recipes/otp-field";
import { styled } from "../styled.ts";

export const OTPField = {
    Root: styled(Primitive.Root, otpField.root),
    Input: styled(Primitive.Input, otpField.input),
};
