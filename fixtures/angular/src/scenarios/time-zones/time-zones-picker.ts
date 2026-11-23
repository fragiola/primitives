import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    timeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-picker-input";
import type { DateRangeFieldValue } from "@fragiola/primitives-angular/date-range-picker-input";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { Output } from "../../kit/output.ts";
import { TYPED_PICKER_PARTS } from "../date-picker-input/typed-picker-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/time-zones.md, `/time-zones/picker` */
@Component({
    selector: "[scenario-time-zones-picker]",
    encapsulation: ViewEncapsulation.None,
    imports: [FIELD_PARTS, TYPED_PICKER_PARTS, Output],
    template: `
        <div class="flex flex-col items-start gap-3">
            <div fieldRoot [name]="'meeting'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Meeting</label>
                <ng-container datePickerInputRoot [locale]="'en-US'" [granularity]="'minute'" [timeZone]="newYork" [defaultValue]="meetingDefault" (valueChange)="changeMeeting($event)">
                    <div [class]="typedStyles.group"><div dateFieldInput #segments="dateFieldInput" [class]="fieldInputStyles.input">@for (segment of segments.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="typedStyles.trigger" aria-label="Choose date"><span aria-hidden="true">▾</span></button></div>
                    <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose date" [class]="pickerStyles.popup"><div calendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                </ng-container>
            </div>
            <div fieldRoot [name]="'trip'" [class]="fieldStyles.root">
                <label fieldLabel [class]="fieldStyles.label">Trip</label>
                <ng-container dateRangePickerInputRoot [locale]="'en-US'" [granularity]="'minute'" [timeZone]="newYork" (valueChange)="changeTrip($event)">
                    <div [class]="typedStyles.group"><div dateRangeFieldInput range="start" aria-label="Start" #start="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of start.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="End" #end="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of end.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="typedStyles.trigger" aria-label="Choose dates"><span aria-hidden="true">▾</span></button></div>
                    <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose dates" [class]="pickerStyles.popup"><div rangeCalendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                </ng-container>
            </div>
        </div>
        <pre fixtureOutput [values]="{ meeting: meeting(), trip: trip() }"></pre>
    `,
})
export class TimeZonesPicker {
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly typedStyles = datePickerInput;
    protected readonly pickerStyles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly newYork = timeZone("America/New_York");
    protected readonly meetingDefault = toZoned(
        {
            year: 2026,
            month: 3,
            day: 7,
            hour: 2,
            minute: 30,
            second: 0,
            millisecond: 0,
        },
        "America/New_York",
    );
    protected readonly meeting = signal<string | undefined>(undefined);
    protected readonly trip = signal<string | undefined>(undefined);

    protected changeMeeting(value: DateFieldValue | null): void {
        this.meeting.set(
            value === null
                ? "none"
                : this.newYork.toIso(value as ZonedDateTime),
        );
    }

    protected changeTrip(value: DateRangeFieldValue | null): void {
        this.trip.set(
            value === null
                ? "none"
                : `${this.newYork.toIso(value.start as ZonedDateTime)}/${this.newYork.toIso(value.end as ZonedDateTime)}`,
        );
    }
}
