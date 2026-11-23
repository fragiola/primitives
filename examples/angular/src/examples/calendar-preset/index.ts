import { Component, signal } from "@angular/core";
import {
    CalendarPreset,
    type DateRange,
    type PlainDate,
} from "@fragiola/primitives-angular/calendar-preset";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    DateRangePickerRoot,
} from "@fragiola/primitives-angular/date-range-picker";
import {
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarRow,
    RangeCalendarRoot,
} from "@fragiola/primitives-angular/range-calendar";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a day's key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
/** `Nov 14 – 20, 2026`: what the trigger shows. */
const format = (range: DateRange) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).formatRange(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        new Date(range.end.year, range.end.month - 1, range.end.day),
    );
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};
/** `days` days before `date` (the month and year carry). */
const daysBefore = (date: PlainDate, days: number): PlainDate => {
    const local = new Date(date.year, date.month - 1, date.day - days);
    return {
        year: local.getFullYear(),
        month: local.getMonth() + 1,
        day: local.getDate(),
    };
};

// The presets: functions of today, read when they render and when they are pressed.
const lastWeek = (day: PlainDate): DateRange => ({
    start: daysBefore(day, 6),
    end: day,
});
const lastMonth = (day: PlainDate): DateRange => ({
    start: daysBefore(day, 29),
    end: day,
});
const thisMonth = (day: PlainDate): DateRange => ({
    start: { ...day, day: 1 },
    end: day,
});

// A report's period: a date range picker whose calendar has presets. A preset sets the range in
// one press and closes the popup, as choosing the range's end does; the current one is marked
// (`data-selected`). Days after today are disabled (spec/calendar.md, "Presets").
@Component({
    selector: "example-report-period",
    imports: [
        DateRangePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        RangeCalendarRoot,
        CalendarPreset,
        CalendarPrevButton,
        CalendarHeading,
        CalendarNextButton,
        CalendarGrid,
        CalendarGridHeader,
        CalendarHeaderCell,
        CalendarGridBody,
        CalendarRow,
        CalendarCell,
    ],
    template: `
        <div [class]="styles.page">
            <ng-container dateRangePickerRoot [(value)]="range" [max]="today" locale="en-US">
                <button datePickerTrigger [class]="styles.picker.trigger">{{ label() }}</button>
                <ng-container *datePickerPortal>
                    <div datePickerPositioner [sideOffset]="4" [class]="styles.picker.positioner">
                        <div datePickerPopup aria-label="Report period" [class]="styles.picker.popup">
                            <div rangeCalendarRoot [class]="styles.calendar.root">
                                <div [class]="styles.preset.list">
                                    <button [calendarPreset]="lastWeek" [class]="styles.preset.preset">Last 7 days</button>
                                    <button [calendarPreset]="lastMonth" [class]="styles.preset.preset">Last 30 days</button>
                                    <button [calendarPreset]="thisMonth" [class]="styles.preset.preset">This month</button>
                                </div>
                                <div [class]="styles.header">
                                    <button calendarPrevButton aria-label="Previous month" [class]="styles.calendar.prevButton">‹</button>
                                    <h2 calendarHeading #heading="calendarHeading" [class]="styles.calendar.heading">{{ heading.month() }}</h2>
                                    <button calendarNextButton aria-label="Next month" [class]="styles.calendar.nextButton">›</button>
                                </div>
                                <table calendarGrid [class]="styles.calendar.grid">
                                    <thead calendarGridHeader #header="calendarGridHeader">
                                        <tr>
                                            @for (weekday of header.weekdays(); track weekday.index) {
                                                <th calendarHeaderCell [weekday]="weekday" [class]="styles.calendar.headerCell">{{ weekday.short }}</th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody calendarGridBody #body="calendarGridBody">
                                        @for (week of body.weeks(); track iso(week[0] ?? today)) {
                                            <tr calendarRow>
                                                @for (date of week; track iso(date)) {
                                                    <td calendarCell #cell="calendarCell" [date]="date" [class]="styles.calendar.cell">{{ cell.dayNumber() }}</td>
                                                }
                                            </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
})
export default class ReportPeriod {
    protected readonly styles = styles;
    protected readonly today = today;
    protected readonly iso = iso;
    protected readonly lastWeek = lastWeek;
    protected readonly lastMonth = lastMonth;
    protected readonly thisMonth = thisMonth;
    protected readonly range = signal<DateRange | null>(lastWeek(today));

    protected label(): string {
        const range = this.range();
        return range ? format(range) : "Choose a period";
    }
}
