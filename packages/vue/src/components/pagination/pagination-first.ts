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

/** The first page's control (spec/pagination.md). */
export const PaginationFirst: PartComponent<
    PaginationControlProps,
    PaginationControlState
> = publicComponent(
    defineComponent({
        name: "PaginationFirst",
        inheritAttrs: false,
        props: paginationControlProps,
        setup: (props, context) =>
            setupPaginationControl("first", "Pagination.First", props, context),
    }),
);
