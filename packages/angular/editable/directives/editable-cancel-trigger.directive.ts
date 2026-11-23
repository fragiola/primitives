import { Directive } from "@angular/core";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { EditableRoot } from "./editable-root.directive.ts";

/** Reverts the edit; `hidden` until one starts (spec/editable.md): `<button editableCancelTrigger>`. */
@Directive({
    selector: "[editableCancelTrigger]",
    exportAs: "editableCancelTrigger",
    host: {
        type: "button",
        "data-primitives-part": "editable-cancel-trigger",
        "[attr.hidden]": "root.editing() ? null : ''",
        "[attr.disabled]": "root.data().disabled",
        "[attr.data-editing]": "root.data().editing",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "(click)": "root.revert('cancel-press', $event)",
    },
})
export class EditableCancelTrigger {
    protected readonly root = injectEnclosing(
        EditableRoot,
        "editableRoot",
        "editableCancelTrigger",
    );
    readonly state = this.root.state;

    constructor() {
        registerHost(this.root.cancelTriggerElement);
    }
}
