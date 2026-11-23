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

/** The next page's control (spec/pagination.md). */
export const PaginationNext: PartComponent<
    PaginationControlProps,
    PaginationControlState
> = publicComponent(
    defineComponent({
        name: "PaginationNext",
        inheritAttrs: false,
        props: paginationControlProps,
        setup: (props, context) =>
            setupPaginationControl("next", "Pagination.Next", props, context),
    }),
);
