import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    CalendarRoot,
    type PlainDate,
} from "@fragiola/primitives-angular/calendar";
import { CalendarPreset } from "@fragiola/primitives-angular/calendar-preset";
import { CalendarViewRoot } from "@fragiola/primitives-angular/calendar-view";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerRoot,
    DatePickerTrigger,
} from "@fragiola/primitives-angular/date-picker";
import { MonthCalendarRoot } from "@fragiola/primitives-angular/month-calendar";
import { YearCalendarRoot } from "@fragiola/primitives-angular/year-calendar";
import { calendar, calendarPreset } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { iso } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";
import { todayPreset } from "../calendar-preset/presets.ts";

/** spec/month-calendar.md, `/calendar-view/picker` */
@Component({
    selector: "[scenario-calendar-view-picker]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DatePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        CalendarRoot,
        CalendarViewRoot,
        CalendarPreset,
        MonthCalendarRoot,
        YearCalendarRoot,
        MonthView,
        PageView,
        Output,
    ],
    template: `
        <ng-container datePickerRoot [(value)]="value" (openChangeDetails)="reason.set($event.details.reason)" [min]="min" [max]="max" [locale]="'en-US'">
            <button datePickerTrigger [class]="pickerStyles.trigger">@for (run of ["Choose date: ", iso(value()) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
            <ng-container *datePickerPortal>
                <div datePickerPositioner [sideOffset]="4" [class]="pickerStyles.positioner">
                    <div datePickerPopup aria-label="Choose date" [class]="pickerStyles.popup">
                        <div calendarRoot [class]="styles.root">
                            <ng-container calendarViewRoot #views="calendarView">
                                @if (views.view() === "day") {
                                    <div monthView [viewTrigger]="true"></div>
                                    <div [class]="presetStyles.list"><button [calendarPreset]="today" [class]="presetStyles.preset">Today</button></div>
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
        <pre fixtureOutput [values]="{ value: iso(value()), reason: reason() }"></pre>
    `,
})
export class CalendarViewPicker {
    protected readonly styles = calendar;
    protected readonly pickerStyles = datePicker;
    protected readonly presetStyles = calendarPreset;
    protected readonly iso = iso;
    protected readonly today = todayPreset;
    protected readonly min: PlainDate = { year: 2025, month: 6, day: 15 };
    protected readonly max: PlainDate = { year: 2028, month: 2, day: 10 };
    protected readonly value = signal<PlainDate | null>(null);
    protected readonly reason = signal<string | undefined>(undefined);
}
