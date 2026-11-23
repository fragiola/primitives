import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    type PaginationRangeItem,
    PaginationRoot,
} from "@fragiola/primitives-angular/pagination";
import { pagination } from "examples-shared/recipes/pagination";
import { Output } from "../../kit/output.ts";

/** spec/pagination.md, `/pagination/links` */
@Component({
    selector: "[scenario-pagination-links]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        PaginationRoot,
        PaginationItem,
        PaginationEllipsis,
        PaginationPrevious,
        PaginationNext,
        Output,
    ],
    template: `
        <nav paginationRoot #pager="paginationRoot" aria-label="Archive pages" [total]="95" [pageSize]="10" [siblingCount]="2" [boundaryCount]="0" (pageChange)="page.set($event)" [class]="styles.root">
            <div [class]="styles.list">
                <a paginationPrevious aria-label="Previous page" [nativeButton]="false" href="#previous" [class]="styles.control">‹</a>
                @for (item of pager.items(); track key(item)) {
                    @if (item.type === "page") {
                        <a paginationItem [value]="item.value" [nativeButton]="false" [href]="'#page-' + item.value" [class]="styles.item">{{ item.value }}</a>
                    } @else {
                        <span paginationEllipsis [class]="styles.ellipsis">…</span>
                    }
                }
                <a paginationNext aria-label="Next page" [nativeButton]="false" href="#next" [class]="styles.control">›</a>
            </div>
        </nav>
        <pre fixtureOutput [values]="{ page: page() }"></pre>
    `,
})
export class PaginationLinks {
    protected readonly styles = pagination;
    protected readonly page = signal<number | undefined>(undefined);
    protected key(item: PaginationRangeItem): string | number {
        return item.type === "page" ? item.value : item.position;
    }
}
