import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    CalendarRoot,
    type DateRange,
    type PlainDate,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/calendar";
import { CalendarPreset } from "@fragiola/primitives-angular/calendar-preset";
import { RangeCalendarRoot } from "@fragiola/primitives-angular/range-calendar";
import { calendar, calendarPreset } from "examples-shared/recipes/calendar";
import { iso, isoRange } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";
import { lastSevenDays, todayPreset } from "./presets.ts";

/** spec/calendar.md, `/calendar-preset/basic` */
@Component({
    selector: "[scenario-calendar-preset-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        CalendarRoot,
        RangeCalendarRoot,
        CalendarPreset,
        MonthView,
        Output,
    ],
    template: `
        <div class="flex flex-wrap gap-8">
            <section aria-label="Date">
                <div calendarRoot [(value)]="date" (valueChangeDetails)="changed($event)" [max]="max" [locale]="'en-US'" [class]="styles.root">
                    <div monthView></div>
                    <div [class]="presetStyles.list"><button [calendarPreset]="today" [class]="presetStyles.preset">Today</button><button [calendarPreset]="christmas" [class]="presetStyles.preset">Christmas</button><button [calendarPreset]="newYear" [class]="presetStyles.preset">New Year</button></div>
                </div>
            </section>
            <section aria-label="Range">
                <div rangeCalendarRoot [(value)]="range" [locale]="'en-US'" [class]="styles.root">
                    <div monthView></div>
                    <div [class]="presetStyles.list"><button [calendarPreset]="lastSevenDays" [class]="presetStyles.preset">Last 7 days</button><button [calendarPreset]="nextWeek" [class]="presetStyles.preset">Next week</button></div>
                </div>
            </section>
        </div>
        <pre fixtureOutput [values]="{ date: iso(date()), reason: reason(), range: isoRange(range()) }"></pre>
    `,
})
export class CalendarPresetBasic {
    protected readonly styles = calendar;
    protected readonly presetStyles = calendarPreset;
    protected readonly iso = iso;
    protected readonly isoRange = isoRange;
    protected readonly max: PlainDate = { year: 2026, month: 12, day: 31 };
    protected readonly today = todayPreset;
    protected readonly christmas: PlainDate = {
        year: 2026,
        month: 12,
        day: 25,
    };
    protected readonly newYear: PlainDate = { year: 2027, month: 1, day: 1 };
    protected readonly lastSevenDays = lastSevenDays;
    protected readonly nextWeek: DateRange = {
        start: { year: 2026, month: 11, day: 23 },
        end: { year: 2026, month: 11, day: 29 },
    };
    protected readonly date = signal<PlainDate | null>(null);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly range = signal<DateRange | null>(null);

    protected changed({ details }: ValueChangeEvent<PlainDate | null>): void {
        this.reason.set(details.reason);
    }
}
