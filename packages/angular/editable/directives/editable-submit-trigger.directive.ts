import { Directive } from "@angular/core";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { EditableRoot } from "./editable-root.directive.ts";

/** Commits the edit; `hidden` until one starts (spec/editable.md): `<button editableSubmitTrigger>`. */
@Directive({
    selector: "[editableSubmitTrigger]",
    exportAs: "editableSubmitTrigger",
    host: {
        type: "button",
        "data-primitives-part": "editable-submit-trigger",
        "[attr.hidden]": "root.editing() ? null : ''",
        "[attr.disabled]": "root.data().disabled",
        "[attr.data-editing]": "root.data().editing",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "(click)": "root.commit('submit-press', $event)",
    },
})
export class EditableSubmitTrigger {
    protected readonly root = injectEnclosing(
        EditableRoot,
        "editableRoot",
        "editableSubmitTrigger",
    );
    readonly state = this.root.state;

    constructor() {
        registerHost(this.root.submitTriggerElement);
    }
}
