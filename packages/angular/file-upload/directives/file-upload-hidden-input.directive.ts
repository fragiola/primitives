import { afterNextRender, DestroyRef, Directive, inject } from "@angular/core";
import { VISUALLY_HIDDEN_INPUT_STYLE } from "@fragiola/primitives/form";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { FileUploadRoot } from "./file-upload-root.directive.ts";

/** The structural hidden style, as a `[style]` binding's dash-case properties. */
const HIDDEN_STYLE = Object.fromEntries(
    Object.entries(VISUALLY_HIDDEN_INPUT_STYLE).map(([name, value]) => [
        name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        value,
    ]),
);

/**
 * The native file input: the form's control, its files the value (spec/file-upload.md, "Forms"):
 * `<input fileUploadHiddenInput />`. Hidden from the tab order and the accessibility tree; the
 * Trigger and the Dropzone open it.
 */
@Directive({
    selector: "input[fileUploadHiddenInput]",
    exportAs: "fileUploadHiddenInput",
    host: {
        type: "file",
        tabindex: "-1",
        "aria-hidden": "true",
        "data-primitives-part": "file-upload-hidden-input",
        "[id]": "root.inputId()",
        "[attr.name]": "root.formName() ?? null",
        "[attr.accept]": "root.acceptText() ?? null",
        "[multiple]": "root.multiple()",
        "[attr.capture]": "root.capture() ?? null",
        "[required]": "root.required()",
        "[disabled]": "root.isDisabled()",
        "[style]": "style",
        "(change)": "changed($event)",
    },
})
export class FileUploadHiddenInput {
    protected readonly root = injectEnclosing(
        FileUploadRoot,
        "fileUploadRoot",
        "fileUploadHiddenInput",
    );
    readonly state = this.root.state;
    protected readonly style = HIDDEN_STYLE;
    private readonly host = registerHost<HTMLInputElement>(this.root.input);

    constructor() {
        let stop: (() => void) | null = null;
        afterNextRender(() => {
            stop = this.root.connectInput(this.host);
        });
        inject(DestroyRef).onDestroy(() => stop?.());
    }

    protected changed(event: Event): void {
        const files = [...(this.host.files ?? [])];
        if (files.length > 0) {
            this.root.pick(files, "input-change", event);
        }
    }
}
