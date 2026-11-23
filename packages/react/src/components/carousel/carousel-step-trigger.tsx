import { stepCarouselPage } from "@fragiola/primitives/carousel";
import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselContext, carouselGroupId } from "./carousel-context.ts";

/** What a PrevTrigger or a NextTrigger renders with. */
export interface CarouselStepTriggerState {
    /** The page it moves to, `null` at an edge. */
    page: number | null;
    disabled: boolean;
}

export interface CarouselStepTriggerProps
    extends PartProps<CarouselStepTriggerState> {
    onClick?: MouseEventHandler<HTMLElement>;
}

/** A PrevTrigger or a NextTrigger (spec/carousel.md): disabled at its edge unless `loop`. */
export function useCarouselStepTrigger(
    kind: "prev" | "next",
    name: string,
    { onClick, ...props }: CarouselStepTriggerProps,
): ReactNode {
    const context = useRequiredContext(CarouselContext, name);
    const target = stepCarouselPage(
        context.page,
        context.pageCount,
        kind === "prev" ? -1 : 1,
        context.loop,
    );
    const disabled = target === null;
    return renderElement(
        "button",
        props,
        { page: target, disabled },
        {
            type: "button",
            disabled: disabled || undefined,
            "aria-controls": carouselGroupId(context.baseId),
            onClick: (event: MouseEvent<HTMLElement>) => {
                if (target === null) {
                    return;
                }
                context.setPage(target, {
                    reason: kind === "prev" ? "previous-press" : "next-press",
                    event: event.nativeEvent,
                });
                onClick?.(event);
            },
            "data-primitives-part": `carousel-${kind}-trigger`,
            ...stateAttributes({ disabled }),
        },
    );
}
