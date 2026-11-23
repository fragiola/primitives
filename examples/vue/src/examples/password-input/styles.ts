import { passwordInput } from "examples-shared/recipes/password-input";

// The example's classes: the PasswordInput recipe (one string per part), its trigger under a name
// the markup can read without a string, the form, its labels, the email field and the button.
export const styles = {
    ...passwordInput,
    visibilityTrigger: passwordInput["visibility-trigger"],
    form: "flex flex-col items-start gap-2 font-primitives text-(length:--pr-size) text-palette-contrast",
    label: "font-medium",
    email: "h-(--pr-control-height) w-64 rounded-control border border-palette-line bg-palette-base px-3 text-palette-contrast outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    submit: "mt-2 inline-flex h-(--pr-control-height) items-center rounded-control bg-palette-contrast px-4 font-medium text-palette-base outline-hidden focus-visible:outline-solid focus-visible:outline-(length:--pr-focus-width) focus-visible:outline-offset-2 focus-visible:outline-palette-ring",
    status: "min-h-5 text-palette-accent/85",
};
