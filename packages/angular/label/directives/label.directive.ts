import { Directive } from "@angular/core";
import {
    labelFocusTarget,
    preventLabelSelection,
} from "@fragiola/primitives/form";
import { injectHost } from "@fragiola/primitives-angular/internal";

/**
 * A `<label>` (spec/label.md): `<label label for="email">Email</label>`. It names its control by
 * the native `for` or by wrapping it, a press reaches the control (or focuses the element `for`
 * names when that is no labelable one), and a double press selects none of its text. Its own
 * handlers run before the consumer's `(mousedown)` and `(click)`.
 */
@Directive({
    selector: "label[label]",
    exportAs: "label",
    host: {
        "data-primitives-part": "label-root",
        "(mousedown)": "onMouseDown($event)",
        "(click)": "onClick($event)",
    },
})
export class Label {
    private readonly host = injectHost<HTMLLabelElement>();

    protected onMouseDown(event: MouseEvent): void {
        // spec/label.md, "Pointer": a double press selects no text
        preventLabelSelection(event);
    }

    protected onClick(event: MouseEvent): void {
        if (event.defaultPrevented) {
            return;
        }
        // a `for` that names no labelable element (a Slider's thumb): focus it, as React's Label
        labelFocusTarget(this.host)?.focus();
    }
}
