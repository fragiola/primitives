import { computed, Directive } from "@angular/core";
import {
    dataValue,
    injectEnclosing,
    registerHost,
} from "@fragiola/primitives-angular/internal";
import { EditableRoot } from "./editable-root.directive.ts";

/**
 * The value as text (or the placeholder), written as the element's text (spec/editable.md):
 * `<span editablePreview></span>`; `hidden` while editing; its focus, press or double press starts
 * an edit, as `activationMode` says.
 */
@Directive({
    selector: "[editablePreview]",
    exportAs: "editablePreview",
    host: {
        "data-primitives-part": "editable-preview",
        "[textContent]": "text()",
        "[attr.hidden]": "root.editing() ? '' : null",
        "[attr.tabindex]": "tabIndex()",
        "[attr.data-placeholder]": "placeholder()",
        "[attr.data-editing]": "root.data().editing",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "(focus)": "root.previewFocused()",
        "(click)": "onClick()",
        "(dblclick)": "onDoubleClick()",
        "(keydown)": "onKeyDown($event)",
    },
})
export class EditablePreview {
    protected readonly root = injectEnclosing(
        EditableRoot,
        "editableRoot",
        "editablePreview",
    );
    readonly state = this.root.state;
    protected readonly text = computed(() =>
        this.root.showsPlaceholder()
            ? (this.root.placeholder() ?? "")
            : this.root.value(),
    );
    protected readonly tabIndex = computed(() =>
        this.root.interactive()
            ? this.root.activationMode() === "focus"
                ? "0"
                : "-1"
            : null,
    );
    protected readonly placeholder = computed(() =>
        dataValue(this.root.showsPlaceholder()),
    );

    constructor() {
        registerHost(this.root.previewElement);
    }

    protected onClick(): void {
        if (this.root.activationMode() === "click") {
            this.root.edit();
        }
    }

    protected onDoubleClick(): void {
        if (this.root.activationMode() === "dblclick") {
            this.root.edit();
        }
    }

    protected onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter" && this.root.activationMode() !== "none") {
            event.preventDefault();
            this.root.edit();
        }
    }
}
