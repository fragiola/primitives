import {
    afterNextRender,
    DestroyRef,
    Directive,
    effect,
    inject,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { EditableRoot } from "./editable-root.directive.ts";

/**
 * The text field (spec/editable.md): `<input editableInput>` or `<textarea editableInput>`,
 * `hidden` until an edit starts; Enter commits and Escape reverts; the form control.
 */
@Directive({
    selector: "input[editableInput], textarea[editableInput]",
    exportAs: "editableInput",
    host: {
        "data-primitives-part": "editable-input",
        "[attr.id]": "root.inputId()",
        "[attr.name]": "root.formName() ?? null",
        "[attr.hidden]": "root.editing() ? null : ''",
        "[attr.placeholder]": "root.placeholder() ?? null",
        "[attr.maxlength]": "root.maxLength() ?? null",
        "[attr.disabled]": "root.data().disabled",
        "[attr.required]": "root.data().required",
        "[value]": "root.value()",
        // an input's attribute follows the value, as React's controlled input (a textarea has none)
        "[attr.value]": "textarea ? null : root.value()",
        "[attr.data-editing]": "root.data().editing",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "[attr.data-invalid]": "root.field.data().invalid",
        "[attr.data-valid]": "root.field.data().valid",
        "[attr.data-dirty]": "root.field.data().dirty",
        "[attr.data-touched]": "root.field.data().touched",
        "[attr.data-filled]": "root.field.data().filled",
        "[attr.data-focused]": "root.field.data().focused",
        "(input)": "onInput($event)",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "root.field.blurred()",
    },
})
export class EditableInput {
    protected readonly root = injectEnclosing(
        EditableRoot,
        "editableRoot",
        "editableInput",
    );
    readonly state = this.root.state;
    private readonly host = registerHost<HTMLInputElement>(
        this.root.inputElement,
    );
    protected readonly textarea = this.host.localName === "textarea";

    constructor() {
        const host = this.host;
        const { field } = this.root;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        // a textarea's text is its default value, as a server writes its value and React renders
        // it: the same DOM on a server, after a hydration and in a browser's own render
        if (this.textarea) {
            effect(() => {
                const value = this.root.value();
                if (host.defaultValue !== value) {
                    host.defaultValue = value;
                }
            });
        }
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(host, {
                reset: () => this.root.reset(),
                invalid: () => this.root.focusTarget(),
            });
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    protected onInput(event: Event): void {
        this.root.type(this.host.value, event);
    }

    protected onKeyDown(keyEvent: Event): void {
        const event = keyEvent as KeyboardEvent;
        const root = this.root;
        if (!root.editing() || event.isComposing) {
            return;
        }
        if (event.key === "Escape") {
            event.preventDefault();
            root.revert("escape-key", event);
            return;
        }
        const mode = root.submitMode();
        if (event.key !== "Enter" || (mode !== "enter" && mode !== "both")) {
            return;
        }
        if (this.textarea && !event.ctrlKey && !event.metaKey) {
            return;
        }
        event.preventDefault();
        root.commit("keyboard", event);
    }
}
