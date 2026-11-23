import {
    afterRenderEffect,
    computed,
    DestroyRef,
    Directive,
    inject,
} from "@angular/core";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    injectFlush,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { NumberFieldRoot } from "./number-field-root.directive.ts";

/**
 * The `spinbutton`: a text input showing the formatted value (spec/number-field.md, the APG
 * spinbutton): `<input numberFieldInput>`, its name the consumer's (a Label, `aria-label` or
 * `Field.Label`).
 */
@Directive({
    selector: "input[numberFieldInput]",
    exportAs: "numberFieldInput",
    host: {
        type: "text",
        role: "spinbutton",
        autocomplete: "off",
        autocorrect: "off",
        spellcheck: "false",
        "data-primitives-part": "number-field-input",
        "[attr.id]": "root.inputId()",
        "[attr.inputmode]": "inputMode()",
        "[value]": "root.inputValue()",
        // the attribute follows the value, as React's controlled input: a server render writes
        // it, so the page rendered in the browser alone has it too (spec/README.md, "Server
        // rendering"), and a form reset restores the rendered text
        "[attr.value]": "root.inputValue()",
        "[attr.disabled]": "root.data().disabled",
        "[attr.readonly]": "root.data().readonly",
        "[attr.aria-valuenow]": "root.state().value",
        "[attr.aria-valuemin]": "root.min() ?? null",
        "[attr.aria-valuemax]": "root.max() ?? null",
        "[attr.aria-valuetext]": "valueText()",
        "[attr.aria-required]": "root.state().required ? 'true' : null",
        "[attr.aria-readonly]": "root.state().readOnly ? 'true' : null",
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
        "(input)": "onInput($event)",
        "(keydown)": "onKeyDown($event)",
        "(focus)": "root.field.focused()",
        "(blur)": "onBlur($event)",
    },
})
export class NumberFieldInput {
    protected readonly root = inject(NumberFieldRoot);
    readonly state = this.root.state;
    private readonly input = registerHost<HTMLInputElement>(
        this.root.inputElement,
    );
    private readonly flush = injectFlush();
    /** `numeric` when the format writes no decimals and `min` is not negative, else `decimal`. */
    protected readonly inputMode = computed(() => {
        const min = this.root.min();
        return this.root.format()?.maximumFractionDigits === 0 &&
            min !== undefined &&
            min >= 0
            ? "numeric"
            : "decimal";
    });
    protected readonly valueText = computed(() =>
        this.root.state().value === null ? null : this.root.formattedValue(),
    );

    constructor() {
        const { field } = this.root;
        const host = this.input;
        writeFieldAria(field, host, {
            "aria-labelledby": field.labelledBy,
            "aria-describedby": field.describedBy,
            "aria-invalid": field.ariaInvalid,
        });

        // the wheel over the focused Input steps it, and the page does not scroll (a non-passive
        // listener, spec/number-field.md "Pointer"); in the browser only
        const onWheel = (event: WheelEvent) => {
            const root = this.root;
            if (
                host.ownerDocument.activeElement !== host ||
                event.deltaY === 0 ||
                root.isDisabled() ||
                root.readOnly()
            ) {
                return;
            }
            event.preventDefault();
            const amount = root.amount(event);
            root.stepBy(event.deltaY < 0 ? amount : -amount, "wheel", event);
        };
        let listening = false;
        afterRenderEffect(() => {
            const allowed = this.root.allowWheelScrub();
            if (allowed && !listening) {
                host.addEventListener("wheel", onWheel, { passive: false });
            } else if (!allowed && listening) {
                host.removeEventListener("wheel", onWheel);
            }
            listening = allowed;
        });
        inject(DestroyRef).onDestroy(() =>
            host.removeEventListener("wheel", onWheel),
        );
    }

    protected onInput(event: Event): void {
        this.root.inputText(this.input.value, event);
        // a refused text, or a bound value the consumer kept, does not re-run the binding: put the
        // field's text back (React re-asserts a controlled value too)
        this.flush();
        const text = this.root.inputValue();
        if (this.input.value !== text) {
            this.input.value = text;
        }
    }

    protected onBlur(event: FocusEvent): void {
        this.root.inputBlur(event);
        this.root.field.blurred();
    }

    protected onKeyDown(event: KeyboardEvent): void {
        const root = this.root;
        if (root.isDisabled() || root.readOnly()) {
            return;
        }
        const amount = root.amount(event);
        const large = root.amount({ shiftKey: true });
        switch (event.key) {
            case "ArrowUp":
                root.stepBy(amount, "keyboard", event);
                break;
            case "ArrowDown":
                root.stepBy(-amount, "keyboard", event);
                break;
            case "PageUp":
                root.stepBy(large, "keyboard", event);
                break;
            case "PageDown":
                root.stepBy(-large, "keyboard", event);
                break;
            case "Home": {
                const min = root.min();
                if (min === undefined) {
                    return;
                }
                root.stepTo(min, "keyboard", event);
                break;
            }
            case "End": {
                const max = root.max();
                if (max === undefined) {
                    return;
                }
                root.stepTo(max, "keyboard", event);
                break;
            }
            default:
                return;
        }
        event.preventDefault();
    }
}
