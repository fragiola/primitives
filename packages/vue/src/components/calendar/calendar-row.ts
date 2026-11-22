import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import { defineComponent, h, type PropType, type VNode } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import {
    type AsProp,
    asProp,
    type RenderSlotProps,
    renderPart,
} from "../../utils/render-part.ts";
import { CalendarCell } from "./calendar-cell.ts";
import { CalendarKey } from "./calendar-context.ts";

export interface CalendarRowProps {
    week: PlainDate[];
}

/** The default slot renders each date of the week (default: a Cell each). */
export interface CalendarRowSlots {
    default?: (scope: { date: PlainDate }) => VNode[];
    render?: (scope: RenderSlotProps<Record<string, never>>) => VNode[];
}

/** One week; the default scoped slot gets `{ date }` (default: a Cell each). */
export const CalendarRow: PublicComponent<
    CalendarRowProps & { as?: AsProp },
    CalendarRowSlots
> = publicComponent(
    defineComponent({
        name: "CalendarRow",
        inheritAttrs: false,
        props: {
            ...asProp,
            week: { type: Array as PropType<PlainDate[]>, required: true },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CalendarKey, "Calendar.Row");
            return () =>
                renderPart(
                    "tr",
                    { attrs, slots },
                    props.as,
                    {},
                    { "data-primitives-part": `${context.component}-row` },
                    () =>
                        props.week.flatMap((date) =>
                            slots.default
                                ? slots.default({ date })
                                : [
                                      h(CalendarCell, {
                                          key: toIsoDate(date),
                                          date,
                                      }),
                                  ],
                        ),
                );
        },
    }),
);
