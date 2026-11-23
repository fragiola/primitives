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
import { MonthCalendarCell } from "./month-calendar-cell.ts";
import { MonthCalendarKey } from "./month-calendar-context.ts";
import { itemIndex, type MonthCalendarItem } from "./month-calendar-value.ts";

export interface MonthCalendarRowProps {
    row: MonthCalendarItem[];
}

/** The default slot renders each item of the row (default: a Cell each). */
export interface MonthCalendarRowSlots {
    default?: (scope: { item: MonthCalendarItem }) => VNode[];
    render?: (scope: RenderSlotProps<Record<string, never>>) => VNode[];
}

/** One row of items (`tr`); the default scoped slot gets `{ item }`. */
export const MonthCalendarRow: PublicComponent<
    MonthCalendarRowProps & { as?: AsProp },
    MonthCalendarRowSlots
> = publicComponent(
    defineComponent({
        name: "MonthCalendarRow",
        inheritAttrs: false,
        props: {
            ...asProp,
            row: {
                type: Array as PropType<MonthCalendarItem[]>,
                required: true,
            },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                MonthCalendarKey,
                "MonthCalendar.Row",
            );
            return () =>
                renderPart(
                    "tr",
                    { attrs, slots },
                    props.as,
                    {},
                    { "data-primitives-part": `${context.component}-row` },
                    () =>
                        props.row.flatMap((item) =>
                            slots.default
                                ? slots.default({ item })
                                : [
                                      h(MonthCalendarCell, {
                                          key: itemIndex(context.kind, item),
                                          value: item,
                                      }),
                                  ],
                        ),
                );
        },
    }),
);
