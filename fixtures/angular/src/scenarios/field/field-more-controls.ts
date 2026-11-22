import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    CalendarRoot,
    type PlainDate,
} from "@fragiola/primitives-angular/calendar";
import {
    CheckboxIndicator,
    CheckboxRoot,
} from "@fragiola/primitives-angular/checkbox";
import { CheckboxGroup } from "@fragiola/primitives-angular/checkbox-group";
import { DatePickerRoot } from "@fragiola/primitives-angular/date-picker";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    type DateRange,
    DateRangePickerRoot,
} from "@fragiola/primitives-angular/date-range-picker";
import { Form } from "@fragiola/primitives-angular/form";
import { RangeCalendarRoot } from "@fragiola/primitives-angular/range-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { checkbox, checkboxGroup } from "examples-shared/recipes/checkbox";
import { datePicker } from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { form } from "examples-shared/recipes/form";
import { formEntries } from "../../kit/form-entries.ts";
import { iso, isoRange } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "./field-parts.ts";
import { validateToppings } from "./validators.ts";

const TOPPINGS = [
    { value: "cheese", label: "Cheese" },
    { value: "ham", label: "Ham" },
    { value: "pineapple", label: "Pineapple" },
];

/**
 * A CheckboxGroup, a DatePicker and a DateRangePicker inside fields, in a Form (spec/field.md).
 * The triggers' text is the value alone: one text node, as JSX makes `{iso(arrival) ?? "none"}`.
 */
@Component({
    selector: "[scenario-field-more-controls]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        Form,
        FIELD_PARTS,
        CheckboxGroup,
        CheckboxRoot,
        CheckboxIndicator,
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
        <form formRoot [class]="formStyles.root" (submit)="submit($event)">
            <div fieldRoot [name]="'toppings'" [validate]="validateToppings" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Toppings</label>
                <div checkboxGroup [defaultValue]="[]" [class]="groupStyles.root">
                    @for (topping of toppings; track topping.value) {
                        <label class="flex items-center gap-2 text-sm"><button checkboxRoot #box="checkboxRoot" [value]="topping.value" [class]="checkboxStyles.root"><span *checkboxIndicator [class]="checkboxStyles.indicator">{{ box.state().indeterminate ? "–" : "✓" }}</span></button>{{ topping.label }}</label>
                    }
                </div>
                <p fieldDescription [class]="styles.description">Pick at least one.</p>
                <div *fieldError [class]="styles.error"></div>
            </div>
            <div fieldRoot [name]="'arrival'" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Arrival</label>
                <ng-container datePickerRoot [(value)]="arrival" required locale="en-US">
                    <button datePickerTrigger [class]="pickerStyles.trigger">{{ iso(arrival()) ?? "none" }}</button>
                    <ng-container *datePickerPortal>
                        <div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner">
                            <div datePickerPopup aria-label="Choose date" [class]="pickerStyles.popup">
                                <div calendarRoot [class]="calendarStyles.root">
                                    <div monthView></div>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <p fieldDescription [class]="styles.description">The day you arrive.</p>
                <div *fieldError [class]="styles.error">Choose a date.</div>
            </div>
            <div fieldRoot [name]="'stay'" [class]="styles.root">
                <label fieldLabel [class]="styles.label">Stay</label>
                <ng-container dateRangePickerRoot [(value)]="stay" required locale="en-US">
                    <button datePickerTrigger [class]="pickerStyles.trigger">{{ isoRange(stay()) ?? "none" }}</button>
                    <ng-container *datePickerPortal>
                        <div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner">
                            <div datePickerPopup aria-label="Choose dates" [class]="pickerStyles.popup">
                                <div rangeCalendarRoot [class]="calendarStyles.root">
                                    <div monthView></div>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <p fieldDescription [class]="styles.description">From check-in to check-out.</p>
                <div *fieldError [class]="styles.error">Choose your dates.</div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class FieldMoreControls {
    protected readonly styles = field;
    protected readonly formStyles = form;
    protected readonly groupStyles = checkboxGroup;
    protected readonly checkboxStyles = checkbox;
    protected readonly pickerStyles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly toppings = TOPPINGS;
    protected readonly validateToppings = validateToppings;
    protected readonly iso = iso;
    protected readonly isoRange = isoRange;
    protected readonly arrival = signal<PlainDate | null>(null);
    protected readonly stay = signal<DateRange | null>(null);
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
