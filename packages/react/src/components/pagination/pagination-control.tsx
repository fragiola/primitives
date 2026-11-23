import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PaginationContext } from "./pagination-context.ts";

/** What a Previous, Next, First or Last renders with. */
export interface PaginationControlState {
    /** The page it moves to. */
    page: number;
    disabled: boolean;
}

export interface PaginationControlProps
    extends PartProps<PaginationControlState> {
    /**
     * Whether the rendered element is a native `<button>` (default `true`); `false` when `render`
     * gives a link: no `type`, and `aria-disabled` instead of `disabled`.
     */
    nativeButton?: boolean;
    onClick?: MouseEventHandler<HTMLElement>;
}

/** The attributes of a pressable part while enabled or disabled, native button or link. */
export function controlAttributes(
    nativeButton: boolean,
    disabled: boolean,
): Record<string, unknown> {
    return nativeButton
        ? { type: "button", disabled: disabled || undefined }
        : { "aria-disabled": disabled ? "true" : undefined };
}

type Kind = "previous" | "next" | "first" | "last";

/** A Previous, Next, First or Last (spec/pagination.md): disabled at its edge. */
export function usePaginationControl(
    kind: Kind,
    name: string,
    { nativeButton = true, onClick, ...props }: PaginationControlProps,
): ReactNode {
    const context = useRequiredContext(PaginationContext, name);
    const target =
        kind === "previous"
            ? context.page - 1
            : kind === "next"
              ? context.page + 1
              : kind === "first"
                ? 1
                : context.count;
    const atEdge =
        kind === "previous" || kind === "first"
            ? context.page <= 1
            : context.page >= context.count;
    const disabled = context.disabled || atEdge;
    const state = {
        page: Math.min(context.count, Math.max(1, target)),
        disabled,
    };
    return renderElement("button", props, state, {
        ...controlAttributes(nativeButton, disabled),
        onClick: (event: MouseEvent<HTMLElement>) => {
            if (disabled) {
                event.preventDefault();
                return;
            }
            context.setPage(target, {
                reason: `${kind}-press` as ChangeReason,
                event: event.nativeEvent,
            });
            onClick?.(event);
        },
        "data-primitives-part": `pagination-${kind}`,
        ...stateAttributes({ disabled }),
    });
}
