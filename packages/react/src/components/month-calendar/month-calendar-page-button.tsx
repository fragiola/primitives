import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MonthCalendarContext } from "./month-calendar-context.ts";

export interface MonthCalendarPageButtonState {
    disabled: boolean;
}

/** A button that shows the previous or next page (a year; 12 years); the consumer names it. */
export function MonthCalendarPageButton({
    delta,
    ...props
}: PartProps<MonthCalendarPageButtonState> & { delta: 1 | -1 }): ReactNode {
    const part = delta < 0 ? "prev-button" : "next-button";
    const context = useRequiredContext(
        MonthCalendarContext,
        `MonthCalendar.${delta < 0 ? "PrevButton" : "NextButton"}`,
    );
    const disabled = context.disabled || !context.canPage(delta);
    return renderElement(
        "button",
        props,
        { disabled },
        {
            type: "button",
            disabled,
            "aria-controls": context.gridId,
            "data-primitives-part": `${context.component}-${part}`,
            ...stateAttributes({ disabled }),
            onClick: () => {
                // the button keeps the focus
                context.focusPending.current = false;
                context.page(delta);
            },
        },
    );
}
