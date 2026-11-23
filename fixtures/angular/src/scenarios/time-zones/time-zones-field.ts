import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    type TimeZone,
    timeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-field";
import type { DateRangeFieldValue } from "@fragiola/primitives-angular/date-range-field";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.ts";
import { DATE_FIELD_PARTS } from "../date-field/date-field-parts.ts";
import { RANGE_FIELD_PARTS } from "../date-range-field/range-field-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** A zoned value's ISO text (`none` with none). */
function zonedIso(zone: TimeZone, value: DateFieldValue | null): string {
    return value !== null && "offset" in value
        ? zone.toIso(value as ZonedDateTime)
        : "none";
}

/** spec/time-zones.md, `/time-zones/field` */
@Component({
    selector: "[scenario-time-zones-field]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, DATE_FIELD_PARTS, RANGE_FIELD_PARTS, Output],
    template: `
        <form class="flex flex-col items-start gap-3" (submit)="submit($event)">
            <div fieldRoot [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Departure</label>
                <div dateFieldRoot [locale]="'en-US'" [granularity]="'minute'" [name]="'departure'" [timeZone]="newYork" [defaultValue]="departureDefault" (valueChange)="departure.set(zonedIso(newYork, $event))" [class]="styles.root">
                    <div dateFieldInput #departureInput="dateFieldInput" [class]="styles.input">
                        @for (segment of departureInput.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
            </div>
            <div fieldRoot [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Return</label>
                <div dateFieldRoot [locale]="'en-US'" [granularity]="'minute'" [name]="'return'" [timeZone]="newYork" [disambiguation]="'later'" (valueChange)="back.set(zonedIso(newYork, $event))" [class]="styles.root">
                    <div dateFieldInput #returnInput="dateFieldInput" [class]="styles.input">
                        @for (segment of returnInput.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
            </div>
            <div fieldRoot [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Arrival</label>
                <div dateFieldRoot [locale]="'en-US'" [granularity]="'minute'" [name]="'arrival'" [timeZone]="london" [hideTimeZone]="true" [class]="styles.root">
                    <div dateFieldInput #arrivalInput="dateFieldInput" [class]="styles.input">
                        @for (segment of arrivalInput.segments(); track segment.index) {
                            <span [dateFieldSegment]="segment" [class]="styles.segment">{{ segment.text }}</span>
                        }
                    </div>
                </div>
            </div>
            <div fieldRoot [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Stay</label>
                <div dateRangeFieldRoot [locale]="'en-US'" [granularity]="'minute'" [timeZone]="newYork" [startName]="'from'" [endName]="'to'" (valueChange)="changeStay($event)" [class]="rangeStyles.root">
                    <div [class]="rangeStyles.ends"><div dateRangeFieldInput range="start" aria-label="Start" #start="dateRangeFieldInput" [class]="styles.input">@for (segment of start.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="End" #end="dateRangeFieldInput" [class]="styles.input">@for (segment of end.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div></div>
                </div>
            </div>
            <button type="submit">Submit</button>
        </form>
        <pre fixtureOutput [values]="{ departure: departure(), return: back(), stay: stay(), form: form() }"></pre>
    `,
})
export class TimeZonesField {
    protected readonly styles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly fieldStyles = field;
    protected readonly zonedIso = zonedIso;
    protected readonly newYork = timeZone("America/New_York");
    protected readonly london = timeZone("Europe/London");
    protected readonly departureDefault = toZoned(
        {
            year: 2026,
            month: 11,
            day: 1,
            hour: 1,
            minute: 30,
            second: 0,
            millisecond: 0,
        },
        "America/New_York",
        "earlier",
    );
    protected readonly departure = signal<string | undefined>(undefined);
    protected readonly back = signal<string | undefined>(undefined);
    protected readonly stay = signal<string | undefined>(undefined);
    protected readonly form = signal<string | undefined>(undefined);

    protected changeStay(value: DateRangeFieldValue | null): void {
        this.stay.set(
            value === null
                ? "none"
                : `${zonedIso(this.newYork, value.start)}/${zonedIso(this.newYork, value.end)}`,
        );
    }

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
