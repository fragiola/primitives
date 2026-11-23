import { formatMonthYear } from "@fragiola/primitives/date";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CalendarKey } from "./calendar-context.ts";

export interface CalendarHeadingState {
    /** The month and year it names, from `Intl`. */
    month: string;
}

export interface CalendarHeadingProps {
    /** Which visible month it names (default 0). */
    offset?: number;
}

/** The month a grid shows, from `Intl` unless the default slot gives content. */
export const CalendarHeading: PartComponent<
    CalendarHeadingProps,
    CalendarHeadingState
> = publicComponent(
    defineComponent({
        name: "CalendarHeading",
        inheritAttrs: false,
        props: { ...asProp, offset: { type: Number, default: 0 } },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CalendarKey, "Calendar.Heading");
            return () => {
                const month = formatMonthYear(
                    context.locale(),
                    context
                        .math()
                        .addMonths(context.visibleStart.value, props.offset),
                );
                const state = { month };
                return renderPart(
                    "h2",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        id: context.headingId(props.offset),
                        "aria-live": props.offset === 0 ? "polite" : undefined,
                        "data-primitives-part": `${context.component}-heading`,
                    },
                    () => slots.default?.({ state }) ?? month,
                );
            };
        },
    }),
);
