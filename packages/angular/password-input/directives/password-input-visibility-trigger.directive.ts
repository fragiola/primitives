import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { PasswordInputRoot } from "./password-input-root.directive.ts";

/**
 * The toggle button that shows and hides the text (spec/password-input.md):
 * `<button passwordInputVisibilityTrigger aria-label="Show password">`; a pointer press leaves the
 * focus where it was.
 */
@Directive({
    selector: "[passwordInputVisibilityTrigger]",
    exportAs: "passwordInputVisibilityTrigger",
    host: {
        type: "button",
        "data-primitives-part": "password-input-visibility-trigger",
        "[attr.aria-pressed]": "root.visible() ? 'true' : 'false'",
        "[attr.aria-controls]": "root.inputId()",
        "[attr.disabled]": "root.data().disabled",
        "[attr.data-visible]": "root.data().visible",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "(mousedown)": "$event.preventDefault()",
        "(click)": "root.toggle($event)",
    },
})
export class PasswordInputVisibilityTrigger {
    protected readonly root = injectEnclosing(
        PasswordInputRoot,
        "passwordInputRoot",
        "passwordInputVisibilityTrigger",
    );
    readonly state = this.root.state;
}
