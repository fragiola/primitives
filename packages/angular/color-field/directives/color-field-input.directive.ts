import { computed, Directive, inject } from "@angular/core";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import { registerHost } from "@fragiola/primitives-angular/internal";
import { ColorFieldRoot } from "./color-field-root.directive.ts";

/**
 * The text (spec/color-field.md): a textbox (hex), or a `spinbutton` with the Root's `channel`:
 * `<input colorFieldInput>`, its name the consumer's (a `<label for>` with the Root's `id`,
 * `aria-label` or `Field.Label`). Enter and blur commit it, the arrows step it.
 */
@Directive({
    selector: "input[colorFieldInput]",
    exportAs: "colorFieldInput",
    host: {
        type: "text",
        autocomplete: "off",
        autocorrect: "off",
        spellcheck: "false",
        "data-primitives-part": "color-field-input",
        "[attr.id]": "root.inputId()",
        "[attr.role]": "channelMode() ? 'spinbutton' : null",
        "[attr.inputmode]": "channelMode() ? 'decimal' : null",
        "[value]": "root.inputValue()",
        // the attribute follows the value, as React's controlled input: a server render writes
        // it, so the page rendered in the browser alone has it too (spec/README.md, "Server
        // rendering"), and a form reset restores the rendered text
        "[attr.value]": "root.inputValue()",
        "[attr.disabled]": "root.data().disabled",
        "[attr.readonly]": "root.data().readonly",
        "[attr.aria-valuenow]": "channelMode() ? root.channelValue() : null",
        "[attr.aria-valuemin]": "root.range()?.min ?? null",
        "[attr.aria-valuemax]": "root.range()?.max ?? null",
        "[attr.aria-valuetext]": "valueText()",
        "[attr.aria-required]": "root.state().required ? 'true' : null",
        "[attr.aria-readonly]": "root.state().readOnly ? 'true' : null",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "[attr.data-channel]": "root.data().channel",
        "[attr.data-invalid]": "root.data().invalid",
        "[attr.data-valid]": "root.data().valid",
        "[attr.data-dirty]": "root.data().dirty",
        "[attr.data-touched]": "root.data().touched",
        "[attr.data-filled]": "root.data().filled",
        "[attr.data-focused]": "root.data().focused",
        "(input)": "root.inputText(input.value)",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "onBlur($event)",
    },
})
export class ColorFieldInput {
    protected readonly root = inject(ColorFieldRoot);
    readonly state = this.root.state;
    protected readonly input = registerHost<HTMLInputElement>(
        this.root.inputElement,
    );
    protected readonly channelMode = computed(
        () => this.root.channel() !== undefined,
    );
    protected readonly valueText = computed(() =>
        this.channelMode() && this.root.color() !== null
            ? this.root.valueText()
            : null,
    );

    constructor() {
        const { field } = this.root;
        writeFieldAria(field, this.input, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter") {
            this.root.commitText("keyboard", event);
            return;
        }
        if (this.root.stepKey(event.key, event.shiftKey, event)) {
            event.preventDefault();
        }
    }

    protected onBlur(event: FocusEvent): void {
        this.root.commitText("input-blur", event);
        this.root.field.blurred();
    }
}
