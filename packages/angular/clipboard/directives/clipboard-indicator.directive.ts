import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { ClipboardRoot } from "./clipboard-root.directive.ts";

/**
 * Follows the status: the app's icons, hidden from the accessibility tree (spec/clipboard.md):
 * `<span clipboardIndicator #indicator="clipboardIndicator">`, its content following
 * `indicator.state()` or `data-copied`.
 */
@Directive({
    selector: "[clipboardIndicator]",
    exportAs: "clipboardIndicator",
    host: {
        "aria-hidden": "true",
        "data-primitives-part": "clipboard-indicator",
        "[attr.data-copied]": "root.data().copied",
        "[attr.data-failed]": "root.data().failed",
    },
})
export class ClipboardIndicator {
    protected readonly root = injectEnclosing(
        ClipboardRoot,
        "clipboardRoot",
        "clipboardIndicator",
    );
    readonly state = this.root.state;
}
