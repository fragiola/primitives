import { Component, computed, signal } from "@angular/core";
import {
    MonthCalendarCell,
    MonthCalendarGrid,
    MonthCalendarGridBody,
    MonthCalendarHeading,
    MonthCalendarNextButton,
    MonthCalendarPrevButton,
    MonthCalendarRow,
    YearRangeCalendarRoot,
} from "@fragiola/primitives-angular/year-range-calendar";
import {
    DatePickerPopup,
    DatePickerPortal,
    DatePickerPositioner,
    DatePickerTrigger,
    type PlainYear,
    type YearRange,
    YearRangePickerRoot,
} from "@fragiola/primitives-angular/year-range-picker";
import { styles } from "./styles.ts";

const FILMS = [
    { title: "Metropolis", year: 1927 },
    { title: "Casablanca", year: 1942 },
    { title: "Vertigo", year: 1958 },
    { title: "Alien", year: 1979 },
    { title: "Back to the Future", year: 1985 },
    { title: "Spirited Away", year: 2001 },
    { title: "Parasite", year: 2019 },
    { title: "Past Lives", year: 2023 },
];
const thisYear: PlainYear = { year: new Date().getFullYear() };
const inRange = (year: number, range: YearRange | null) =>
    range === null || (year >= range.start.year && year <= range.end.year);

// A list filtered by a range of years: the picker's popup holds a page of twelve years (the
// previous and next pages a press away), two years set the range, and the list keeps the films of
// those years; Clear shows them all again (spec/month-calendar.md).
@Component({
    selector: "example-year-range-filter",
    imports: [
        YearRangePickerRoot,
        DatePickerTrigger,
        DatePickerPortal,
        DatePickerPositioner,
        DatePickerPopup,
        YearRangeCalendarRoot,
        MonthCalendarPrevButton,
        MonthCalendarHeading,
        MonthCalendarNextButton,
        MonthCalendarGrid,
        MonthCalendarGridBody,
        MonthCalendarRow,
        MonthCalendarCell,
    ],
    template: `
        <div [class]="styles.page">
            <div [class]="styles.filter">
                <ng-container yearRangePickerRoot [(value)]="range" [max]="thisYear" locale="en-US">
                    <button datePickerTrigger [class]="styles.picker.trigger">{{ label() }}</button>
                    <ng-container *datePickerPortal>
                        <div datePickerPositioner [sideOffset]="4" [class]="styles.picker.positioner">
                            <div datePickerPopup aria-label="Choose years" [class]="styles.picker.popup">
                                <div yearRangeCalendarRoot [class]="styles.calendar.root">
                                    <div [class]="styles.header">
                                        <button monthCalendarPrevButton aria-label="Previous years" [class]="styles.calendar.prevButton">‹</button>
                                        <h2 monthCalendarHeading #heading="monthCalendarHeading" [class]="styles.calendar.heading">{{ heading.label() }}</h2>
                                        <button monthCalendarNextButton aria-label="Next years" [class]="styles.calendar.nextButton">›</button>
                                    </div>
                                    <table monthCalendarGrid [class]="styles.calendar.grid">
                                        <tbody monthCalendarGridBody #body="monthCalendarGridBody">
                                            @for (row of body.rows(); track row[0]?.year) {
                                                <tr monthCalendarRow>
                                                    @for (year of row; track year.year) {
                                                        <td monthCalendarCell #cell="monthCalendarCell" [value]="year" [class]="styles.calendar.cell">{{ cell.text() }}</td>
                                                    }
                                                </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </ng-container>
                </ng-container>
                <button type="button" [class]="styles.clear" (click)="range.set(null)">Clear</button>
            </div>
            <ul aria-label="Films" [class]="styles.list">
                @for (film of films(); track film.title) {
                    <li [class]="styles.item"><span>{{ film.title }}</span><span [class]="styles.year">{{ film.year }}</span></li>
                }
            </ul>
        </div>
    `,
})
export default class YearRangeFilter {
    protected readonly styles = styles;
    protected readonly thisYear = thisYear;
    protected readonly range = signal<YearRange | null>(null);
    protected readonly films = computed(() =>
        FILMS.filter((film) => inRange(film.year, this.range())),
    );

    protected label(): string {
        const range = this.range();
        return range
            ? `Years: ${range.start.year} – ${range.end.year}`
            : "Years: all";
    }
}
