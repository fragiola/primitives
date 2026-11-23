import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { MonthCalendarKey } from "./month-calendar-context.ts";

export interface MonthCalendarPageButtonState {
    disabled: boolean;
}

/** A button that shows the previous or next page (a year; 12 years); the consumer names it. */
export function defineMonthPageButton(name: string, delta: 1 | -1) {
    const part = delta < 0 ? "prev-button" : "next-button";
    return defineComponent({
        name,
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                MonthCalendarKey,
                `MonthCalendar.${delta < 0 ? "PrevButton" : "NextButton"}`,
            );
            return () => {
                const disabled = context.disabled() || !context.canPage(delta);
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
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
            };
        },
    });
}
