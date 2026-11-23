import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { PlainDate } from "@fragiola/primitives-angular/date-field";
import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";
import { DATE_FIELD_PARTS } from "./date-field-parts.ts";

/** spec/date-field.md, `/date-field/form` */
@Component({
    selector: "[scenario-date-field-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, DATE_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div fieldRoot [name]="'birth'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Birth date</label>
                <div dateFieldRoot [locale]="'en-US'" [required]="true" [class]="styles.root">
                    <div dateFieldInput #birth="dateFieldInput" [class]="styles.input">
                        @for (segment of birth.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
            </div>
            <div dateFieldRoot [locale]="'en-US'" [name]="'start'" [readOnly]="true" [defaultValue]="start" [class]="styles.root">
                <div dateFieldInput #startInput="dateFieldInput" aria-label="Start" [class]="styles.input">
                    @for (segment of startInput.segments(); track segment.index) {
                        <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                    }
                </div>
            </div>
            <div dateFieldRoot [locale]="'en-US'" [name]="'end'" [disabled]="true" [defaultValue]="end" [class]="styles.root">
                <div dateFieldInput #endInput="dateFieldInput" aria-label="End" [class]="styles.input">
                    @for (segment of endInput.segments(); track segment.index) {
                        <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                    }
                </div>
            </div>
            <div class="flex gap-2">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
            </div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class DateFieldForm {
    protected readonly styles = dateField;
    protected readonly fieldStyles = field;
    protected readonly start: PlainDate = { year: 2026, month: 11, day: 20 };
    protected readonly end: PlainDate = { year: 2026, month: 11, day: 27 };
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
