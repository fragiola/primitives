import { booleanAttribute, Directive, input } from "@angular/core";
import { paginationControl } from "../utils/pagination-control.ts";

/**
 * The previous page's control (spec/pagination.md): `<button paginationPrevious aria-label="...">`, or a
 * link with `[nativeButton]="false"`. Disabled at its edge.
 */
@Directive({
    selector: "[paginationPrevious]",
    exportAs: "paginationPrevious",
    host: {
        "data-primitives-part": "pagination-previous",
        "[attr.type]": "control.attributes().type",
        "[attr.disabled]": "control.attributes().disabled",
        "[attr.aria-disabled]": "control.attributes().ariaDisabled",
        "[attr.data-disabled]": "control.state().disabled ? '' : null",
        "(click)": "control.press($event)",
    },
})
export class PaginationPrevious {
    /** `false` when the element is a link (default `true`: a native `<button>`). */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    protected readonly control = paginationControl(
        "previous",
        this.nativeButton,
    );
    readonly state = this.control.state;
}
