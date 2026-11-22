import { type Weekday, weekdays } from "@fragiola/primitives/date";
import { defineComponent, h, type VNode } from "vue";
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
import { CalendarKey } from "./calendar-context.ts";
import { CalendarHeaderCell } from "./calendar-header-cell.ts";

/** The default slot renders each weekday, in the locale's order (default: a HeaderCell each). */
export interface CalendarGridHeaderSlots {
    default?: (scope: { weekday: Weekday }) => VNode[];
    render?: (scope: RenderSlotProps<Record<string, never>>) => VNode[];
}

/** `thead` with one row; the default scoped slot gets `{ weekday }` (default: a HeaderCell each). */
export const CalendarGridHeader: PublicComponent<
    { as?: AsProp },
    CalendarGridHeaderSlots
> = publicComponent(
    defineComponent({
        name: "CalendarGridHeader",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CalendarKey,
                "Calendar.GridHeader",
            );
            return () => {
                const days = weekdays(context.locale(), context.firstDay());
                return renderPart(
                    "thead",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": `${context.component}-grid-header`,
                    },
                    () =>
                        h(
                            "tr",
                            days.flatMap((weekday) =>
                                slots.default
                                    ? slots.default({ weekday })
                                    : [
                                          h(CalendarHeaderCell, {
                                              key: weekday.index,
                                              weekday,
                                          }),
                                      ],
                            ),
                        ),
                );
            };
        },
    }),
);
