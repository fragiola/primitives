import { tabsKeyTarget } from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { type KeyboardEvent, useContext } from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CarouselContext, type CarouselState } from "./carousel-context.ts";

export type CarouselIndicatorGroupProps = PartProps<CarouselState>;

/**
 * The slide picker controls (spec/carousel.md): a `group` of buttons, or in the tabbed variant a
 * `tablist` with the APG tabs' keys (automatic activation, wrapping), as Tabs' List.
 */
export function CarouselIndicatorGroup(props: CarouselIndicatorGroupProps) {
    const context = useRequiredContext(
        CarouselContext,
        "Carousel.IndicatorGroup",
    );
    const direction = useContext(DirectionContext);
    const tabbed = context.variant === "tabbed";
    const { page, pageCount, orientation, playing, paused, dragging } = context;
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (!tabbed) {
            return;
        }
        const list = event.currentTarget;
        const tabs = [...list.querySelectorAll<HTMLElement>('[role="tab"]')];
        const current = tabs.indexOf(event.target as HTMLElement);
        if (current === -1) {
            return;
        }
        const index = tabsKeyTarget(event.key, current, tabs.length, {
            orientation,
            rtl: getDirection(list, direction) === "rtl",
            loop: true,
        });
        if (index === null) {
            return;
        }
        event.preventDefault();
        tabs[index]?.focus();
        context.setPage(index, {
            reason: "keyboard",
            event: event.nativeEvent,
        });
    };
    return renderElement(
        "div",
        props,
        { page, pageCount, orientation, playing, paused, dragging },
        {
            role: tabbed ? "tablist" : "group",
            "aria-orientation": tabbed ? orientation : undefined,
            onKeyDown,
            "data-primitives-part": "carousel-indicator-group",
            ...stateAttributes({ orientation }),
        },
    );
}
