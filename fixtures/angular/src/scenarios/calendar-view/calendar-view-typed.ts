import { Component, signal, ViewEncapsulation } from "@angular/core";
import { CalendarViewRoot } from "@fragiola/primitives-angular/calendar-view";
import type {
    DateFieldValue,
    PlainDate,
    ValueChangeEvent,
} from "@fragiola/primitives-angular/date-picker-input";
import { MonthCalendarRoot } from "@fragiola/primitives-angular/month-calendar";
import { YearCalendarRoot } from "@fragiola/primitives-angular/year-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { field } from "examples-shared/recipes/field";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";
import { TYPED_PICKER_PARTS } from "../date-picker-input/typed-picker-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/month-calendar.md, `/calendar-view/typed` */
@Component({
    selector: "[scenario-calendar-view-typed]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        FIELD_PARTS,
        TYPED_PICKER_PARTS,
        CalendarViewRoot,
        MonthCalendarRoot,
        YearCalendarRoot,
        PageView,
        Output,
    ],
    template: `
        <div fieldRoot [class]="fieldStyles.root">
            <label fieldLabel [class]="fieldStyles.label">Arrival</label>
            <ng-container datePickerInputRoot [locale]="'en-US'" [min]="min" (valueChangeDetails)="changed($event)">
                <div [class]="pickerStyles.group"><div dateFieldInput #segments="dateFieldInput" [class]="fieldInputStyles.input">@for (segment of segments.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="pickerStyles.trigger" aria-label="Choose date"><span aria-hidden="true">▾</span></button></div>
                <ng-container *datePickerPortal>
                    <div datePickerPositioner [sideOffset]="4" [class]="popupStyles.positioner">
                        <div datePickerPopup aria-label="Choose date" [class]="popupStyles.popup">
                            <div calendarRoot [class]="styles.root">
                                <ng-container calendarViewRoot #views="calendarView">
                                    @if (views.view() === "day") {
                                        <div monthView [viewTrigger]="true"></div>
                                    } @else if (views.view() === "month") {
                                        <div monthCalendarRoot [class]="styles.root"><div pageView prev="Previous year" next="Next year" [viewTrigger]="true"></div></div>
                                    } @else {
                                        <div yearCalendarRoot [class]="styles.root"><div pageView prev="Previous years" next="Next years" [viewTrigger]="true"></div></div>
                                    }
                                </ng-container>
                            </div>
                        </div>
                    </div>
                </ng-container>
            </ng-container>
        </div>
        <pre fixtureOutput [values]="{ value: value(), changes: changes() }"></pre>
    `,
})
export class CalendarViewTyped {
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly pickerStyles = datePickerInput;
    protected readonly popupStyles = datePicker;
    protected readonly styles = calendar;
    protected readonly min: PlainDate = { year: 2025, month: 1, day: 1 };
    protected readonly value = signal<string | undefined>(undefined);
    protected readonly changes = signal(0);

    protected changed({
        value,
    }: ValueChangeEvent<DateFieldValue | null>): void {
        this.changes.update((count) => count + 1);
        this.value.set(isoDateTime(value) ?? "none");
    }
}
