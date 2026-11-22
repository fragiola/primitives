import { computed, Directive, input } from "@angular/core";
import {
    injectEnclosing,
    labelId,
} from "@fragiola/primitives-angular/internal";
import { FieldRoot } from "./field-root.directive.ts";

/**
 * Names the field's control: `for` a labelable control, `aria-labelledby` on any (spec/field.md):
 * `<label fieldLabel>Email</label>`. A press on it focuses a picker's Trigger (its click would open
 * the popup).
 */
@Directive({
    selector: "[fieldLabel]",
    exportAs: "fieldLabel",
    host: {
        "data-primitives-part": "field-label",
        "[attr.id]": "resolvedId()",
        "[attr.for]": "htmlFor()",
        "[attr.data-invalid]": "field.data().invalid",
        "[attr.data-valid]": "field.data().valid",
        "[attr.data-dirty]": "field.data().dirty",
        "[attr.data-touched]": "field.data().touched",
        "[attr.data-filled]": "field.data().filled",
        "[attr.data-focused]": "field.data().focused",
        "[attr.data-disabled]": "field.data().disabled",
        "(click)": "onClick($event)",
    },
})
export class FieldLabel {
    readonly id = input<string | undefined>(undefined);
    protected readonly field = injectEnclosing(
        FieldRoot,
        "fieldRoot",
        "FieldLabel",
    );
    protected readonly resolvedId = labelId(
        this.id,
        this.field.labelId,
        "primitives-field-label",
    );
    protected readonly htmlFor = computed(() => {
        const control = this.field.control();
        return control?.labelable ? control.id : null;
    });
    readonly state = this.field.state;

    /** A control that a click would open (a picker's Trigger) is focused instead. */
    protected onClick(event: MouseEvent): void {
        const control = this.field.control();
        if (control === null || !control.labelable || !control.focusOnLabel) {
            return;
        }
        event.preventDefault();
        (event.currentTarget as HTMLElement).ownerDocument
            .getElementById(control.id)
            ?.focus();
    }
}
