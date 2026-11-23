import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    type PlainYear,
    YearCalendarRoot,
} from "@fragiola/primitives-angular/year-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { isoYear } from "../../kit/iso.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";

/** spec/month-calendar.md, `/year-calendar/basic` */
@Component({
    selector: "[scenario-year-calendar-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [YearCalendarRoot, PageView, Output],
    template: `
        <div yearCalendarRoot [(value)]="value" [min]="min" [max]="max" [locale]="'en-US'" [class]="styles.root">
            <div pageView prev="Previous years" next="Next years"></div>
        </div>
        <pre fixtureOutput [values]="{ value: isoYear(value()) }"></pre>
    `,
})
export class YearCalendarBasic {
    protected readonly styles = calendar;
    protected readonly isoYear = isoYear;
    protected readonly min: PlainYear = { year: 2010 };
    protected readonly max: PlainYear = { year: 2035 };
    protected readonly value = signal<PlainYear | null>(null);
}
