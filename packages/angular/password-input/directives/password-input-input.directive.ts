import { afterNextRender, DestroyRef, Directive, inject } from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import { writeFieldAria } from "@fragiola/primitives-angular/field";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { PasswordInputRoot } from "./password-input-root.directive.ts";

/**
 * The text field (spec/password-input.md): `<input passwordInputInput
 * autocomplete="current-password">`, `type="password"`, or `"text"` while visible; the form
 * control.
 */
@Directive({
    selector: "input[passwordInputInput]",
    exportAs: "passwordInputInput",
    host: {
        autocapitalize: "off",
        spellcheck: "false",
        "data-primitives-part": "password-input-input",
        "[attr.id]": "root.inputId()",
        "[attr.type]": "root.visible() ? 'text' : 'password'",
        "[attr.name]": "root.formName() ?? null",
        "[attr.disabled]": "root.data().disabled",
        "[attr.readonly]": "root.data().readonly",
        "[attr.required]": "root.data().required",
        "[value]": "root.value()",
        // the attribute follows the value, as React's controlled input
        "[attr.value]": "root.value()",
        "[attr.data-visible]": "root.data().visible",
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
        "(focus)": "root.field.focused()",
        "(blur)": "root.field.blurred()",
    },
})
export class PasswordInputInput {
    protected readonly root = injectEnclosing(
        PasswordInputRoot,
        "passwordInputRoot",
        "passwordInputInput",
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
            const cleanup = bridgeForm(host, {
                reset: () => this.root.reset(),
            });
            const form = host.form;
            const onSubmit = (event: Event) => this.root.hide(event);
            form?.addEventListener("submit", onSubmit);
            stop = () => {
                cleanup();
                form?.removeEventListener("submit", onSubmit);
            };
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    protected onInput(event: Event): void {
        this.root.type(this.host.value, event);
    }
}
