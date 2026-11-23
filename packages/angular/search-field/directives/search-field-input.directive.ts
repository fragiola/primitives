import { afterNextRender, DestroyRef, Directive, inject } from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { SearchFieldRoot } from "./search-field-root.directive.ts";

/**
 * The `searchbox` (spec/search-field.md): `<input searchFieldInput>`, `type="search"`; Escape
 * clears it, Enter submits it; the form control.
 */
@Directive({
    selector: "input[searchFieldInput]",
    exportAs: "searchFieldInput",
    host: {
        type: "search",
        "data-primitives-part": "search-field-input",
        "[attr.id]": "root.inputId()",
        "[attr.name]": "root.formName() ?? null",
        "[attr.disabled]": "root.data().disabled",
        "[attr.readonly]": "root.data().readonly",
        "[attr.required]": "root.data().required",
        "[value]": "root.value()",
        // the attribute follows the value, as React's controlled input
        "[attr.value]": "root.value()",
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
export class SearchFieldInput {
    protected readonly root = injectEnclosing(
        SearchFieldRoot,
        "searchFieldRoot",
        "searchFieldInput",
    );
    readonly state = this.root.state;
    private readonly host = registerHost<HTMLInputElement>(
        this.root.inputElement,
    );

    constructor() {
        const host = this.host;
        const { field } = this.root;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = bridgeForm(host, { reset: () => this.root.reset() });
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    protected onInput(event: Event): void {
        this.root.type(this.host.value, event);
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.isComposing) {
            return;
        }
        if (event.key === "Escape") {
            if (this.root.escape(event)) {
                event.preventDefault();
            }
        } else if (event.key === "Enter") {
            this.root.submit();
        }
    }
}
