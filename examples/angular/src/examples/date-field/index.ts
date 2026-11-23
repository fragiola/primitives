import { Component, signal } from "@angular/core";
import {
    DateFieldInput,
    DateFieldRoot,
    DateFieldSegment,
    type DateFieldValue,
    type PlainDate,
} from "@fragiola/primitives-angular/date-field";
import {
    FieldError,
    FieldLabel,
    FieldRoot,
} from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A birth date typed in parts: month, day and year, each a spinbutton the keys step and digits
// fill (moving on by themselves). A date after today is invalid, and saving with none shows the
// error; the field submits the ISO date itself (spec/date-field.md).
@Component({
    selector: "example-birth-date",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldError,
        DateFieldRoot,
        DateFieldInput,
        DateFieldSegment,
    ],
    template: `
        <form (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'birth-date'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Birth date</label>
                <div dateFieldRoot [(value)]="value" [max]="today" [required]="true" [locale]="'en-US'" [class]="styles.root">
                    <div dateFieldInput #input="dateFieldInput" [class]="styles.input">
                        @for (segment of input.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Enter your birth date.</div>
                <div *fieldError="'rangeOverflow'" [class]="styles.field.error">The date cannot be in the future.</div>
            </div>
            <button type="submit" [class]="styles.submit">Save</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Saved: " + saved() }}</p>
        </form>
    `,
})
export default class BirthDate {
    protected readonly styles = styles;
    protected readonly today = today;
    protected readonly value = signal<DateFieldValue | null>(null);
    protected readonly saved = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.saved.set(String(data.get("birth-date")));
    }
}
