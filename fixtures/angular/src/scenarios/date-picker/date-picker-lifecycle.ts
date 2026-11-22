import { Component, input, signal, ViewEncapsulation } from "@angular/core";
import { CalendarRoot } from "@fragiola/primitives-angular/calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerRoot,
    DatePickerTrigger,
    type PlainDate,
} from "@fragiola/primitives-angular/date-picker";
import { calendar } from "examples-shared/recipes/calendar";
import { datePicker } from "examples-shared/recipes/date-picker";
import { iso } from "../../kit/iso.ts";
import { Lifecycle } from "../../kit/lifecycle.ts";
import { MonthView } from "../../kit/month-view.ts";
import { Output } from "../../kit/output.ts";

/**
 * spec/README.md, "The lifecycle scenarios". The trigger's text is two text nodes, as JSX makes
 * `Choose date: {iso(value) ?? "none"}`.
 */
@Component({
    selector: "[scenario-date-picker-lifecycle]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        DatePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        CalendarRoot,
        MonthView,
        Output,
    ],
    template: `
        <ng-container datePickerRoot [(value)]="value" (openChangeDetails)="lifecycle.onOpenChange($event)" (openChangeComplete)="lifecycle.onOpenChangeComplete($event)" [locale]="locale()">
            <button datePickerTrigger [class]="styles.trigger">@for (run of ["Choose date: ", iso(value()) ?? "none"]; track $index) {<ng-container>{{ run }}</ng-container>}</button>
            <ng-container *datePickerPortal="{ keepMounted: true }">
                <div datePickerPositioner [sideOffset]="4" [class]="styles.positioner">
                    <div datePickerPopup aria-label="Choose date" [class]="styles.popup">
                        <div calendarRoot [class]="calendarStyles.root">
                            <div monthView></div>
                        </div>
                    </div>
                </div>
            </ng-container>
        </ng-container>
        <pre fixtureOutput [values]="lifecycle.values()"></pre>
    `,
})
export class DatePickerLifecycle {
    protected readonly styles = datePicker;
    protected readonly calendarStyles = calendar;
    protected readonly iso = iso;
    readonly locale = input.required<string | undefined>();
    readonly cancel = input(false);
    protected readonly value = signal<PlainDate | null>(null);
    protected readonly lifecycle = new Lifecycle(() => this.cancel());
}
