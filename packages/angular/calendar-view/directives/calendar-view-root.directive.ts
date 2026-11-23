import {
    computed,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    output,
    signal,
    untracked,
} from "@angular/core";
import {
    fromMonthIndex,
    monthIndex,
    type PlainYear,
    type PlainYearMonth,
} from "@fragiola/primitives/month-year";
import {
    CALENDAR,
    PICKER_BINDING,
} from "@fragiola/primitives-angular/calendar";
import {
    type ChangeDetails,
    controllable,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/internal";
import {
    MONTH_CALENDAR_BINDING,
    type MonthCalendarBinding,
    type MonthCalendarKind,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";
import {
    CALENDAR_VIEW,
    type CalendarViewName,
} from "../utils/calendar-view-context.ts";
import {
    daysOf,
    enabledDay,
    nearestDay,
    nearestInYear,
} from "../utils/nearest-day.ts";

/**
 * A calendar's day, month and year views (spec/month-calendar.md, "Views"), inside a
 * `[calendarRoot]`, `[rangeCalendarRoot]` or `[multipleCalendarRoot]`:
 * `<ng-container calendarViewRoot #views="calendarView">`, then
 * `@if (views.view() === "day") { ... }`. A `[monthCalendarRoot]` or `[yearCalendarRoot]` without a
 * value binds to it.
 */
@Directive({
    selector: "[calendarViewRoot]",
    exportAs: "calendarView",
    providers: [
        {
            provide: CALENDAR_VIEW,
            useFactory: () =>
                inject(forwardRef(() => CalendarViewRoot)).context,
        },
        {
            provide: MONTH_CALENDAR_BINDING,
            useFactory: () =>
                inject(forwardRef(() => CalendarViewRoot)).binding,
        },
    ],
})
export class CalendarViewRoot {
    private readonly calendar = inject(CALENDAR);
    private readonly picker = inject(PICKER_BINDING, { optional: true });
    /** The view shown (controlled, `[(view)]`). */
    readonly viewInput = input<CalendarViewName | undefined>(undefined, {
        alias: "view",
    });
    readonly viewChange = output<CalendarViewName>();
    /** The view shown first, and again when a picker reopens (uncontrolled; default `"day"`). */
    readonly defaultView = input<CalendarViewName>("day");
    readonly viewChangeDetails = output<ValueChangeEvent<CalendarViewName>>();
    private readonly current = controllable<CalendarViewName, ChangeDetails>(
        this.viewInput,
        this.viewChange,
        () => this.defaultView(),
        (value, details) => this.viewChangeDetails.emit({ value, details }),
    );
    /** The view shown. */
    readonly view = this.current.value;
    // a view switched to takes the focus (its cell is made after the press)
    private switched = false;
    readonly context = {
        view: this.view,
        change: (
            next: CalendarViewName,
            reason: "trigger-press" | "item-press",
        ) => {
            this.switched = true;
            this.current.set(next, { reason });
        },
    };
    private readonly open = computed(() => this.picker?.open() ?? true);
    private readonly kind = computed<MonthCalendarKind>(() =>
        this.view() === "year" ? "year" : "month",
    );
    readonly binding: MonthCalendarBinding = this.createBinding();

    constructor() {
        // a picker reopened shows the default view again, as a new calendar would
        let wasOpen: boolean | null = null;
        effect(() => {
            const open = this.open();
            untracked(() => {
                if (wasOpen !== null && wasOpen !== open && open) {
                    this.switched = false;
                    this.current.set(this.defaultView(), { reason: "none" });
                }
                wasOpen = open;
            });
        });
    }

    private createBinding(): MonthCalendarBinding {
        const calendar = this.calendar;
        const monthEnabled = (year: number, month: number) =>
            daysOf(year, month).some((date) => enabledDay(calendar, date));
        const monthSelected = (year: number, month: number) =>
            daysOf(year, month).some(
                (date) => calendar.cellState(date, date).selected,
            );
        const inYear = (
            year: number,
            test: (year: number, month: number) => boolean,
        ) =>
            Array.from({ length: 12 }, (_, index) => index + 1).some((month) =>
                test(year, month),
            );
        const test = (
            index: number,
            check: (year: number, month: number) => boolean,
        ) => {
            if (this.kind() === "month") {
                const { year, month } = fromMonthIndex(index);
                return check(year, month);
            }
            return inYear(index, check);
        };
        return {
            kind: this.kind,
            mode: "single",
            open: this.open,
            focusOnMount: () =>
                this.switched ||
                (this.picker !== null && untracked(this.picker.open)),
            value: signal<MonthCalendarValue>(null),
            options: computed(() => ({ locale: calendar.locale() })),
            readOnly: signal(false),
            focus: () => {
                const focused = calendar.focusedDate();
                return this.kind() === "month"
                    ? monthIndex(focused)
                    : focused.year;
            },
            isDisabled: (index) => !test(index, monthEnabled),
            isSelected: (index) => test(index, monthSelected),
            choose: (item: MonthCalendarValue) => {
                if (item === null || "start" in item) {
                    return;
                }
                const focused = untracked(calendar.focusedDate);
                if (untracked(this.kind) === "month") {
                    // a month goes down to its days, on the same day (clamped, then enabled)
                    const { year, month } = item as PlainYearMonth;
                    const target = nearestDay(
                        calendar,
                        year,
                        month,
                        focused.day,
                    );
                    if (target !== null && calendar.moveFocus(target)) {
                        calendar.requestFocus();
                        this.context.change("day", "item-press");
                    }
                    return;
                }
                // a year goes down to its months, on the same month and day
                const target = nearestInYear(
                    calendar,
                    (item as PlainYear).year,
                    focused.month,
                    focused.day,
                );
                if (target !== null && calendar.moveFocus(target)) {
                    this.context.change("month", "item-press");
                }
            },
        };
    }
}
