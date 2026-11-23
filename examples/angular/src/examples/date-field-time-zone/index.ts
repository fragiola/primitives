import { Component, signal } from "@angular/core";
import {
    formatTimeZoneName,
    timeZone,
    toIsoZoned,
    toTimeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import {
    DateFieldInput,
    DateFieldRoot,
    DateFieldSegment,
    type DateFieldValue,
} from "@fragiola/primitives-angular/date-field";
import { FieldLabel, FieldRoot } from "@fragiola/primitives-angular/field";
import { styles } from "./styles.ts";

const newYork = timeZone("America/New_York");
/** The zones the meeting is shown in, besides the field's. */
const OTHERS = [
    { city: "London", zone: "Europe/London" },
    { city: "Kolkata", zone: "Asia/Kolkata" },
];
const pad = (value: number) => String(value).padStart(2, "0");
const DAY = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
});
/** `Tue, Nov 24, 14:00 GMT`: a zoned value's wall time, read in its own zone. */
const wallTime = (value: ZonedDateTime) =>
    `${DAY.format(Date.UTC(value.year, value.month - 1, value.day))}, ${pad(value.hour)}:${pad(value.minute)} ${formatTimeZoneName("en-US", value)}`;

// A meeting typed in New York time: with `[timeZone]`, the field's value is a ZonedDateTime and
// its zone's name is a segment ("EST", then "EDT" once the clocks change). The other zones show
// the same instant, so a date after New York's spring change keeps 9:00 there while London and
// Kolkata move (spec/time-zones.md).
@Component({
    selector: "example-meeting-time-zones",
    imports: [
        FieldRoot,
        FieldLabel,
        DateFieldRoot,
        DateFieldInput,
        DateFieldSegment,
    ],
    template: `
        <div [class]="styles.example">
            <div fieldRoot [class]="styles.field.root">
                <label fieldLabel [class]="styles.field.label">Meeting (New York)</label>
                <div dateFieldRoot [value]="meeting()" (valueChange)="setFromField($event)" [timeZone]="newYork" granularity="minute" [locale]="'en-US'" [class]="styles.root">
                    <div dateFieldInput #input="dateFieldInput" [class]="styles.input">
                        @for (segment of input.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
            </div>
            <dl [class]="styles.zones">
                @for (other of others; track other.zone) {
                    <div [class]="styles.row">
                        <dt [class]="styles.zone">{{ other.city }}</dt>
                        <dd [class]="styles.time">{{ timeIn(other.zone) }}</dd>
                    </div>
                }
            </dl>
            <p role="status" [class]="styles.status">{{ iso() }}</p>
        </div>
    `,
})
export default class MeetingTimeZones {
    protected readonly styles = styles;
    protected readonly newYork = newYork;
    protected readonly others = OTHERS;
    protected readonly meeting = signal<ZonedDateTime | null>(
        toZoned(
            {
                year: 2026,
                month: 11,
                day: 24,
                hour: 9,
                minute: 0,
                second: 0,
                millisecond: 0,
            },
            newYork.id,
        ),
    );

    /** A field's value is a `ZonedDateTime` once it has a time zone. */
    protected setFromField(value: DateFieldValue | null): void {
        this.meeting.set(
            value !== null && "offset" in value
                ? (value as ZonedDateTime)
                : null,
        );
    }

    /** The meeting's wall time in another zone. */
    protected timeIn(zone: string): string {
        const meeting = this.meeting();
        return meeting === null ? "–" : wallTime(toTimeZone(meeting, zone));
    }

    protected iso(): string {
        const meeting = this.meeting();
        return meeting === null ? "ISO: none" : `ISO: ${toIsoZoned(meeting)}`;
    }
}
