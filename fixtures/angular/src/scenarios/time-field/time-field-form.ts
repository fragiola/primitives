import { Component, signal, ViewEncapsulation } from "@angular/core";
import type { PlainTime } from "@fragiola/primitives-angular/time-field";
import { dateField } from "examples-shared/recipes/date-field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { DATE_FIELD_PARTS } from "../date-field/date-field-parts.ts";

/** spec/date-field.md, `/time-field/form` */
@Component({
    selector: "[scenario-time-field-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [DATE_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-2" (submit)="submit($event)">
            <div timeFieldRoot [locale]="'en-US'" [name]="'alarm'" [required]="true" [hourCycle]="24" [class]="styles.root">
                <div dateFieldInput #alarm="dateFieldInput" aria-label="Alarm" [class]="styles.input">
                    @for (segment of alarm.segments(); track segment.index) {
                        <span [dateFieldSegment]="segment">{{ segment.text }}</span>
                    }
                </div>
            </div>
            <div timeFieldRoot [locale]="'en-US'" [name]="'start'" [readOnly]="true" [defaultValue]="start" [class]="styles.root">
                <div dateFieldInput #startInput="dateFieldInput" aria-label="Start" [class]="styles.input">
                    @for (segment of startInput.segments(); track segment.index) {
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
export class TimeFieldForm {
    protected readonly styles = dateField;
    protected readonly start: PlainTime = {
        hour: 8,
        minute: 0,
        second: 0,
        millisecond: 0,
    };
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
