// The entry of @fragiola/primitives-angular/pagination: a `nav` of page buttons or links, with
// Previous, Next, First and Last (spec/pagination.md, the APG-closest behaviour decided there),
// as standalone attribute directives on the consumer's own elements. Its range is the toolkit's
// `/pagination`.

export type { PaginationItem as PaginationRangeItem } from "@fragiola/primitives/pagination";
export type {
    ChangeDetails,
    ChangeReason,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
export { PaginationEllipsis } from "./directives/pagination-ellipsis.directive.ts";
export { PaginationFirst } from "./directives/pagination-first.directive.ts";
export {
    PaginationItem,
    type PaginationItemState,
} from "./directives/pagination-item.directive.ts";
export { PaginationLast } from "./directives/pagination-last.directive.ts";
export { PaginationNext } from "./directives/pagination-next.directive.ts";
export { PaginationPrevious } from "./directives/pagination-previous.directive.ts";
export {
    PaginationRoot,
    type PaginationState,
} from "./directives/pagination-root.directive.ts";
export type { PaginationControlState } from "./utils/pagination-control.ts";
