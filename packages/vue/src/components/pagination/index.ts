// The entry of @fragiola/primitives-vue/pagination: a `nav` of page buttons or links, with
// Previous, Next, First and Last (spec/pagination.md, the APG-closest behaviour decided there).
// Its range is the toolkit's `/pagination`.

export type { PaginationItem as PaginationRangeItem } from "@fragiola/primitives/pagination";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderSlotProps } from "../../utils/render-part.ts";
export type { PaginationState } from "./pagination-context.ts";
export type {
    PaginationControlProps,
    PaginationControlState,
} from "./pagination-control.ts";
export type { PaginationEllipsisState } from "./pagination-ellipsis.ts";
export type {
    PaginationItemProps,
    PaginationItemState,
} from "./pagination-item.ts";
export type {
    PaginationRootEmits,
    PaginationRootProps,
    PaginationRootSlots,
    PaginationSlotProps,
} from "./pagination-root.ts";
export { Pagination } from "./parts.ts";
