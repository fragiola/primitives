import type { MouseEvent, MouseEventHandler } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PaginationContext } from "./pagination-context.ts";
import { controlAttributes } from "./pagination-control.tsx";

export interface PaginationItemState {
    /** Its page. */
    page: number;
    /** It is the current page. */
    current: boolean;
    disabled: boolean;
}

export interface PaginationItemProps extends PartProps<PaginationItemState> {
    /** Its page, from 1. */
    value: number;
    /** `false` when `render` gives a link (default `true`: a native `<button>`). */
    nativeButton?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
}

/** A page (spec/pagination.md): `aria-current="page"` while it is the current one. */
export function PaginationItem({
    value,
    nativeButton = true,
    onClick,
    ...props
}: PaginationItemProps) {
    const context = useRequiredContext(PaginationContext, "Pagination.Item");
    const current = value === context.page;
    const { disabled } = context;
    return renderElement(
        "button",
        props,
        { page: value, current, disabled },
        {
            ...controlAttributes(nativeButton, disabled),
            "aria-current": current ? "page" : undefined,
            onClick: (event: MouseEvent<HTMLElement>) => {
                if (disabled) {
                    event.preventDefault();
                    return;
                }
                context.setPage(value, {
                    reason: "item-press",
                    event: event.nativeEvent,
                });
                onClick?.(event);
            },
            "data-primitives-part": "pagination-item",
            ...stateAttributes({ current, disabled }),
        },
    );
}
