import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    MultipleCalendarRoot,
    type PlainDate,
    type ValueChangeEvent,
} from "@fragiola/primitives-angular/multiple-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { iso } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";

/** spec/calendar.md, `/multiple-calendar/basic` */
@Component({
    selector: "[scenario-multiple-calendar-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [MultipleCalendarRoot, MonthView, Output],
    template: `
        <div multipleCalendarRoot [(value)]="value" (valueChangeDetails)="changed($event)" [maxSelected]="3" [locale]="'en-US'" [class]="styles.root">
            <div monthView></div>
        </div>
        <pre fixtureOutput [values]="{ value: printed(), reason: reason() }"></pre>
    `,
})
export class MultipleCalendarBasic {
    protected readonly styles = calendar;
    protected readonly value = signal<PlainDate[]>([]);
    protected readonly reason = signal<string | undefined>(undefined);
    protected readonly printed = () => {
        const dates = this.value();
        return dates.length > 0 ? dates.map(iso).join(",") : undefined;
    };

    protected changed({ details }: ValueChangeEvent<PlainDate[]>): void {
        this.reason.set(details.reason);
    }
}
