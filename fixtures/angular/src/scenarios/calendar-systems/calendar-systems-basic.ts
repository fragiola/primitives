import {
    Component,
    computed,
    input,
    signal,
    ViewEncapsulation,
} from "@angular/core";
import {
    CalendarRoot,
    type PlainDate,
} from "@fragiola/primitives-angular/calendar";
import type { DateFieldValue } from "@fragiola/primitives-angular/date-field";
import {
    MonthCalendarRoot,
    type PlainYearMonth,
} from "@fragiola/primitives-angular/month-calendar";
import { calendar } from "examples-shared/recipes/calendar";
import { dateField } from "examples-shared/recipes/date-field";
import { field } from "examples-shared/recipes/field";
import { systemOf } from "../../kit/calendar-system.ts";
import { iso, isoMonth } from "../../kit/iso.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";
import { PageView } from "../../kit/page-view.ts";
import { DATE_FIELD_PARTS } from "../date-field/date-field-parts.ts";
import { FIELD_PARTS } from "../field/field-parts.ts";

const TODAY: PlainDate = { year: 2026, month: 11, day: 20 };

/** spec/calendar-systems.md, `/calendar-systems/basic` */
@Component({
    selector: "[scenario-calendar-systems-basic]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        CalendarRoot,
        MonthView,
        FIELD_PARTS,
        DATE_FIELD_PARTS,
        MonthCalendarRoot,
        PageView,
        Output,
    ],
    template: `
        <div class="flex flex-wrap items-start gap-6">
            <div calendarRoot [calendar]="system()" [locale]="locale()" [defaultValue]="today" (valueChange)="date.set(iso($event))" [class]="styles.root">
                <div monthView></div>
            </div>
            <div class="flex flex-col gap-4">
                <div fieldRoot [class]="fieldStyles.root">
                    <label fieldLabel [class]="fieldStyles.label">Date</label>
                    <div dateFieldRoot [calendar]="system()" [locale]="locale()" [defaultValue]="today" (valueChange)="changeField($event)" [class]="fieldInputStyles.root">
                        <div dateFieldInput #input="dateFieldInput" [class]="fieldInputStyles.input">
                            @for (segment of input.segments(); track segment.index) {
                                <span [dateFieldSegment]="segment" [class]="fieldInputStyles.segment">{{ segment.text }}</span>
                            }
                        </div>
                    </div>
                </div>
                <div monthCalendarRoot [calendar]="system()" [locale]="locale()" [defaultValue]="month()" (valueChange)="changeMonth($event)" [class]="styles.root">
                    <div pageView prev="Previous year" next="Next year"></div>
                </div>
            </div>
        </div>
        <pre fixtureOutput [values]="{ date: date(), field: fieldValue(), month: monthValue() }"></pre>
    `,
})
export class CalendarSystemsBasic {
    protected readonly styles = calendar;
    protected readonly fieldStyles = field;
    protected readonly fieldInputStyles = dateField;
    protected readonly today = TODAY;
    readonly locale = input.required<string | undefined>();
    protected readonly system = computed(() => systemOf(this.locale()));
    protected readonly month = computed(() => this.system().yearMonthOf(TODAY));
    protected readonly date = signal<string | undefined>(undefined);
    protected readonly fieldValue = signal<string | undefined>(undefined);
    protected readonly monthValue = signal<string | undefined>(undefined);

    protected iso(value: PlainDate | null): string | undefined {
        return iso(value);
    }

    protected changeField(value: DateFieldValue | null): void {
        this.fieldValue.set(value === null ? "none" : iso(value));
    }

    protected changeMonth(value: PlainYearMonth | null): void {
        this.monthValue.set(isoMonth(value));
    }
}
