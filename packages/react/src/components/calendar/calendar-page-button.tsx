import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CalendarContext } from "./calendar-context.ts";

export interface CalendarPageButtonState {
    disabled: boolean;
}

/** A button that shows the previous or next page of months; the consumer names it. */
export function CalendarPageButton({
    delta,
    ...props
}: PartProps<CalendarPageButtonState> & { delta: 1 | -1 }): ReactNode {
    const part = delta < 0 ? "prev-button" : "next-button";
    const context = useRequiredContext(
        CalendarContext,
        `Calendar.${delta < 0 ? "PrevButton" : "NextButton"}`,
    );
    const disabled = context.disabled || !context.canPage(delta);
    const grids = Array.from({ length: context.visibleMonths }, (_, offset) =>
        context.gridId(offset),
    ).join(" ");
    return renderElement(
        "button",
        props,
        { disabled },
        {
            type: "button",
            disabled,
            "aria-controls": grids,
            "data-primitives-part": `${context.component}-${part}`,
            ...stateAttributes({ disabled }),
            onClick: () => context.page(delta),
        },
    );
}
