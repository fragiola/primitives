import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CalendarContext } from "../calendar/calendar-context.ts";
import {
    CalendarViewContext,
    type CalendarViewName,
} from "./calendar-view-context.ts";

export interface CalendarViewTriggerState {
    view: CalendarViewName;
    /** In the year view: there is no view above. */
    disabled: boolean;
}

export interface CalendarViewTriggerProps
    extends PartProps<CalendarViewTriggerState> {}

/**
 * Goes one view up: days → months → years (spec/month-calendar.md, "Views"). Its content is the
 * consumer's (typically the view's Heading); the new view's focused cell takes the focus.
 */
export function CalendarViewTrigger(props: CalendarViewTriggerProps) {
    const calendar = useRequiredContext(
        CalendarContext,
        "CalendarView.Trigger",
    );
    const context = useRequiredContext(
        CalendarViewContext,
        "CalendarView.Trigger",
    );
    const { view } = context;
    const disabled = view === "year";
    return renderElement(
        "button",
        props,
        { view, disabled },
        {
            type: "button",
            disabled,
            "data-primitives-part": `${calendar.component}-view-trigger`,
            ...stateAttributes({ view, disabled }),
            onClick: () => {
                if (!disabled) {
                    context.change(
                        view === "day" ? "month" : "year",
                        "trigger-press",
                    );
                }
            },
        },
    );
}
