import { Directive } from "@angular/core";

/** Stands for the pages a range leaves out (spec/pagination.md): `<span paginationEllipsis>…</span>`. */
@Directive({
    selector: "[paginationEllipsis]",
    exportAs: "paginationEllipsis",
    host: { "data-primitives-part": "pagination-ellipsis" },
})
export class PaginationEllipsis {}
