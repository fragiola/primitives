import {
    Component,
    computed,
    input,
    signal,
    ViewEncapsulation,
} from "@angular/core";
import type { PlainDate } from "@fragiola/primitives-angular/calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    DateRangePickerRoot,
} from "@fragiola/primitives-angular/date-range-picker";
import { MonthCalendarRoot } from "@fragiola/primitives-angular/month-calendar";
import { MonthPickerRoot } from "@fragiola/primitives-angular/month-picker";
import { YearCalendarRoot } from "@fragiola/primitives-angular/year-calendar";
import { YearPickerRoot } from "@fragiola/primitives-angular/year-picker";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { systemOf } from "../../kit/calendar-system.ts";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";
import { TYPED_PICKER_PARTS } from "../date-picker-input/typed-picker-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/calendar-systems.md, `/calendar-systems/pickers` */
@Component({
    selector: "[scenario-calendar-systems-pickers]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        FIELD_PARTS,
        TYPED_PICKER_PARTS,
        DateRangePickerRoot,
        MonthPickerRoot,
        YearPickerRoot,
        MonthCalendarRoot,
        YearCalendarRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        PageView,
        Output,
    ],
    template: `
        <form class="flex flex-col items-start gap-3" (submit)="submit($event)">
            <div fieldRoot [name]="'date'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Date</label>
                <ng-container datePickerInputRoot [calendar]="system()" [locale]="locale()" [defaultValue]="today">
                    <div [class]="typedStyles.group"><div dateFieldInput #segments="dateFieldInput" [class]="fieldInputStyles.input">@for (segment of segments.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="typedStyles.trigger" aria-label="Choose date"><span aria-hidden="true">▾</span></button></div>
                    <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose date" [class]="pickerStyles.popup"><div calendarRoot [class]="styles.root"><div monthView></div></div></div></div></ng-container>
                </ng-container>
            </div>
            <ng-container dateRangePickerRoot [calendar]="system()" [locale]="locale()" [name]="'stay'">
                <button datePickerTrigger [class]="pickerStyles.trigger">Stay</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Stay" [class]="pickerStyles.popup"><div rangeCalendarRoot [class]="styles.root"><div monthView></div></div></div></div></ng-container>
            </ng-container>
            <ng-container monthPickerRoot [calendar]="system()" [locale]="locale()" [name]="'month'">
                <button datePickerTrigger [class]="pickerStyles.trigger">Month</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Month" [class]="pickerStyles.popup"><div monthCalendarRoot [class]="styles.root"><div pageView prev="Previous year" next="Next year"></div></div></div></div></ng-container>
            </ng-container>
            <ng-container yearPickerRoot [calendar]="system()" [locale]="locale()" [name]="'year'">
                <button datePickerTrigger [class]="pickerStyles.trigger">Year</button>
                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Year" [class]="pickerStyles.popup"><div yearCalendarRoot [class]="styles.root"><div pageView prev="Previous years" next="Next years"></div></div></div></div></ng-container>
            </ng-container>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class CalendarSystemsPickers {
    protected readonly styles = calendar;
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly typedStyles = datePickerInput;
    protected readonly pickerStyles = datePicker;
    protected readonly today: PlainDate = { year: 2026, month: 11, day: 20 };
    readonly locale = input.required<string | undefined>();
    protected readonly system = computed(() => systemOf(this.locale()));
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
