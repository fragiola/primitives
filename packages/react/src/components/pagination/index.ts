// The entry of @fragiola/primitives-react/pagination: a `nav` of page buttons or links, with
// Previous, Next, First and Last (spec/pagination.md, the APG-closest behaviour decided there).
// Its range is the toolkit's `/pagination`.

export type { PaginationItem as PaginationRangeItem } from "@fragiola/primitives/pagination";
export type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
export type { RenderProp } from "../../utils/render-element.tsx";
export type { PaginationState } from "./pagination-context.ts";
export type {
    PaginationControlProps,
    PaginationControlState,
} from "./pagination-control.tsx";
export type { PaginationEllipsisProps } from "./pagination-ellipsis.tsx";
export type {
    PaginationItemProps,
    PaginationItemState,
} from "./pagination-item.tsx";
export type {
    PaginationRenderProps,
    PaginationRootProps,
} from "./pagination-root.tsx";
export { Pagination } from "./parts.ts";
