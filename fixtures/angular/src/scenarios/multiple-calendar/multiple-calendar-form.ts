import { Component, signal, ViewEncapsulation } from "@angular/core";
import {
    MultipleCalendarRoot,
    type PlainDate,
} from "@fragiola/primitives-angular/multiple-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { formEntries } from "../../kit/form-entries.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";

const NOV_20: PlainDate[] = [{ year: 2026, month: 11, day: 20 }];

/** spec/calendar.md, `/multiple-calendar/form` */
@Component({
    selector: "[scenario-multiple-calendar-form]",
    encapsulation: ViewEncapsulation.None,
    imports: [MultipleCalendarRoot, MonthView, Output],
    template: `
        <form class="flex flex-col items-start gap-4" (submit)="submit($event)">
            <div multipleCalendarRoot [name]="'days'" [defaultValue]="initial" [locale]="'en-US'" [class]="styles.root">
                <div monthView></div>
            </div>
            <div class="flex gap-2"><button type="submit">Submit</button><button type="reset">Reset</button></div>
        </form>
        <pre fixtureOutput [values]="{ form: form() }"></pre>
    `,
})
export class MultipleCalendarForm {
    protected readonly styles = calendar;
    protected readonly initial = NOV_20;
    protected readonly form = signal<string | undefined>(undefined);

    protected submit(event: SubmitEvent): void {
        event.preventDefault();
        this.form.set(formEntries(event.currentTarget as HTMLFormElement));
    }
}
