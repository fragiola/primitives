import { Component, input, ViewEncapsulation } from "@angular/core";
import { CalendarViewTrigger } from "@fragiola/primitives-angular/calendar-view";
import {
    MonthCalendarCell,
    MonthCalendarGrid,
    MonthCalendarGridBody,
    MonthCalendarHeading,
    type MonthCalendarItem,
    MonthCalendarNextButton,
    MonthCalendarPrevButton,
    MonthCalendarRow,
} from "@fragiola/primitives-angular/month-calendar";
import { calendar, calendarView } from "examples-shared/recipes/calendar";
import { monthCalendar } from "examples-shared/recipes/month-calendar";

/**
 * The header (PrevButton, Heading, NextButton) and the grid of a month or year calendar, as every
 * month and year scenario shows them (spec/month-calendar.md): the `<div class="flex flex-col
 * gap-2">` of React's PageView; its parts find the calendar root around it by injection.
 */
@Component({
    selector: "div[pageView]",
    encapsulation: ViewEncapsulation.None,
    imports: [
        MonthCalendarPrevButton,
        MonthCalendarNextButton,
        MonthCalendarHeading,
        MonthCalendarGrid,
        MonthCalendarGridBody,
        MonthCalendarRow,
        MonthCalendarCell,
        CalendarViewTrigger,
    ],
    host: { class: "flex flex-col gap-2" },
    template: `
        <div class="flex items-center justify-between gap-2">
            <button monthCalendarPrevButton [class]="styles['prev-button']" [attr.aria-label]="prev()">‹</button>
            @if (viewTrigger()) {
                <button calendarViewTrigger [class]="viewStyles.trigger"><span monthCalendarHeading #heading="monthCalendarHeading" [class]="styles.heading">{{ heading.label() }}</span></button>
            } @else {
                <h2 monthCalendarHeading #heading="monthCalendarHeading" [class]="styles.heading">{{ heading.label() }}</h2>
            }
            <button monthCalendarNextButton [class]="styles['next-button']" [attr.aria-label]="next()">›</button>
        </div>
        <table monthCalendarGrid [class]="pageStyles.grid">
            <tbody monthCalendarGridBody #body="monthCalendarGridBody">
                @for (row of body.rows(); track key(row[0])) {
                    <tr monthCalendarRow>
                        @for (item of row; track key(item)) {
                            <td monthCalendarCell #cell="monthCalendarCell" [value]="item" [class]="pageStyles.cell">{{ cell.text() }}</td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    `,
})
export class PageView {
    protected readonly styles = calendar;
    protected readonly viewStyles = calendarView;
    protected readonly pageStyles = monthCalendar;
    readonly prev = input.required<string>();
    readonly next = input.required<string>();
    /** The Heading inside a CalendarView Trigger ("Views"). */
    readonly viewTrigger = input(false);

    protected key(item: MonthCalendarItem | undefined): string {
        if (item === undefined) {
            return "";
        }
        return "month" in item ? `${item.year}-${item.month}` : `${item.year}`;
    }
}
