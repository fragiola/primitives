import { Component, signal } from "@angular/core";
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
    type DateRange,
    type PlainDate,
    RangeCalendarRoot,
} from "@fragiola/primitives-angular/range-calendar";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const local = (date: PlainDate) =>
    new Date(date.year, date.month - 1, date.day);
const DAY = 24 * 60 * 60 * 1000;
/** `Nov 24 – 28, 2026, 4 nights`: the chosen stay. */
function summary(range: DateRange | null): string {
    if (range === null) {
        return "Choose your check-in, then your check-out.";
    }
    const dates = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
    }).formatRange(local(range.start), local(range.end));
    const nights = Math.round(
        (local(range.end).getTime() - local(range.start).getTime()) / DAY,
    );
    return `${dates}, ${nights} ${nights === 1 ? "night" : "nights"}`;
}

// A stay: two months side by side; the first day chosen is the check-in, hovering previews the
// stay, the second day chosen is the check-out (swapped when it comes first), Escape cancels a
// started stay (spec/calendar.md).
@Component({
    selector: "example-trip-dates",
    imports: [
        RangeCalendarRoot,
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
        <div rangeCalendarRoot [(value)]="stay" [visibleMonths]="2" locale="en-US" [class]="styles.root">
            <div [class]="styles.months">
                @for (offset of offsets; track offset) {
                    <div [class]="styles.month">
                        <div [class]="styles.header">
                            @if (offset === 0) {
                                <button calendarPrevButton aria-label="Previous months" [class]="styles.prevButton">‹</button>
                            } @else {
                                <span [class]="styles.spacer"></span>
                            }
                            <h2 calendarHeading #heading="calendarHeading" [offset]="offset" [class]="styles.heading">{{ heading.month() }}</h2>
                            @if (offset === 1) {
                                <button calendarNextButton aria-label="Next months" [class]="styles.nextButton">›</button>
                            } @else {
                                <span [class]="styles.spacer"></span>
                            }
                        </div>
                        <table calendarGrid [offset]="offset" [class]="styles.grid">
                            <thead calendarGridHeader #header="calendarGridHeader">
                                <tr>
                                    @for (weekday of header.weekdays(); track weekday.index) {
                                        <th calendarHeaderCell [weekday]="weekday" [class]="styles.headerCell">{{ weekday.short }}</th>
                                    }
                                </tr>
                            </thead>
                            <tbody calendarGridBody #body="calendarGridBody">
                                @for (week of body.weeks(); track weekKey(week)) {
                                    <tr calendarRow>
                                        @for (date of week; track iso(date)) {
                                            <td calendarCell #cell="calendarCell" [date]="date" [class]="styles.cell">{{ cell.dayNumber() }}</td>
                                        }
                                    </tr>
                                }
                            </tbody>
                        </table>
                    </div>
                }
            </div>
            <p role="status" [class]="styles.status">{{ summary(stay()) }}</p>
        </div>
    `,
})
export default class TripDates {
    protected readonly styles = styles;
    protected readonly offsets = [0, 1];
    protected readonly iso = iso;
    protected readonly summary = summary;
    protected readonly stay = signal<DateRange | null>(null);

    protected weekKey(week: PlainDate[]): string {
        return week.map(iso).join();
    }
}
