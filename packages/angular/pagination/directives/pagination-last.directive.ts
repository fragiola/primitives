import { booleanAttribute, Directive, input } from "@angular/core";
import { paginationControl } from "../utils/pagination-control.ts";

/**
 * The last page's control (spec/pagination.md): `<button paginationLast aria-label="...">`, or a
 * link with `[nativeButton]="false"`. Disabled at its edge.
 */
@Directive({
    selector: "[paginationLast]",
    exportAs: "paginationLast",
    host: {
        "data-primitives-part": "pagination-last",
        "[attr.type]": "control.attributes().type",
        "[attr.disabled]": "control.attributes().disabled",
        "[attr.aria-disabled]": "control.attributes().ariaDisabled",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class PaginationLast {
    /** `false` when the element is a link (default `true`: a native `<button>`). */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    protected readonly control = paginationControl("last", this.nativeButton);
    readonly state = this.control.state;
}
