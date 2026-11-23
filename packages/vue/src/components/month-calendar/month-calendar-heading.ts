import {
    formatYear,
    formatYearSpan,
    UNIT_PAGE_SIZE,
} from "@fragiola/primitives/month-year";
import { defineComponent } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { MonthCalendarKey } from "./month-calendar-context.ts";

export interface MonthCalendarHeadingState {
    /** The year (a month calendar) or the page of years it names, from `Intl`. */
    label: string;
}

export type MonthCalendarHeadingProps = Record<never, never>;

/** The year or the page of years shown, from `Intl` unless the default slot gives content. */
export const MonthCalendarHeading: PartComponent<
    MonthCalendarHeadingProps,
    MonthCalendarHeadingState
> = publicComponent(
    defineComponent({
        name: "MonthCalendarHeading",
        inheritAttrs: false,
        props: asProp,
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(
                MonthCalendarKey,
                "MonthCalendar.Heading",
            );
            return () => {
                const start = context.pageStart.value;
                const label =
                    context.kind === "month"
                        ? formatYear(context.locale(), start / UNIT_PAGE_SIZE)
                        : formatYearSpan(
                              context.locale(),
                              start,
                              start + UNIT_PAGE_SIZE - 1,
                          );
                const state = { label };
                return renderPart(
                    "h2",
                    { attrs, slots },
                    props.as,
                    state,
                    {
                        id: context.headingId,
                        "aria-live": "polite",
                        "data-primitives-part": `${context.component}-heading`,
                    },
                    () => slots.default?.({ state }) ?? label,
                );
            };
        },
    }),
);
