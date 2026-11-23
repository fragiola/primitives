import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type PaginationControlProps,
    type PaginationControlState,
    paginationControlProps,
    setupPaginationControl,
} from "./pagination-control.ts";

/** The last page's control (spec/pagination.md). */
export const PaginationLast: PartComponent<
    PaginationControlProps,
    PaginationControlState
> = publicComponent(
    defineComponent({
        name: "PaginationLast",
        inheritAttrs: false,
        props: paginationControlProps,
        setup: (props, context) =>
            setupPaginationControl("last", "Pagination.Last", props, context),
    }),
);
