import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    PaginationEllipsis,
    PaginationFirst,
    PaginationItem,
    PaginationLast,
    PaginationNext,
    PaginationPrevious,
    type PaginationRangeItem,
    PaginationRoot,
} from "@fragiola/primitives-angular/pagination";
import { pagination } from "examples-shared/recipes/pagination";
import { Output } from "../../kit/output.ts";

/** spec/pagination.md, `/pagination/basic` */
@Component({
    selector: "[scenario-pagination-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        PaginationRoot,
        PaginationItem,
        PaginationEllipsis,
        PaginationPrevious,
        PaginationNext,
        PaginationFirst,
        PaginationLast,
        Output,
    ],
    template: `
        <nav paginationRoot #pager="paginationRoot" aria-label="Results pages" [count]="10" [(page)]="page" (pageChangeDetails)="reason.set($event.details.reason)" [class]="styles.root">
            <div [class]="styles.list">
                <button paginationFirst aria-label="First page" [class]="styles.control">«</button>
                <button paginationPrevious aria-label="Previous page" [class]="styles.control">‹</button>
                @for (item of pager.items(); track key(item)) {
                    @if (item.type === "page") {
                        <button paginationItem [value]="item.value" [class]="styles.item">{{ item.value }}</button>
                    } @else {
                        <span paginationEllipsis [class]="styles.ellipsis">…</span>
                    }
                }
                <button paginationNext aria-label="Next page" [class]="styles.control">›</button>
                <button paginationLast aria-label="Last page" [class]="styles.control">»</button>
            </div>
        </nav>
        <pre fixtureOutput [values]="{ page: page(), reason: reason() }"></pre>
    `,
})
export class PaginationBasic {
    protected readonly styles = pagination;
    protected readonly page = signal(5);
    protected readonly reason = signal<string | undefined>(undefined);
    protected key(item: PaginationRangeItem): string | number {
        return item.type === "page" ? item.value : item.position;
    }
}
