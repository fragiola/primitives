import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    MonthCalendarRoot,
    type PlainYearMonth,
} from "@fragiola/primitives-angular/month-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { isoMonth } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";

/** spec/month-calendar.md, `/month-calendar/basic` */
@Component({
    selector: "[scenario-month-calendar-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [MonthCalendarRoot, PageView, Output],
    template: `
        <div monthCalendarRoot [(value)]="value" [min]="min" [max]="max" [isUnavailable]="isAugust2026" [locale]="'en-US'" [class]="styles.root">
            <div pageView prev="Previous year" next="Next year"></div>
        </div>
        <pre fixtureOutput [values]="{ value: isoMonth(value()) }"></pre>
    `,
})
export class MonthCalendarBasic {
    protected readonly styles = calendar;
    protected readonly isoMonth = isoMonth;
    protected readonly min: PlainYearMonth = { year: 2025, month: 3 };
    protected readonly max: PlainYearMonth = { year: 2027, month: 10 };
    protected readonly isAugust2026 = (month: PlainYearMonth) =>
        month.year === 2026 && month.month === 8;
    protected readonly value = signal<PlainYearMonth | null>(null);
}
