import type { ExampleMeta } from "../meta-types.ts";

export default {
    title: "Sign-in form",
    description:
        "An email and a password in a sign-in form: the eye button shows and hides the password without taking the focus from it, and signing in hides it again before the form is read.",
    category: "forms",
    order: 24,
    features: [
        "PasswordInput.Root",
        "PasswordInput.Input",
        "PasswordInput.VisibilityTrigger",
        "autoComplete",
        "data-visible",
    ],
    docs: "/docs/api/password-input",
    height: 300,
} satisfies ExampleMeta;
