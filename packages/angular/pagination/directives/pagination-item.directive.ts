import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
} from "@angular/core";
import { controlAttributes } from "../utils/pagination-control.ts";
import { PaginationRoot } from "./pagination-root.directive.ts";

export interface PaginationItemState {
    /** Its page. */
    page: number;
    /** It is the current page. */
    current: boolean;
    disabled: boolean;
}

/**
 * A page (spec/pagination.md): `<button paginationItem [value]="item.value">`, or a link with
 * `[nativeButton]="false"`; `aria-current="page"` while it is the current one.
 */
@Directive({
    selector: "[paginationItem]",
    exportAs: "paginationItem",
    host: {
        "data-primitives-part": "pagination-item",
        "[attr.type]": "attributes().type",
        "[attr.disabled]": "attributes().disabled",
        "[attr.aria-disabled]": "attributes().ariaDisabled",
        "[attr.aria-current]": "state().current ? 'page' : null",
        "[attr.data-current]": "state().current ? '' : null",
        "[attr.data-disabled]": "state().disabled ? '' : null",
        "(click)": "press($event)",
    },
})
export class PaginationItem {
    /** Its page, from 1. */
    readonly value = input.required({ transform: numberAttribute });
    /** `false` when the element is a link (default `true`: a native `<button>`). */
    readonly nativeButton = input(true, { transform: booleanAttribute });
    private readonly root = inject(PaginationRoot);
    readonly state = computed<PaginationItemState>(() => ({
        page: this.value(),
        current: this.value() === this.root.currentPage(),
        disabled: this.root.disabled(),
    }));
    protected readonly attributes = computed(() =>
        controlAttributes(this.nativeButton(), this.state().disabled),
    );

    protected press(event: Event): void {
        if (this.state().disabled) {
            event.preventDefault();
            return;
        }
        this.root.setPage(this.value(), { reason: "item-press", event });
    }
}
