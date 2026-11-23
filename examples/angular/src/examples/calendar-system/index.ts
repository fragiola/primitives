import { Component, signal } from "@angular/core";
import { persian } from "@fragiola/primitives/calendar-systems";
import {
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    CalendarHeading,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarRoot,
    CalendarRow,
    type PlainDate,
} from "@fragiola/primitives-angular/calendar";
import {
    DateFieldInput,
    DateFieldRoot,
    DateFieldSegment,
    type DateFieldValue,
} from "@fragiola/primitives-angular/date-field";
import { FieldLabel, FieldRoot } from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-20`: the ISO date, whatever calendar shows it. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A calendar and a date field in the Persian calendar, right to left: `[calendar]` makes the
// grid's months, its names and Page Up / Down the system's, and the field's segments its year,
// month and day, while both keep one ISO date (spec/calendar-systems.md).
@Component({
    selector: "example-persian-calendar",
    imports: [
        CalendarRoot,
        CalendarPrevButton,
        CalendarHeading,
        CalendarNextButton,
        CalendarGrid,
        CalendarGridHeader,
        CalendarHeaderCell,
        CalendarGridBody,
        CalendarRow,
        CalendarCell,
        FieldRoot,
        FieldLabel,
        DateFieldRoot,
        DateFieldInput,
        DateFieldSegment,
    ],
    template: `
        <div [class]="styles.example">
            <div dir="rtl" [class]="styles.panel">
                <div calendarRoot [(value)]="date" [calendar]="persian" locale="fa-IR" [class]="styles.calendar.root">
                    <div [class]="styles.header">
                        <button calendarPrevButton aria-label="Previous month" [class]="styles.calendar.prevButton">›</button>
                        <h2 calendarHeading #heading="calendarHeading" [class]="styles.calendar.heading">{{ heading.month() }}</h2>
                        <button calendarNextButton aria-label="Next month" [class]="styles.calendar.nextButton">‹</button>
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
                                    @for (day of week; track iso(day)) {
                                        <td calendarCell #cell="calendarCell" [date]="day" [class]="styles.calendar.cell">{{ cell.dayNumber() }}</td>
                                    }
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
                <div fieldRoot [class]="styles.field.root">
                    <label fieldLabel [class]="styles.field.label">Date</label>
                    <div dateFieldRoot [value]="date()" (valueChange)="setFromField($event)" [calendar]="persian" [locale]="'fa-IR'" [class]="styles.dateField.root">
                        <div dateFieldInput #input="dateFieldInput" [class]="styles.dateField.input">
                            @for (segment of input.segments(); track segment.index) {
                                <span [dateFieldSegment]="segment" [class]="styles.dateField.segment">{{ segment.text }}</span>
                            }
                        </div>
                    </div>
                </div>
            </div>
            <p role="status" [class]="styles.status">{{ date() === null ? "ISO: none" : "ISO: " + iso(date()!) }}</p>
        </div>
    `,
})
export default class PersianCalendar {
    protected readonly styles = styles;
    protected readonly persian = persian;
    protected readonly today = today;
    protected readonly iso = iso;
    protected readonly date = signal<PlainDate | null>(today);

    /** The date part of a field's value (a day granularity gives a date already). */
    protected setFromField(value: DateFieldValue | null): void {
        this.date.set(
            value === null
                ? null
                : { year: value.year, month: value.month, day: value.day },
        );
    }
}
