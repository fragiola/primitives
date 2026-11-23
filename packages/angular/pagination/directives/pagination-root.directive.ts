import {
    booleanAttribute,
    computed,
    Directive,
    input,
    numberAttribute,
    output,
} from "@angular/core";
import {
    clampPage,
    type PaginationItem,
    pageCount,
    paginationRange,
} from "@fragiola/primitives/pagination";
import {
    type ChangeDetails,
    controllable,
    dataValue,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";

/** What the Root renders with (spec/pagination.md). */
export interface PaginationState {
    /** The current page, from 1. */
    page: number;
    /** The number of pages. */
    count: number;
    disabled: boolean;
}

/** A number input that may be left unset. */
function optionalNumber(value: unknown): number | undefined {
    return value === undefined || value === null || value === ""
        ? undefined
        : numberAttribute(value);
}

/**
 * The `nav` landmark of a paged list (spec/pagination.md): `<nav paginationRoot
 * aria-label="Results pages" [count]="10" [(page)]="page" #pager="paginationRoot">`, its Items
 * and Ellipses rendered with `@for (item of pager.items(); ...)`. The app names it.
 */
@Directive({
    selector: "[paginationRoot]",
    exportAs: "paginationRoot",
    host: {
        "data-primitives-part": "pagination-root",
        "[attr.data-disabled]": "disabledData()",
    },
})
export class PaginationRoot {
    /** The current page, from 1 (controlled: `[(page)]` or a one-way `[page]`). */
    readonly page = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** Its new page (`[(page)]`). */
    readonly pageChange = output<number>();
    /** The page at first (default `1`). */
    readonly defaultPage = input(1, { transform: numberAttribute });
    /** Every page change, with its reason. */
    readonly pageChangeDetails = output<ValueChangeEvent<number>>();
    /** The number of pages; or `total` and `pageSize`. */
    readonly count = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** The number of rows, with `pageSize`, when `count` is not given. */
    readonly total = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** The rows per page (default `10`). */
    readonly pageSize = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** The pages shown on each side of the current one (default `1`). */
    readonly siblingCount = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** The pages always shown at each end (default `1`). */
    readonly boundaryCount = input<number | undefined, unknown>(undefined, {
        transform: optionalNumber,
    });
    /** Every control is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** The number of pages. */
    readonly pageCount = computed(() =>
        pageCount({
            count: this.count(),
            total: this.total(),
            pageSize: this.pageSize(),
        }),
    );
    private readonly own = controllable<number, ChangeDetails>(
        this.page,
        this.pageChange,
        () => this.defaultPage(),
        (value, details) => this.pageChangeDetails.emit({ value, details }),
    );
    /** The current page, clamped to `[1, count]`. */
    readonly currentPage = computed(() =>
        clampPage(this.own.value(), this.pageCount()),
    );
    /** The range, in order: pages and ellipses. */
    readonly items = computed<PaginationItem[]>(() =>
        paginationRange({
            page: this.currentPage(),
            count: this.pageCount(),
            siblingCount: this.siblingCount(),
            boundaryCount: this.boundaryCount(),
        }),
    );
    readonly state = computed<PaginationState>(() => ({
        page: this.currentPage(),
        count: this.pageCount(),
        disabled: this.disabled(),
    }));
    protected readonly disabledData = computed(() =>
        dataValue(this.disabled()),
    );

    /** Moves to `page` (clamped), unless it is the current one. */
    setPage(page: number, details: ChangeDetails): void {
        const target = clampPage(page, this.pageCount());
        if (target !== this.currentPage()) {
            this.own.set(target, details);
        }
    }
}
