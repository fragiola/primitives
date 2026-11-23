import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PaginationKey } from "./pagination-context.ts";
import { controlAttributes, withoutClick } from "./pagination-control.ts";

export interface PaginationItemState {
    /** Its page. */
    page: number;
    /** It is the current page. */
    current: boolean;
    disabled: boolean;
}

export interface PaginationItemProps {
    /** Its page, from 1. */
    value: number;
    /** `false` when `as` or the `render` slot gives a link (default `true`: a native `<button>`). */
    nativeButton?: boolean;
}

/** A page (spec/pagination.md): `aria-current="page"` while it is the current one. */
export const PaginationItem: PartComponent<
    PaginationItemProps,
    PaginationItemState
> = publicComponent(
    defineComponent({
        name: "PaginationItem",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: { type: Number, required: true },
            nativeButton: { type: Boolean, default: true },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                PaginationKey,
                "Pagination.Item",
            );
            return () => {
                const { page, disabled } = context.state();
                const current = props.value === page;
                const { rest, onClick } = withoutClick(attrs);
                return renderPart(
                    "button",
                    { attrs: rest, slots },
                    props.as,
                    { page: props.value, current, disabled },
                    {
                        ...controlAttributes(props.nativeButton, disabled),
                        "aria-current": current ? "page" : undefined,
                        onClick: (event: MouseEvent) => {
                            if (disabled) {
                                event.preventDefault();
                                return;
                            }
                            context.setPage(props.value, {
                                reason: "item-press",
                                event,
                            });
                            onClick?.(event);
                        },
                        "data-primitives-part": "pagination-item",
                        ...stateAttributes({ current, disabled }),
                    },
                );
            };
        },
    }),
);
