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
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerRoot,
    DatePickerTrigger,
    type PlainDate,
} from "@fragiola/primitives-angular/date-picker";
import {
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a day's key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
/** `Nov 24, 2026`: what the trigger shows. */
const format = (date: PlainDate) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(date.year, date.month - 1, date.day),
    );
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A booking form: a required picker in a field. The trigger opens a calendar on today, past days
// are disabled, choosing a day closes it and returns focus to the trigger, and the picker submits
// the day (`name` from its field); booking with no day shows the error (spec/calendar.md).
@Component({
    selector: "example-booking-form",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldDescription,
        FieldError,
        DatePickerRoot,
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
        <form [class]="styles.form" (submit)="submit($event)">
            <div fieldRoot [name]="'check-in'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Check-in</label>
                <ng-container datePickerRoot [(value)]="checkIn" [min]="today" required locale="en-US">
                    <button datePickerTrigger [class]="styles.picker.trigger">{{ label() }}</button>
                    <ng-container *datePickerPortal>
                        <div datePickerPositioner [sideOffset]="4" [class]="styles.picker.positioner">
                            <div datePickerPopup aria-label="Check-in date" [class]="styles.picker.popup">
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
                <p fieldDescription [class]="styles.field.description">We hold the room until noon.</p>
                <div *fieldError [class]="styles.field.error">Choose a check-in date.</div>
            </div>
            <button type="submit" [class]="styles.submit">Book</button>
            <p role="status" [class]="styles.status">{{ booked() === null ? "" : "Booked: " + booked() }}</p>
        </form>
    `,
})
export default class BookingForm {
    protected readonly styles = styles;
    protected readonly today = today;
    protected readonly iso = iso;
    protected readonly checkIn = signal<PlainDate | null>(null);
    protected readonly booked = signal<string | null>(null);

    protected label(): string {
        const date = this.checkIn();
        return date ? format(date) : "Choose a date";
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.booked.set(String(data.get("check-in") || "no date"));
    }
}
