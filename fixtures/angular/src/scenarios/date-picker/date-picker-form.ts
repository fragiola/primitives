import { Component, signal, ViewEncapsulation } from "@angular/core";
import { CalendarRoot } from "@fragiola/primitives-angular/calendar";
import {
    DatePickerRoot,
    type PlainDate,
} from "@fragiola/primitives-angular/date-picker";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    type DateRange,
    DateRangePickerRoot,
} from "@fragiola/primitives-angular/date-range-picker";
import { RangeCalendarRoot } from "@fragiola/primitives-angular/range-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { formEntries } from "../../kit/form-entries.ts";
import { iso, isoRange } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";

const NOV_30: PlainDate = { year: 2026, month: 11, day: 30 };

/**
 * The pickers in a native form: required, read-only and disabled (spec/calendar.md, "Forms"). The
 * triggers' text is two text nodes, as JSX makes `Arrival: {iso(arrival) ?? "none"}`.
 */
@Component({
    selector: "[scenario-date-picker-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DatePickerRoot,
        DateRangePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        CalendarRoot,
        RangeCalendarRoot,
        MonthView,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <ng-container datePickerRoot name="arrival" required [(value)]="arrival" locale="en-US">
                <button datePickerTrigger [class]="styles.trigger">@for (run of ["Arrival: ", iso(arrival()) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal>
                    <div datePickerPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div datePickerPopup aria-label="Choose date" [class]="styles.popup">
                            <div calendarRoot [class]="calendarStyles.root">
                                <div monthView></div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <ng-container dateRangePickerRoot name="stay" required [(value)]="stay" locale="en-US">
                <button datePickerTrigger [class]="styles.trigger">@for (run of ["Stay: ", isoRange(stay()) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal>
                    <div datePickerPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div datePickerPopup aria-label="Choose dates" [class]="styles.popup">
                            <div rangeCalendarRoot [class]="calendarStyles.root">
                                <div monthView></div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <ng-container datePickerRoot name="departure" readOnly [value]="departure" locale="en-US">
                <button datePickerTrigger [class]="styles.trigger">@for (run of ["Departure: ", iso(departure)]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal>
                    <div datePickerPositioner [sideOffset]="4" [class]="styles.positioner">
                        <div datePickerPopup aria-label="Departure date" [class]="styles.popup">
                            <div calendarRoot [class]="calendarStyles.root">
                                <div monthView></div>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
            <ng-container datePickerRoot name="return" disabled locale="en-US">
                <button datePickerTrigger [class]="styles.trigger">Return: none</button>
            </ng-container>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class DatePickerForm {
    protected readonly styles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly iso = iso;
    protected readonly isoRange = isoRange;
    protected readonly departure = NOV_30;
    protected readonly arrival = signal<PlainDate | null>(null);
    protected readonly stay = signal<DateRange | null>(null);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
