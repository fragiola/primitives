import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import { defineComponent, h, inject, type VNode } from "vue";
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
import { CalendarGridKey, CalendarKey } from "./calendar-context.ts";
import { CalendarRow } from "./calendar-row.ts";

/** The default slot renders each week, 6 of them (default: a Row each). */
export interface CalendarGridBodySlots {
    default?: (scope: { week: PlainDate[] }) => VNode[];
    render?: (scope: RenderSlotProps<Record<string, never>>) => VNode[];
}

/** `tbody`; the default scoped slot gets `{ week }`, 6 of them (default: a Row each). */
export const CalendarGridBody: PublicComponent<
    { as?: AsProp },
    CalendarGridBodySlots
> = publicComponent(
    defineComponent({
        name: "CalendarGridBody",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                CalendarKey,
                "Calendar.GridBody",
            );
            const month = inject(CalendarGridKey, null);
            return () => {
                const shown = month?.value ?? context.visibleStart.value;
                const weeks = context
                    .math()
                    .monthGrid(shown, context.firstDay());
                return renderPart(
                    "tbody",
                    { attrs, slots },
                    props.as,
                    {},
                    {
                        "data-primitives-part": `${context.component}-grid-body`,
                    },
                    () =>
                        weeks.flatMap((week) =>
                            slots.default
                                ? slots.default({ week })
                                : [
                                      h(CalendarRow, {
                                          key: toIsoDate(week[0] as PlainDate),
                                          week,
                                      }),
                                  ],
                        ),
                );
            };
        },
    }),
);
