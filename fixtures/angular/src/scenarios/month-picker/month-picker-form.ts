import { Component, signal, ViewEncapsulation } from "@angular/core";
import { MonthCalendarRoot } from "@fragiola/primitives-angular/month-calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    MonthPickerRoot,
    type PlainYearMonth,
    type YearMonthRange,
} from "@fragiola/primitives-angular/month-picker";
import { MonthRangeCalendarRoot } from "@fragiola/primitives-angular/month-range-calendar";
import { MonthRangePickerRoot } from "@fragiola/primitives-angular/month-range-picker";
import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { formEntries } from "../../kit/form-entries.ts";
import { isoMonth, isoPeriod } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";

/** spec/month-calendar.md, `/month-picker/form` */
@Component({
    selector: "[scenario-month-picker-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        MonthPickerRoot,
        MonthRangePickerRoot,
        MonthCalendarRoot,
        MonthRangeCalendarRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        PageView,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <ng-container monthPickerRoot [name]="'expiry'" [required]="true" [min]="min" [(value)]="expiry" [locale]="'en-US'">
                <button datePickerTrigger [class]="pickerStyles.trigger">@for (run of ["Expiry: ", isoMonth(expiry()) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose month" [class]="pickerStyles.popup"><div monthCalendarRoot [class]="styles.root"><div pageView prev="Previous year" next="Next year"></div></div></div></div></ng-container>
            </ng-container>
            <ng-container monthRangePickerRoot [name]="'period'" [(value)]="period" [locale]="'en-US'">
                <button datePickerTrigger [class]="pickerStyles.trigger">@for (run of ["Period: ", isoPeriod(period(), isoMonth) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose months" [class]="pickerStyles.popup"><div monthRangeCalendarRoot [class]="styles.root"><div pageView prev="Previous year" next="Next year"></div></div></div></div></ng-container>
            </ng-container>
            <div class="flex gap-2"><button type="submit">Submit</button><button type="reset">Reset</button></div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class MonthPickerForm {
    protected readonly styles = calendar;
    protected readonly pickerStyles = datePicker;
    protected readonly isoMonth = isoMonth;
    protected readonly isoPeriod = isoPeriod;
    protected readonly min: PlainYearMonth = { year: 2026, month: 11 };
    protected readonly expiry = signal<PlainYearMonth | null>(null);
    protected readonly period = signal<YearMonthRange | null>(null);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
