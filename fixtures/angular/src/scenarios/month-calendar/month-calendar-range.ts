import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    MonthRangeCalendarRoot,
    type YearMonthRange,
} from "@fragiola/primitives-angular/month-range-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { isoMonth, isoPeriod } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";

/** spec/month-calendar.md, `/month-calendar/range` */
@Component({
    selector: "[scenario-month-calendar-range]",
    encapsulation: ViewEncapsulation.None,
    imports: [MonthRangeCalendarRoot, PageView, Output],
    template: `
        <div monthRangeCalendarRoot [(value)]="value" [locale]="'en-US'" [class]="styles.root">
            <div pageView prev="Previous year" next="Next year"></div>
        </div>
        <pre fixtureOutput [values]="{ value: isoPeriod(value(), isoMonth) }"></pre>
    `,
})
export class MonthCalendarRange {
    protected readonly styles = calendar;
    protected readonly isoMonth = isoMonth;
    protected readonly isoPeriod = isoPeriod;
    protected readonly value = signal<YearMonthRange | null>(null);
}
