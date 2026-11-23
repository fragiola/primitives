import { Directive } from "@angular/core";
import { injectEnclosing } from "@fragiola/primitives-angular/internal";
import { SearchFieldRoot } from "./search-field-root.directive.ts";

/**
 * Empties the field and focuses the Input; out of the tab order (spec/search-field.md, React
 * Aria's): `<button searchFieldClearButton aria-label="Clear search">`.
 */
@Directive({
    selector: "[searchFieldClearButton]",
    exportAs: "searchFieldClearButton",
    host: {
        type: "button",
        tabindex: "-1",
        "data-primitives-part": "search-field-clear-button",
        "[attr.aria-controls]": "root.inputId()",
        "[attr.disabled]":
            "root.state().disabled || root.state().readOnly ? '' : null",
        "[attr.data-empty]": "root.data().empty",
        "[attr.data-disabled]": "root.data().disabled",
        "[attr.data-readonly]": "root.data().readonly",
        "[attr.data-required]": "root.data().required",
        "(mousedown)": "$event.preventDefault()",
        "(click)": "root.clear($event)",
    },
})
export class SearchFieldClearButton {
    protected readonly root = injectEnclosing(
        SearchFieldRoot,
        "searchFieldRoot",
        "searchFieldClearButton",
    );
    readonly state = this.root.state;
}
