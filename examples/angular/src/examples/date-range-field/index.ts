import { Component, signal } from "@angular/core";
import {
    DateFieldSegment,
    DateRangeFieldInput,
    DateRangeFieldRoot,
    type DateRangeFieldValue,
    type PlainDate,
} from "@fragiola/primitives-angular/date-range-field";
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

// A booking range typed in parts: the check-in date, then the check-out date, the typing moving on
// from one to the other. A day before today is invalid, and so is a check-out before the
// check-in; the field submits both ISO dates itself (spec/date-range-field.md).
@Component({
    selector: "example-stay-dates",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldError,
        DateRangeFieldRoot,
        DateRangeFieldInput,
        DateFieldSegment,
    ],
    template: `
        <form (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Stay</label>
                <div dateRangeFieldRoot [(value)]="value" [min]="today" [required]="true" [startName]="'check-in'" [endName]="'check-out'" [locale]="'en-US'" [class]="styles.root">
                    <div [class]="styles.ends">
                        <div dateRangeFieldInput range="start" aria-label="Check-in" #start="dateRangeFieldInput" [class]="styles.input">
                            @for (segment of start.segments(); track segment.index) {
                                <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                            }
                        </div>
                        <span aria-hidden="true" [class]="styles.separator">–</span>
                        <div dateRangeFieldInput range="end" aria-label="Check-out" #end="dateRangeFieldInput" [class]="styles.input">
                            @for (segment of end.segments(); track segment.index) {
                                <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                            }
                        </div>
                    </div>
                </div>
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Enter both dates.</div>
                <div *fieldError="'rangeUnderflow'" [class]="styles.field.error">The stay cannot start in the past.</div>
                <div *fieldError="'rangeOverflow'" [class]="styles.field.error">Check-out cannot be before check-in.</div>
            </div>
            <button type="submit" [class]="styles.submit">Book</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Booked: " + saved() }}</p>
        </form>
    `,
})
export default class StayDates {
    protected readonly styles = styles;
    protected readonly today = today;
    protected readonly value = signal<DateRangeFieldValue | null>(null);
    protected readonly saved = signal<string | null>(null);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.saved.set(`${data.get("check-in")} → ${data.get("check-out")}`);
    }
}
