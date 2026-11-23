import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Sign-in code",
    description:
        "A six-digit sign-in code, one slot per digit: typing moves forward, Backspace moves back, a paste fills every slot, and the complete code is reported.",
    category: "forms",
    order: 15,
    features: [
        "OTPField.Root",
        "OTPField.Input",
        "Label",
        "length",
        "onValueComplete",
        "autoComplete",
    ],
    docs: "/docs/api/otp-field",
    height: 240,
} satisfies ExampleMeta;
