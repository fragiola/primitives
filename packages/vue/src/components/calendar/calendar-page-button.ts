import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { CalendarKey } from "./calendar-context.ts";

export interface CalendarPageButtonState {
    disabled: boolean;
}

/** A button that shows the previous or next page of months; the consumer names it. */
export function definePageButton(name: string, delta: 1 | -1) {
    const part = delta < 0 ? "prev-button" : "next-button";
    return defineComponent({
        name,
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CalendarKey,
                `Calendar.${delta < 0 ? "PrevButton" : "NextButton"}`,
            );
            return () => {
                const disabled = context.disabled() || !context.canPage(delta);
                const grids = Array.from(
                    { length: context.visibleMonths() },
                    (_, offset) => context.gridId(offset),
                ).join(" ");
                return renderPart(
                    "button",
                    { attrs, slots },
                    props.as,
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
            };
        },
    });
}
