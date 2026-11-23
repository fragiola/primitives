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
    CalendarRoot,
    CalendarRow,
} from "@fragiola/primitives-angular/calendar";
import {
    DateFieldInput,
    DateFieldSegment,
    type DateFieldValue,
    DatePickerInputRoot,
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    type PlainDate,
} from "@fragiola/primitives-angular/date-picker-input";
import {
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A date picker you can also type into: the segments take the departure date, the button beside
// them opens the calendar on it, and choosing a day fills the segments. A typed day before today is
// no value (the segments show it invalid) and leaves the field empty; the picker submits the day
// itself (spec/calendar.md, "Typed input").
@Component({
    selector: "example-departure-date",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldError,
        DatePickerInputRoot,
        DateFieldInput,
        DateFieldSegment,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
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
    ],
    template: `
        <form (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'departure'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Departure</label>
                <ng-container datePickerInputRoot [(value)]="value" [min]="today" [required]="true" [locale]="'en-US'">
                    <div [class]="styles.typed.group">
                        <div dateFieldInput #segments="dateFieldInput" [class]="styles.input">
                            @for (segment of segments.segments(); track segment.index) {
                                <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                            }
                        </div>
                        <button datePickerTrigger aria-label="Choose date" [class]="styles.typed.trigger"><span aria-hidden="true">▾</span></button>
                    </div>
                    <ng-container *datePickerPortal>
                        <div datePickerPositioner [sideOffset]="4" [class]="styles.picker.positioner">
                            <div datePickerPopup aria-label="Departure date" [class]="styles.picker.popup">
                                <div calendarRoot [class]="styles.calendar.root">
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
                <div *fieldError [class]="styles.field.error">Enter a departure date from today on.</div>
            </div>
            <button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Saved: " + saved() }}</p>
        </form>
    `,
})
export default class DepartureDate {
    protected readonly styles = styles;
    protected readonly today = today;
    protected readonly iso = iso;
    protected readonly value = signal<DateFieldValue | null>(null);
    protected readonly saved = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.saved.set(String(data.get("departure")));
    }
}
