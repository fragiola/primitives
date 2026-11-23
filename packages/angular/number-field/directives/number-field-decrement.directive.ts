import { Directive, inject } from "@angular/core";
import { stepperButton } from "../utils/stepper-button.ts";
import { NumberFieldRoot } from "./number-field-root.directive.ts";

/**
 * Steps the value down, once or held (spec/number-field.md, "Pointer"):
 * `<button numberFieldDecrement aria-label="...">`, out of the tab order, its name the consumer's.
 */
@Directive({
    selector: "button[numberFieldDecrement]",
    exportAs: "numberFieldDecrement",
    host: {
        type: "button",
        tabindex: "-1",
        "data-primitives-part": "number-field-decrement",
        "[attr.disabled]": "button.disabled() ? '' : null",
        "[attr.aria-controls]": "root.inputId()",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "[attr.data-scrubbing]": "root.data().scrubbing",
        "[attr.data-invalid]": "root.data().invalid",
        "[attr.data-valid]": "root.data().valid",
        "[attr.data-dirty]": "root.data().dirty",
        "[attr.data-touched]": "root.data().touched",
        "[attr.data-filled]": "root.data().filled",
        "[attr.data-focused]": "root.data().focused",
    },
})
export class NumberFieldDecrement {
    protected readonly root = inject(NumberFieldRoot);
    readonly state = this.root.state;
    protected readonly button = stepperButton(this.root, -1);
}
