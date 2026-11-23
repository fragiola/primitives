import type { Slots, VNode } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import type { ChangeReason } from "../../utils/change-details.ts";
import { type AsProp, asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { PaginationKey } from "./pagination-context.ts";

/** What a Previous, Next, First or Last renders with. */
export interface PaginationControlState {
    /** The page it moves to. */
    page: number;
    disabled: boolean;
}

export interface PaginationControlProps {
    /**
     * Whether the rendered element is a native `<button>` (default `true`); `false` when `as` or
     * the `render` slot gives a link: no `type`, and `aria-disabled` instead of `disabled`.
     */
    nativeButton?: boolean;
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

/** The consumer's attributes without its click listener, which the part calls itself. */
export function withoutClick(attrs: Record<string, unknown>): {
    rest: Record<string, unknown>;
    onClick: ((event: MouseEvent) => void) | undefined;
} {
    const { onClick, ...rest } = attrs;
    return {
        rest,
        onClick:
            typeof onClick === "function"
                ? (onClick as (event: MouseEvent) => void)
                : undefined,
    };
}

/** The props of a Previous, Next, First and Last. */
export const paginationControlProps = {
    ...asProp,
    nativeButton: { type: Boolean, default: true },
};

type Kind = "previous" | "next" | "first" | "last";

/**
 * The setup of a Previous, Next, First or Last (spec/pagination.md): disabled at its edge. Each
 * part declares its own component with it.
 */
export function setupPaginationControl(
    kind: Kind,
    partName: string,
    props: { as: AsProp | undefined; nativeButton: boolean },
    { attrs, slots }: { attrs: Record<string, unknown>; slots: Slots },
): () => VNode {
    const context = useRequiredContext(PaginationKey, partName);
    return () => {
        const { page, count, disabled: all } = context.state();
        const target =
            kind === "previous"
                ? page - 1
                : kind === "next"
                  ? page + 1
                  : kind === "first"
                    ? 1
                    : count;
        const atEdge =
            kind === "previous" || kind === "first" ? page <= 1 : page >= count;
        const disabled = all || atEdge;
        const { rest, onClick } = withoutClick(attrs);
        return renderPart(
            "button",
            { attrs: rest, slots },
            props.as,
            {
                page: Math.min(count, Math.max(1, target)),
                disabled,
            },
            {
                ...controlAttributes(props.nativeButton, disabled),
                onClick: (event: MouseEvent) => {
                    if (disabled) {
                        event.preventDefault();
                        return;
                    }
                    context.setPage(target, {
                        reason: `${kind}-press` as ChangeReason,
                        event,
                    });
                    onClick?.(event);
                },
                "data-primitives-part": `pagination-${kind}`,
                ...stateAttributes({ disabled }),
            },
        );
    };
}
