import { Directive } from "@angular/core";
import {
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { EditableRoot } from "./editable-root.directive.ts";

/** Starts an edit; `hidden` while editing (spec/editable.md): `<button editableEditTrigger>`. */
@Directive({
    selector: "[editableEditTrigger]",
    exportAs: "editableEditTrigger",
    host: {
        type: "button",
        "data-primitives-part": "editable-edit-trigger",
        "[attr.hidden]": "root.editing() ? '' : null",
        "[attr.disabled]":
            "root.state().disabled || root.state().readOnly ? '' : null",
        "[attr.aria-controls]": "root.inputId()",
        "[attr.data-editing]": "root.data().editing",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "(click)": "root.edit()",
    },
})
export class EditableEditTrigger {
    protected readonly root = injectEnclosing(
        EditableRoot,
        "editableRoot",
        "editableEditTrigger",
    );
    readonly state = this.root.state;

    constructor() {
        registerHost(this.root.editTriggerElement);
    }
}
