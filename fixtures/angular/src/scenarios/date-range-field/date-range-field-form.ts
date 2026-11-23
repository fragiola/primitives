import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { DateRangeFieldValue } from "@fragiola/primitives-angular/date-range-field";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { RANGE_FIELD_PARTS } from "./range-field-parts.ts";

/** spec/date-range-field.md, `/date-range-field/form` */
@Component({
    selector: "[scenario-date-range-field-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [RANGE_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div dateRangeFieldRoot [locale]="'en-US'" [startName]="'checkin'" [endName]="'checkout'" [required]="true" [min]="min" [class]="rangeStyles.root">
                <div [class]="rangeStyles.ends"><div dateRangeFieldInput range="start" aria-label="Check-in" #startA="dateRangeFieldInput" [class]="styles.input">@for (segment of startA.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="Check-out" #endA="dateRangeFieldInput" [class]="styles.input">@for (segment of endA.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div></div>
            </div>
            <div dateRangeFieldRoot [locale]="'en-US'" [startName]="'from'" [endName]="'to'" [readOnly]="true" [defaultValue]="initial" [class]="rangeStyles.root">
                <div [class]="rangeStyles.ends"><div dateRangeFieldInput range="start" aria-label="From" #startB="dateRangeFieldInput" [class]="styles.input">@for (segment of startB.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="To" #endB="dateRangeFieldInput" [class]="styles.input">@for (segment of endB.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div></div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class DateRangeFieldForm {
    protected readonly styles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly min = { year: 2026, month: 11, day: 20 };
    protected readonly initial: DateRangeFieldValue = {
        start: { year: 2026, month: 11, day: 20 },
        end: { year: 2026, month: 11, day: 22 },
    };
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
