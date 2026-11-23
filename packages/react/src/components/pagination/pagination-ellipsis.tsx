import { type PartProps, renderElement } from "../../utils/render-element.tsx";

/** An Ellipsis has no state of its own (spec/pagination.md). */
export type PaginationEllipsisState = Record<string, never>;

export type PaginationEllipsisProps = PartProps<PaginationEllipsisState>;

const STATE: PaginationEllipsisState = {};

/** Stands for the pages a range leaves out (spec/pagination.md); its text is the app's. */
export function PaginationEllipsis(props: PaginationEllipsisProps) {
    return renderElement("span", props, STATE, {
        "data-primitives-part": "pagination-ellipsis",
    });
}
