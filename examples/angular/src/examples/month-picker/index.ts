import { Component, signal } from "@angular/core";
import {
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import {
    MonthCalendarCell,
    MonthCalendarGrid,
    MonthCalendarGridBody,
    MonthCalendarHeading,
    MonthCalendarNextButton,
    MonthCalendarPrevButton,
    MonthCalendarRoot,
    MonthCalendarRow,
} from "@fragiola/primitives-angular/month-calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    MonthPickerRoot,
    type PlainYearMonth,
} from "@fragiola/primitives-angular/month-picker";
import { styles } from "./styles.ts";

/** `2026-11`: a row's key. */
const key = (month: { year: number; month?: number } | undefined) =>
    month ? `${month.year}-${month.month ?? 0}` : "";
/** `11/2026`: what the trigger shows, as a card prints it. */
const format = (month: PlainYearMonth) =>
    `${String(month.month).padStart(2, "0")}/${month.year}`;
const now = new Date();
const thisMonth: PlainYearMonth = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
};

// A card's expiry: a required month picker in a field. The popup holds the months of a year (the
// past ones disabled), choosing one closes it and returns focus to the trigger, and the picker
// submits the month as ISO `2026-11`; saving with no month shows the error and focuses the trigger
// (spec/month-calendar.md, "Forms").
@Component({
    selector: "example-card-expiry",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldError,
        MonthPickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        MonthCalendarRoot,
        MonthCalendarPrevButton,
        MonthCalendarHeading,
        MonthCalendarNextButton,
        MonthCalendarGrid,
        MonthCalendarGridBody,
        MonthCalendarRow,
        MonthCalendarCell,
    ],
    template: `
        <form [class]="styles.form" (submit)="submit($event)">
            <div fieldRoot [name]="'expiry'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Expiry date</label>
                <ng-container monthPickerRoot [(value)]="expiry" [min]="thisMonth" required locale="en-US">
                    <button datePickerTrigger [class]="styles.picker.trigger">{{ label() }}</button>
                    <ng-container *datePickerPortal>
                        <div datePickerPositioner [sideOffset]="4" [class]="styles.picker.positioner">
                            <div datePickerPopup aria-label="Expiry month" [class]="styles.picker.popup">
                                <div monthCalendarRoot [class]="styles.calendar.root">
                                    <div [class]="styles.header">
                                        <button monthCalendarPrevButton aria-label="Previous year" [class]="styles.calendar.prevButton">‹</button>
                                        <h2 monthCalendarHeading #heading="monthCalendarHeading" [class]="styles.calendar.heading">{{ heading.label() }}</h2>
                                        <button monthCalendarNextButton aria-label="Next year" [class]="styles.calendar.nextButton">›</button>
                                    </div>
                                    <table monthCalendarGrid [class]="styles.calendar.grid">
                                        <tbody monthCalendarGridBody #body="monthCalendarGridBody">
                                            @for (row of body.rows(); track key(row[0])) {
                                                <tr monthCalendarRow>
                                                    @for (month of row; track key(month)) {
                                                        <td monthCalendarCell #cell="monthCalendarCell" [value]="month" [class]="styles.calendar.cell">{{ cell.text() }}</td>
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
                <div *fieldError [class]="styles.field.error">Choose the card's expiry month.</div>
            </div>
            <button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Saved: " + saved() }}</p>
        </form>
    `,
})
export default class CardExpiry {
    protected readonly styles = styles;
    protected readonly thisMonth = thisMonth;
    protected readonly key = key;
    protected readonly expiry = signal<PlainYearMonth | null>(null);
    protected readonly saved = signal<string | null>(null);

    protected label(): string {
        const month = this.expiry();
        return month ? format(month) : "Choose a month";
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.saved.set(`expiry=${String(data.get("expiry"))}`);
    }
}
