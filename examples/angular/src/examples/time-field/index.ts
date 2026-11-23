import { Component, signal } from "@angular/core";
import {
    FieldDescription,
    FieldError,
    FieldLabel,
    FieldRoot,
    type FieldValidity,
} from "@fragiola/primitives-angular/field";
import {
    DateFieldInput,
    DateFieldSegment,
    type PlainTime,
    TimeFieldRoot,
} from "@fragiola/primitives-angular/time-field";
import { styles } from "./styles.ts";

const time = (hour: number): PlainTime => ({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
});
const OPENS = time(9);
const CLOSES = time(17);

// A meeting time typed in parts: the hour, the minutes and AM or PM (typed by its first letter,
// or toggled with the arrows). Office hours bound it: a time outside them is invalid, and the
// field submits the ISO time itself (spec/date-field.md, TimeField).
@Component({
    selector: "example-meeting-time",
    imports: [
        FieldRoot,
        FieldLabel,
        FieldDescription,
        FieldError,
        TimeFieldRoot,
        DateFieldInput,
        DateFieldSegment,
    ],
    template: `
        <form (submit)="submit($event)" [class]="styles.form">
            <div fieldRoot [name]="'meeting'" [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Meeting time</label>
                <div timeFieldRoot [(value)]="value" [min]="opens" [max]="closes" [required]="true" [locale]="'en-US'" [class]="styles.root">
                    <div dateFieldInput #input="dateFieldInput" [class]="styles.input">
                        @for (segment of input.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
                <p fieldDescription [class]="styles.field.description">Office hours: 9 AM to 5 PM.</p>
                <div *fieldError="outOfHours" [class]="styles.field.error">Choose a time within office hours.</div>
                <div *fieldError="'valueMissing'" [class]="styles.field.error">Enter a time.</div>
            </div>
            <button type="submit" [class]="styles.submit">Schedule</button>
            <p role="status" [class]="styles.status">{{ saved() === null ? "" : "Scheduled: " + saved() }}</p>
        </form>
    `,
})
export default class MeetingTime {
    protected readonly styles = styles;
    protected readonly opens = OPENS;
    protected readonly closes = CLOSES;
    protected readonly value = signal<PlainTime | null>(null);
    protected readonly saved = signal<string | null>(null);
    protected readonly outOfHours = (validity: FieldValidity) =>
        validity.rangeUnderflow || validity.rangeOverflow;

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        const data = new FormData(event.target as HTMLFormElement);
        this.saved.set(String(data.get("meeting")));
    }
}
