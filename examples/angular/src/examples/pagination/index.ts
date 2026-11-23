import { Component, computed, signal } from "@angular/core";
import {
    PaginationEllipsis,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    type PaginationRangeItem,
    PaginationRoot,
} from "@fragiola/primitives-angular/pagination";
import { styles } from "./styles.ts";

const PAGE_SIZE = 5;
const ORDERS = Array.from({ length: 42 }, (_, index) => ({
    id: 1001 + index,
    total: ((index * 37) % 90) + 10,
}));

// A results table shown five rows at a time, and its pager (spec/pagination.md): the app holds
// the page and renders that page's rows; the Pagination renders the range.
@Component({
    selector: "example-results-pager",
    imports: [
        PaginationRoot,
        PaginationItem,
        PaginationEllipsis,
        PaginationPrevious,
        PaginationNext,
    ],
    template: `
        <div [class]="styles.stack">
            <table [class]="styles.table">
                <thead>
                    <tr>
                        <th [class]="styles.cell">Order</th>
                        <th [class]="styles.number">Total</th>
                    </tr>
                </thead>
                <tbody>
                    @for (order of rows(); track order.id) {
                        <tr>
                            <td [class]="styles.cell">#{{ order.id }}</td>
                            <td [class]="styles.number">\${{ order.total }}.00</td>
                        </tr>
                    }
                </tbody>
            </table>
            <nav paginationRoot #pager="paginationRoot" aria-label="Orders pages" [total]="orders.length" [pageSize]="pageSize" [(page)]="page" [class]="styles.root">
                <div [class]="styles.list">
                    <button paginationPrevious aria-label="Previous page" [class]="styles.control">‹</button>
                    @for (item of pager.items(); track key(item)) {
                        @if (item.type === "page") {
                            <button paginationItem [value]="item.value" [class]="styles.item">{{ item.value }}</button>
                        } @else {
                            <span paginationEllipsis [class]="styles.ellipsis">…</span>
                        }
                    }
                    <button paginationNext aria-label="Next page" [class]="styles.control">›</button>
                </div>
            </nav>
        </div>
    `,
})
export default class ResultsPager {
    protected readonly styles = styles;
    protected readonly orders = ORDERS;
    protected readonly pageSize = PAGE_SIZE;
    protected readonly page = signal(1);
    protected readonly rows = computed(() =>
        ORDERS.slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE),
    );
    protected key(item: PaginationRangeItem): string | number {
        return item.type === "page" ? item.value : item.position;
    }
}
