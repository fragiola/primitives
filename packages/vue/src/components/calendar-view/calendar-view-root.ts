import type { CalendarSystem } from "@fragiola/primitives/calendar-systems";
import { daysInMonth, type PlainDate } from "@fragiola/primitives/date";
import {
    fromMonthIndex,
    monthIndex,
    type PlainYear,
    type PlainYearMonth,
} from "@fragiola/primitives/month-year";
import {
    defineComponent,
    Fragment,
    h,
    inject,
    type PropType,
    provide,
    type VNode,
    watch,
} from "vue";
import { useControllable } from "../../composables/use-controllable.ts";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import type { PublicComponent } from "../../utils/public-component.ts";
import { publicComponent } from "../../utils/public-component.ts";
import {
    type CalendarContext,
    CalendarKey,
} from "../calendar/calendar-context.ts";
import { PickerBindingKey } from "../calendar/picker-binding-context.ts";
import {
    type MonthCalendarBinding,
    MonthCalendarBindingKey,
} from "../month-calendar/month-calendar-binding-context.ts";
import type { MonthCalendarValue } from "../month-calendar/month-calendar-value.ts";
import {
    CalendarViewKey,
    type CalendarViewName,
} from "./calendar-view-context.ts";

export interface CalendarViewState {
    view: CalendarViewName;
}

export interface CalendarViewRootProps {
    /** The view shown (controlled; `v-model:view`). */
    view?: CalendarViewName;
    /** The view shown first, and again when a picker reopens (uncontrolled; default `"day"`). */
    defaultView?: CalendarViewName;
}

export type CalendarViewRootEmits = {
    "update:view": (view: CalendarViewName) => true;
    viewChange: (view: CalendarViewName, details: ChangeDetails) => true;
};

/** The default scoped slot gets `{ view }` and renders the current view. */
export interface CalendarViewRootSlots {
    default?: (scope: CalendarViewState) => VNode[];
}

const days = (year: number, month: number): PlainDate[] =>
    Array.from({ length: daysInMonth(year, month) }, (_, index) => ({
        year,
        month,
        day: index + 1,
    }));

const enabled = (calendar: CalendarContext, date: PlainDate) =>
    !calendar.cellState(date, date).disabled;

const dayNumber = (date: PlainDate) =>
    Date.UTC(date.year, date.month - 1, date.day) / 86_400_000;

/**
 * A view's binding in a calendar system (spec/calendar-systems.md): its months or years are the
 * system's; a choice goes to the enabled day of the unit nearest to the focused date's place in it
 * (the same day of the month, the same month and day of the year).
 */
function systemBinding(
    calendar: CalendarContext,
    system: CalendarSystem,
    kind: "month" | "year",
    change: (next: CalendarViewName, reason: "item-press") => void,
): Pick<
    MonthCalendarBinding,
    "options" | "focus" | "isDisabled" | "isSelected" | "choose"
> {
    const units = system.units(kind);
    const focusedDate = () => calendar.focusedDate.value;
    return {
        options: () => ({ locale: calendar.locale(), calendar: system }),
        focus: () => units.fromDate(focusedDate()),
        isDisabled: (index) =>
            !units.days(index).some((date) => enabled(calendar, date)),
        isSelected: (index) =>
            units
                .days(index)
                .some((date) => calendar.cellState(date, date).selected),
        choose: (item) => {
            if (item === null || "start" in item) {
                return;
            }
            const index = units.index(item);
            const date = focusedDate();
            const fields = system.fields(date);
            const place =
                kind === "month"
                    ? system.fromFields({
                          ...system.fromMonthIndex(index),
                          day: fields.day,
                      })
                    : system.addYears(date, item.year - fields.year);
            const target = units
                .days(index)
                .filter((day) => enabled(calendar, day))
                .sort(
                    (a, b) =>
                        Math.abs(dayNumber(a) - dayNumber(place)) -
                        Math.abs(dayNumber(b) - dayNumber(place)),
                )[0];
            if (target !== undefined && calendar.moveFocus(target)) {
                if (kind === "month") {
                    calendar.requestFocus();
                }
                change(kind === "month" ? "day" : "month", "item-press");
            }
        },
    };
}

/** The enabled day of the month nearest to `day`, or `null` when every day is disabled. */
function nearestDay(
    calendar: CalendarContext,
    year: number,
    month: number,
    day: number,
): PlainDate | null {
    const last = daysInMonth(year, month);
    const start = Math.min(day, last);
    for (let distance = 0; distance < last; distance++) {
        for (const candidate of [start - distance, start + distance]) {
            const date = { year, month, day: candidate };
            if (
                candidate >= 1 &&
                candidate <= last &&
                enabled(calendar, date)
            ) {
                return date;
            }
        }
    }
    return null;
}

/** The enabled date of the year nearest to the same month and day. */
function nearestInYear(
    calendar: CalendarContext,
    year: number,
    month: number,
    day: number,
): PlainDate | null {
    for (let distance = 0; distance < 12; distance++) {
        for (const candidate of [month - distance, month + distance]) {
            if (candidate >= 1 && candidate <= 12) {
                const date = nearestDay(calendar, year, candidate, day);
                if (date !== null) {
                    return date;
                }
            }
        }
    }
    return null;
}

/**
 * A calendar's day, month and year views (spec/month-calendar.md, "Views"), inside a Calendar,
 * RangeCalendar or MultipleCalendar Root. It renders no element: the consumer renders each view's
 * parts (the default scoped slot's `{ view }`), and a MonthCalendar or YearCalendar without a value
 * binds to it.
 */
export const CalendarViewRoot: PublicComponent<
    CalendarViewRootProps,
    CalendarViewRootSlots,
    CalendarViewRootEmits
> = publicComponent(
    defineComponent({
        name: "CalendarViewRoot",
        props: {
            view: {
                type: String as PropType<CalendarViewName>,
                default: undefined,
            },
            defaultView: {
                type: String as PropType<CalendarViewName>,
                default: "day",
            },
        },
        emits: {
            "update:view": (_view: CalendarViewName) => true,
            viewChange: (_view: CalendarViewName, _details: ChangeDetails) =>
                true,
        },
        setup(props, { slots, emit }) {
            const calendar = useRequiredContext(
                CalendarKey,
                "CalendarView.Root",
            );
            const picker = inject(PickerBindingKey, null);
            const current = useControllable<CalendarViewName, ChangeDetails>(
                () => props.view,
                props.defaultView,
                (next, details) => {
                    emit("update:view", next);
                    emit("viewChange", next, details);
                },
            );
            // a view switched to takes the focus (its cell mounts after the press)
            let switched = false;
            const change = (
                next: CalendarViewName,
                reason: "trigger-press" | "item-press",
            ) => {
                switched = true;
                current.set(next, { reason });
            };
            const open = () => picker?.open() ?? true;
            // a picker reopened shows the default view again, as a new calendar would
            watch(open, (isOpen) => {
                if (isOpen) {
                    switched = false;
                    current.set(props.defaultView, { reason: "none" });
                }
            });

            const kind = () =>
                current.value.value === "year" ? "year" : "month";
            const focusedDate = () => calendar.focusedDate.value;
            const monthEnabled = (year: number, month: number) =>
                days(year, month).some((date) => enabled(calendar, date));
            const monthSelected = (year: number, month: number) =>
                days(year, month).some(
                    (date) => calendar.cellState(date, date).selected,
                );
            const byMonth =
                (test: (year: number, month: number) => boolean) =>
                (index: number) => {
                    const { year, month } = fromMonthIndex(index);
                    return test(year, month);
                };
            const byYear =
                (test: (year: number, month: number) => boolean) =>
                (year: number) =>
                    Array.from({ length: 12 }, (_, index) => index + 1).some(
                        (month) => test(year, month),
                    );
            // with a calendar system, its months and years (read when used: the system may change)
            const inSystem = () => {
                const system = calendar.calendar();
                return system
                    ? systemBinding(calendar, system, kind(), change)
                    : null;
            };
            const binding: MonthCalendarBinding = {
                get kind() {
                    return kind();
                },
                mode: "single",
                open,
                focusOnMount: () => switched || (picker !== null && open()),
                value: () => null,
                options: () =>
                    inSystem()?.options() ?? { locale: calendar.locale() },
                readOnly: () => false,
                focus: () =>
                    inSystem()?.focus?.() ??
                    (kind() === "month"
                        ? monthIndex(focusedDate())
                        : focusedDate().year),
                isDisabled: (index) => {
                    const system = inSystem();
                    if (system?.isDisabled) {
                        return system.isDisabled(index);
                    }
                    return kind() === "month"
                        ? !byMonth(monthEnabled)(index)
                        : !byYear(monthEnabled)(index);
                },
                isSelected: (index) => {
                    const system = inSystem();
                    if (system?.isSelected) {
                        return system.isSelected(index);
                    }
                    return kind() === "month"
                        ? byMonth(monthSelected)(index)
                        : byYear(monthSelected)(index);
                },
                choose: (item: MonthCalendarValue) => {
                    const system = inSystem();
                    if (system) {
                        system.choose(item);
                        return;
                    }
                    if (item === null || "start" in item) {
                        return;
                    }
                    const date = focusedDate();
                    if (kind() === "month") {
                        // a month goes down to its days, on the same day (clamped, then enabled)
                        const { year, month } = item as PlainYearMonth;
                        const target = nearestDay(
                            calendar,
                            year,
                            month,
                            date.day,
                        );
                        if (target !== null && calendar.moveFocus(target)) {
                            calendar.requestFocus();
                            change("day", "item-press");
                        }
                        return;
                    }
                    // a year goes down to its months, on the same month and day
                    const target = nearestInYear(
                        calendar,
                        (item as PlainYear).year,
                        date.month,
                        date.day,
                    );
                    if (target !== null && calendar.moveFocus(target)) {
                        change("month", "item-press");
                    }
                },
            };
            provide(CalendarViewKey, {
                view: () => current.value.value,
                change,
            });
            provide(MonthCalendarBindingKey, binding);
            return () =>
                h(
                    Fragment,
                    slots.default?.({ view: current.value.value }) ?? [],
                );
        },
    }),
);
