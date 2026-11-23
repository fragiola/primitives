import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ClipboardRoot } from "./clipboard-root.directive.ts";

/** The button that copies the Root's value (spec/clipboard.md): `<button clipboardTrigger>`. */
@Directive({
    selector: "[clipboardTrigger]",
    exportAs: "clipboardTrigger",
    host: {
        type: "button",
        "data-primitives-part": "clipboard-trigger",
        "[attr.data-copied]": "root.data().copied",
        "[attr.data-failed]": "root.data().failed",
        "(click)": "root.copy($event)",
    },
})
export class ClipboardTrigger {
    protected readonly root = injectEnclosing(
        ClipboardRoot,
        "clipboardRoot",
        "clipboardTrigger",
    );
    readonly state = this.root.state;
}
