import type { Weekday } from "@fragiola/primitives/date";
import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { CalendarKey } from "./calendar-context.ts";

export interface CalendarHeaderCellState {
    weekday: Weekday;
}

export interface CalendarHeaderCellProps {
    weekday: Weekday;
}

/** One weekday: its short name, the long one as `abbr`. */
export const CalendarHeaderCell: PartComponent<
    CalendarHeaderCellProps,
    CalendarHeaderCellState
> = publicComponent(
    defineComponent({
        name: "CalendarHeaderCell",
        inheritAttrs: false,
        props: {
            ...asProp,
            weekday: { type: Object as PropType<Weekday>, required: true },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CalendarKey,
                "Calendar.HeaderCell",
            );
            return () => {
                const state = { weekday: props.weekday };
                return renderPart(
                    "th",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        scope: "col",
                        abbr: props.weekday.long,
                        "data-primitives-part": `${context.component}-header-cell`,
                    },
                    () => slots.default?.({ state }) ?? props.weekday.short,
                );
            };
        },
    }),
);
