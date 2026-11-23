import { Component, signal, ViewEncapsulation } from "@angular/core";
import type {
    DateFieldValue,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/date-picker-input";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { TYPED_PICKER_PARTS } from "./typed-picker-parts.ts";

/** spec/calendar.md, `/date-picker-input/basic` */
@Component({
    selector: "[scenario-date-picker-input-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TYPED_PICKER_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'arrival'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Arrival</label>
                <ng-container datePickerInputRoot [locale]="'en-US'" [required]="true" [min]="min" (valueChangeDetails)="changed($event)">
                    <div [class]="pickerStyles.group"><div dateFieldInput #segments="dateFieldInput" [class]="fieldInputStyles.input">@for (segment of segments.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="pickerStyles.trigger" aria-label="Choose date"><span aria-hidden="true">▾</span></button></div>
                    <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="popupStyles.positioner"><div datePickerPopup aria-label="Choose date" [class]="popupStyles.popup"><div calendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                </ng-container>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ value: last()?.value, reason: last()?.reason, changes: changes(), form: form() }"></pre>
    `,
})
export class DatePickerInputBasic {
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly pickerStyles = datePickerInput;
    protected readonly popupStyles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly min = { year: 2026, month: 11, day: 10 };
    protected readonly last = signal<{ value: string; reason: string } | null>(
        null,
    );
    protected readonly changes = signal(0);
    protected readonly form = signal<string | undefined>(undefined);

    protected changed({
        value,
        details,
    }: ValueChangeEvent<DateFieldValue | null>): void {
        this.changes.update((count) => count + 1);
        this.last.set({
            value: isoDateTime(value) ?? "none",
            reason: details.reason,
        });
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
