import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    type YearRange,
    YearRangeCalendarRoot,
} from "@fragiola/primitives-angular/year-range-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { isoPeriod, isoYear } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";

/** spec/month-calendar.md, `/year-calendar/range` */
@Component({
    selector: "[scenario-year-calendar-range]",
    encapsulation: ViewEncapsulation.None,
    imports: [YearRangeCalendarRoot, PageView, Output],
    template: `
        <div yearRangeCalendarRoot [(value)]="value" [locale]="'en-US'" [class]="styles.root">
            <div pageView prev="Previous years" next="Next years"></div>
        </div>
        <pre fixtureOutput [values]="{ value: isoPeriod(value(), isoYear) }"></pre>
    `,
})
export class YearCalendarRange {
    protected readonly styles = calendar;
    protected readonly isoYear = isoYear;
    protected readonly isoPeriod = isoPeriod;
    protected readonly value = signal<YearRange | null>(null);
}
