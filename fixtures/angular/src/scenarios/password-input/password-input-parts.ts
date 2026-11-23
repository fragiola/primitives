import {
    PasswordInputInput,
    PasswordInputRoot,
    PasswordInputVisibilityTrigger,
} from "@fragiola/primitives-angular/password-input";
import { passwordInput } from "examples-shared/recipes/password-input";

/** Every PasswordInput directive, for a scenario's `imports`. */
export const PASSWORD_INPUT_PARTS = [
    PasswordInputRoot,
    PasswordInputInput,
    PasswordInputVisibilityTrigger,
] as const;

/** The styled trigger, with its eye icons (the recipe shows one by `data-visible`): React's kit. */
export function visibilityTrigger(label: string): string {
    return `<button passwordInputVisibilityTrigger aria-label="${label}" class="${passwordInput["visibility-trigger"]}"><svg class="${passwordInput.show}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg><svg class="${passwordInput.hide}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><path d="M3 3l18 18" /></svg></button>`;
}
