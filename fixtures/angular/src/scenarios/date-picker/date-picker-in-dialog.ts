import { Component, signal, ViewEncapsulation } from "@angular/core";
import { CalendarRoot } from "@fragiola/primitives-angular/calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerRoot,
    DatePickerTrigger,
    type PlainDate,
} from "@fragiola/primitives-angular/date-picker";
import { DateRangePickerRoot } from "@fragiola/primitives-angular/date-range-picker";
import { MonthCalendarRoot } from "@fragiola/primitives-angular/month-calendar";
import { MonthPickerRoot } from "@fragiola/primitives-angular/month-picker";
import { MonthRangeCalendarRoot } from "@fragiola/primitives-angular/month-range-calendar";
import { MonthRangePickerRoot } from "@fragiola/primitives-angular/month-range-picker";
import { RangeCalendarRoot } from "@fragiola/primitives-angular/range-calendar";
import { YearCalendarRoot } from "@fragiola/primitives-angular/year-calendar";
import { YearPickerRoot } from "@fragiola/primitives-angular/year-picker";
import { YearRangeCalendarRoot } from "@fragiola/primitives-angular/year-range-calendar";
import { YearRangePickerRoot } from "@fragiola/primitives-angular/year-range-picker";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField, dateRangeField } from "examples-shared/recipes/date-field";
import {
    datePicker,
    datePickerInput,
} from "examples-shared/recipes/date-picker";
import { dialog } from "examples-shared/recipes/dialog";
import { field } from "examples-shared/recipes/field";
import { iso } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";
import { TYPED_PICKER_PARTS } from "../date-picker-input/typed-picker-parts.ts";
import { DIALOG_PARTS } from "../dialog/dialog-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

/** spec/calendar.md, `/date-picker/in-dialog`: every picker kind inside a modal Dialog */
@Component({
    selector: "[scenario-date-picker-in-dialog]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DIALOG_PARTS,
        FIELD_PARTS,
        TYPED_PICKER_PARTS,
        DatePickerRoot,
        DateRangePickerRoot,
        MonthPickerRoot,
        MonthRangePickerRoot,
        YearPickerRoot,
        YearRangePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        CalendarRoot,
        RangeCalendarRoot,
        MonthCalendarRoot,
        MonthRangeCalendarRoot,
        YearCalendarRoot,
        YearRangeCalendarRoot,
        MonthView,
        PageView,
        Output,
    ],
    template: `
        <ng-container dialogRoot>
            <button dialogTrigger [class]="dialogStyles.trigger">Plan the trip</button>
            <ng-container *dialogPortal>
                <div dialogBackdrop [class]="dialogStyles.backdrop"></div>
                <div dialogPopup [class]="dialogStyles.popup">
                    <h2 dialogTitle [class]="dialogStyles.title">Plan the trip</h2>
                    <div class="flex flex-col items-start gap-2">
                        <ng-container datePickerRoot [(value)]="value" [locale]="'en-US'">
                            <button datePickerTrigger [class]="pickerStyles.trigger">Date</button>
                            <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose date" [class]="pickerStyles.popup"><div calendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                        </ng-container>
                        <ng-container dateRangePickerRoot [locale]="'en-US'">
                            <button datePickerTrigger [class]="pickerStyles.trigger">Dates</button>
                            <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose dates" [class]="pickerStyles.popup"><div rangeCalendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                        </ng-container>
                        <div fieldRoot [class]="fieldStyles.root">
                            <label fieldLabel [class]="fieldStyles.label">Arrival</label>
                            <ng-container datePickerInputRoot [locale]="'en-US'">
                                <div [class]="inputStyles.group"><div dateFieldInput #segments="dateFieldInput" [class]="fieldInputStyles.input">@for (segment of segments.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="inputStyles.trigger" aria-label="Choose arrival"><span aria-hidden="true">▾</span></button></div>
                                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Arrival date" [class]="pickerStyles.popup"><div calendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                            </ng-container>
                        </div>
                        <div fieldRoot [class]="fieldStyles.root">
                            <label fieldLabel [class]="fieldStyles.label">Stay</label>
                            <ng-container dateRangePickerInputRoot [locale]="'en-US'">
                                <div [class]="inputStyles.group"><div dateRangeFieldInput range="start" aria-label="Check-in" #start="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of start.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><span aria-hidden="true" [class]="rangeStyles.separator">–</span><div dateRangeFieldInput range="end" aria-label="Check-out" #end="dateRangeFieldInput" [class]="fieldInputStyles.input">@for (segment of end.segments(); track segment.index) {<span [dateFieldSegment]="segment">{{ segment.text }}</span>}</div><button datePickerTrigger [class]="inputStyles.trigger" aria-label="Choose stay"><span aria-hidden="true">▾</span></button></div>
                                <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Stay dates" [class]="pickerStyles.popup"><div rangeCalendarRoot [class]="calendarStyles.root"><div monthView></div></div></div></div></ng-container>
                            </ng-container>
                        </div>
                        <ng-container monthPickerRoot [locale]="'en-US'">
                            <button datePickerTrigger [class]="pickerStyles.trigger">Month</button>
                            <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose month" [class]="pickerStyles.popup"><div monthCalendarRoot [class]="calendarStyles.root"><div pageView prev="Previous year" next="Next year"></div></div></div></div></ng-container>
                        </ng-container>
                        <ng-container monthRangePickerRoot [locale]="'en-US'">
                            <button datePickerTrigger [class]="pickerStyles.trigger">Months</button>
                            <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose months" [class]="pickerStyles.popup"><div monthRangeCalendarRoot [class]="calendarStyles.root"><div pageView prev="Previous year" next="Next year"></div></div></div></div></ng-container>
                        </ng-container>
                        <ng-container yearPickerRoot [locale]="'en-US'">
                            <button datePickerTrigger [class]="pickerStyles.trigger">Year</button>
                            <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose year" [class]="pickerStyles.popup"><div yearCalendarRoot [class]="calendarStyles.root"><div pageView prev="Previous years" next="Next years"></div></div></div></div></ng-container>
                        </ng-container>
                        <ng-container yearRangePickerRoot [locale]="'en-US'">
                            <button datePickerTrigger [class]="pickerStyles.trigger">Years</button>
                            <ng-container *datePickerPortal><div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner"><div datePickerPopup aria-label="Choose years" [class]="pickerStyles.popup"><div yearRangeCalendarRoot [class]="calendarStyles.root"><div pageView prev="Previous years" next="Next years"></div></div></div></div></ng-container>
                        </ng-container>
                    </div>
                    <button dialogClose [class]="dialogStyles.close">Close</button>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="{ value: iso(value()) }"></pre>
    `,
})
export class DatePickerInDialog {
    protected readonly dialogStyles = dialog;
    protected readonly pickerStyles = datePicker;
    protected readonly inputStyles = datePickerInput;
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly rangeStyles = dateRangeField;
    protected readonly calendarStyles = calendar;
    protected readonly iso = iso;
    protected readonly value = signal<PlainDate | null>(null);
}
