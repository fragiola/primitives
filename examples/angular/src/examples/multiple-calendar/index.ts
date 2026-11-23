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
    MultipleCalendarRoot,
    type PlainDate,
} from "@fragiola/primitives-angular/multiple-calendar";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a day's key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// Several dates in one calendar: press the days you are available (from today on, five at most);
// a chosen day pressed again is removed. The calendar renders one hidden input per day, so the
// form submits `days` once per date (spec/calendar.md, "Multiple dates").
@Component({
    selector: "example-availability",
    imports: [
        MultipleCalendarRoot,
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
        <form [class]="styles.form" (submit)="submit($event)">
            <p id="availability-hint" [class]="styles.hint">Choose up to five days you are available.</p>
            <div multipleCalendarRoot [name]="'days'" [maxSelected]="5" [min]="today" locale="en-US" [class]="styles.calendar.root">
                <div [class]="styles.header">
                    <button calendarPrevButton aria-label="Previous month" [class]="styles.calendar.prevButton">‹</button>
                    <h2 calendarHeading #heading="calendarHeading" [class]="styles.calendar.heading">{{ heading.month() }}</h2>
                    <button calendarNextButton aria-label="Next month" [class]="styles.calendar.nextButton">›</button>
                </div>
                <table calendarGrid aria-describedby="availability-hint" [class]="styles.calendar.grid">
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
            <button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Saved: " + saved() }}</p>
        </form>
    `,
})
export default class Availability {
    protected readonly styles = styles;
    protected readonly today = today;
    protected readonly iso = iso;
    protected readonly saved = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const days = new FormData(event.target as HTMLFormElement).getAll(
            "days",
        );
        this.saved.set(days.length === 0 ? "no day" : days.join(", "));
    }
}
