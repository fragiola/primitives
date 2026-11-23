import { Component, signal, ViewEncapsulation } from "@angular/core";
import { CalendarRoot } from "@fragiola/primitives-angular/calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerRoot,
    DatePickerTrigger,
    type PlainDate,
} from "@fragiola/primitives-angular/date-picker";
import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { formEntries } from "../../kit/form-entries.ts";
import { iso } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";

/**
 * spec/calendar.md, `/date-picker/mixed-form`: a picker before a native required input. The
 * trigger's text is two text nodes, as JSX makes `Arrival: {iso(arrival) ?? "none"}`.
 */
@Component({
    selector: "[scenario-date-picker-mixed-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DatePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        CalendarRoot,
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
            <label class="flex flex-col gap-1 text-sm">Guest name<input name="guest" required /></label>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class DatePickerMixedForm {
    protected readonly styles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly iso = iso;
    protected readonly arrival = signal<PlainDate | null>(null);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
