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

/** The previous page's control (spec/pagination.md). */
export const PaginationPrevious: PartComponent<
    PaginationControlProps,
    PaginationControlState
> = publicComponent(
    defineComponent({
        name: "PaginationPrevious",
        inheritAttrs: false,
        props: paginationControlProps,
        setup: (props, context) =>
            setupPaginationControl(
                "previous",
                "Pagination.Previous",
                props,
                context,
            ),
    }),
);
