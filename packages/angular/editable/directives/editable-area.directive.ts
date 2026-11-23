import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { EditableRoot } from "./editable-root.directive.ts";

/** Holds the Preview and the Input (spec/editable.md): `<div editableArea>`. */
@Directive({
    selector: "[editableArea]",
    exportAs: "editableArea",
    host: {
        "data-primitives-part": "editable-area",
        "[attr.data-editing]": "root.data().editing",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
    },
})
export class EditableArea {
    protected readonly root = injectEnclosing(
        EditableRoot,
        "editableRoot",
        "editableArea",
    );
    readonly state = this.root.state;
}
