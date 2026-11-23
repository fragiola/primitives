import { Component, signal, ViewEncapsulation } from "@angular/core";
import { YearCalendarRoot } from "@fragiola/primitives-angular/year-calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    type PlainYear,
    YearPickerRoot,
    type YearRange,
} from "@fragiola/primitives-angular/year-picker";
import { YearRangeCalendarRoot } from "@fragiola/primitives-angular/year-range-calendar";
import { YearRangePickerRoot } from "@fragiola/primitives-angular/year-range-picker";
import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { formEntries } from "../../kit/form-entries.ts";
import { isoPeriod, isoYear } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";

/** spec/month-calendar.md, `/year-picker/form` */
@Component({
    selector: "[scenario-year-picker-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        YearPickerRoot,
        YearRangePickerRoot,
        YearCalendarRoot,
        YearRangeCalendarRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        PageView,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <ng-container yearPickerRoot [name]="'year'" [(value)]="year" [locale]="'en-US'">
                <button datePickerTrigger [class]="pickerStyles.trigger">@for (run of ["Year: ", isoYear(year()) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose year" [class]="pickerStyles.popup"><div yearCalendarRoot [class]="styles.root"><div pageView prev="Previous years" next="Next years"></div></div></div></div></ng-container>
            </ng-container>
            <ng-container yearRangePickerRoot [name]="'years'" [(value)]="years" [locale]="'en-US'">
                <button datePickerTrigger [class]="pickerStyles.trigger">@for (run of ["Years: ", isoPeriod(years(), isoYear) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose years" [class]="pickerStyles.popup"><div yearRangeCalendarRoot [class]="styles.root"><div pageView prev="Previous years" next="Next years"></div></div></div></div></ng-container>
            </ng-container>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class YearPickerForm {
    protected readonly styles = calendar;
    protected readonly pickerStyles = datePicker;
    protected readonly isoYear = isoYear;
    protected readonly isoPeriod = isoPeriod;
    protected readonly year = signal<PlainYear | null>(null);
    protected readonly years = signal<YearRange | null>(null);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
