import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CalendarKey } from "../calendar/calendar-context.ts";
import {
    CalendarViewKey,
    type CalendarViewName,
} from "./calendar-view-context.ts";

export interface CalendarViewTriggerState {
    view: CalendarViewName;
    /** In the year view: there is no view above. */
    disabled: boolean;
}

export type CalendarViewTriggerProps = Record<never, never>;

/**
 * Goes one view up: days → months → years (spec/month-calendar.md, "Views"). Its content is the
 * consumer's (typically the view's Heading); the new view's focused cell takes the focus.
 */
export const CalendarViewTrigger: PartComponent<
    CalendarViewTriggerProps,
    CalendarViewTriggerState
> = publicComponent(
    defineComponent({
        name: "CalendarViewTrigger",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const calendar = useRequiredContext(
                CalendarKey,
                "CalendarView.Trigger",
            );
            const context = useRequiredContext(
                CalendarViewKey,
                "CalendarView.Trigger",
            );
            return () => {
                const view = context.view();
                const disabled = view === "year";
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
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
            };
        },
    }),
);
