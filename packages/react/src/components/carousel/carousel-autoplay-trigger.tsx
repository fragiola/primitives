import type { MouseEvent, MouseEventHandler, ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselContext } from "./carousel-context.ts";

/** What the AutoplayTrigger renders with. */
export interface CarouselAutoplayTriggerState {
    playing: boolean;
}

export interface CarouselAutoplayTriggerProps
    extends Omit<PartProps<CarouselAutoplayTriggerState>, "children"> {
    /** The app's label, which follows the state: a node, or a function of the state. */
    children?: ReactNode | ((state: CarouselAutoplayTriggerState) => ReactNode);
    onClick?: MouseEventHandler<HTMLElement>;
}

/**
 * Stops and starts the rotation (spec/carousel.md): the APG's rotation control, whose label (the
 * app's) changes with the state, with no `aria-pressed`.
 */
export function CarouselAutoplayTrigger({
    children,
    onClick,
    ...props
}: CarouselAutoplayTriggerProps) {
    const context = useRequiredContext(
        CarouselContext,
        "Carousel.AutoplayTrigger",
    );
    const state = { playing: context.playing };
    return renderElement(
        "button",
        {
            ...props,
            children:
                typeof children === "function" ? children(state) : children,
        },
        state,
        {
            type: "button",
            onClick: (event: MouseEvent<HTMLElement>) => {
                context.setPlaying(!context.playing, {
                    reason: "trigger-press",
                    event: event.nativeEvent,
                });
                onClick?.(event);
            },
            "data-primitives-part": "carousel-autoplay-trigger",
            ...stateAttributes({ playing: context.playing }),
        },
    );
}
