import { Directive } from "@angular/core";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { ClipboardRoot } from "./clipboard-root.directive.ts";

/** Shows the Root's value, read-only (spec/clipboard.md): `<input clipboardInput id="install">`. */
@Directive({
    selector: "input[clipboardInput]",
    exportAs: "clipboardInput",
    host: {
        type: "text",
        readonly: "",
        "data-primitives-part": "clipboard-input",
        "[value]": "root.value()",
        // the attribute follows the value, as React's controlled input
        "[attr.value]": "root.value()",
        "[attr.data-copied]": "root.data().copied",
        "[attr.data-failed]": "root.data().failed",
    },
})
export class ClipboardInput {
    protected readonly root = injectEnclosing(
        ClipboardRoot,
        "clipboardRoot",
        "clipboardInput",
    );
    readonly state = this.root.state;

    constructor() {
        registerHost<HTMLInputElement>(this.root.inputElement);
    }
}
