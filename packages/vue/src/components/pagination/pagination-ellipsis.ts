import { defineComponent } from "vue";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";

/** An Ellipsis has no state of its own (spec/pagination.md). */
export type PaginationEllipsisState = Record<string, never>;

const STATE: PaginationEllipsisState = {};

/** Stands for the pages a range leaves out (spec/pagination.md); its text is the app's. */
export const PaginationEllipsis: PartComponent<
    Record<never, never>,
    PaginationEllipsisState
> = publicComponent(
    defineComponent({
        name: "PaginationEllipsis",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            return () =>
                renderPart("span", { attrs, slots }, props.as, STATE, {
                    "data-primitives-part": "pagination-ellipsis",
                });
        },
    }),
);
