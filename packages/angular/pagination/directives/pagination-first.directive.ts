import { booleanAttribute, Directive, input } from "@angular/core";
import { paginationControl } from "../utils/pagination-control.ts";

/**
 * The first page's control (spec/pagination.md): `<button paginationFirst aria-label="...">`, or a
 * link with `[nativeButton]="false"`. Disabled at its edge.
 */
@Directive({
    selector: "[paginationFirst]",
    exportAs: "paginationFirst",
    host: {
        "data-primitives-part": "pagination-first",
        "[attr.type]": "control.attributes().type",
        "[attr.disabled]": "control.attributes().disabled",
        "[attr.aria-disabled]": "control.attributes().ariaDisabled",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class PaginationFirst {
    /** `false` when the element is a link (default `true`: a native `<button>`). */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    protected readonly control = paginationControl("first", this.nativeButton);
    readonly state = this.control.state;
}
