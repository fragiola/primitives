import { unitRows } from "@fragiola/primitives/month-year";
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
import { MonthCalendarKey } from "./month-calendar-context.ts";
import { MonthCalendarRow } from "./month-calendar-row.ts";
import { itemIndex, type MonthCalendarItem } from "./month-calendar-value.ts";

/** The default slot renders each row of `columns` items (default: a Row each). */
export interface MonthCalendarGridBodySlots {
    default?: (scope: { row: MonthCalendarItem[] }) => VNode[];
    render?: (scope: RenderSlotProps<Record<string, never>>) => VNode[];
}

/** The rows of the page (`tbody`); the default scoped slot gets `{ row }`. */
export const MonthCalendarGridBody: PublicComponent<
    { as?: AsProp },
    MonthCalendarGridBodySlots
> = publicComponent(
    defineComponent({
        name: "MonthCalendarGridBody",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                MonthCalendarKey,
                "MonthCalendar.GridBody",
            );
            return () => {
                const rows = unitRows(
                    context.pageStart.value,
                    context.columns(),
                ).map((row) => row.map(context.itemOf));
                return renderPart(
                    "tbody",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": `${context.component}-grid-body`,
                    },
                    () =>
                        rows.flatMap((row) =>
                            slots.default
                                ? slots.default({ row })
                                : [
                                      h(MonthCalendarRow, {
                                          key: itemIndex(
                                              context.kind,
                                              row[0] as MonthCalendarItem,
                                          ),
                                          row,
                                      }),
                                  ],
                        ),
                );
            };
        },
    }),
);
