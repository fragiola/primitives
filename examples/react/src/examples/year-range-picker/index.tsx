import { YearRangeCalendar } from "@fragiola/primitives-react/year-range-calendar";
import {
    type PlainYear,
    type YearRange,
    YearRangePicker,
} from "@fragiola/primitives-react/year-range-picker";
import { useState } from "react";
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
export default function YearRangeFilter() {
    const [range, setRange] = useState<YearRange | null>(null);
    const films = FILMS.filter((film) => inRange(film.year, range));
    return (
        <div className={styles.page}>
            <div className={styles.filter}>
                <YearRangePicker.Root
                    value={range}
                    onValueChange={setRange}
                    max={thisYear}
                    locale="en-US"
                >
                    <YearRangePicker.Trigger className={styles.picker.trigger}>
                        {range
                            ? `Years: ${range.start.year} – ${range.end.year}`
                            : "Years: all"}
                    </YearRangePicker.Trigger>
                    <YearRangePicker.Portal>
                        <YearRangePicker.Positioner
                            sideOffset={4}
                            className={styles.picker.positioner}
                        >
                            <YearRangePicker.Popup
                                aria-label="Choose years"
                                className={styles.picker.popup}
                            >
                                <YearRangeCalendar.Root
                                    className={styles.calendar.root}
                                >
                                    <div className={styles.header}>
                                        <YearRangeCalendar.PrevButton
                                            aria-label="Previous years"
                                            className={
                                                styles.calendar.prevButton
                                            }
                                        >
                                            ‹
                                        </YearRangeCalendar.PrevButton>
                                        <YearRangeCalendar.Heading
                                            className={styles.calendar.heading}
                                        />
                                        <YearRangeCalendar.NextButton
                                            aria-label="Next years"
                                            className={
                                                styles.calendar.nextButton
                                            }
                                        >
                                            ›
                                        </YearRangeCalendar.NextButton>
                                    </div>
                                    <YearRangeCalendar.Grid
                                        className={styles.calendar.grid}
                                    >
                                        <YearRangeCalendar.GridBody>
                                            {(row) => (
                                                <YearRangeCalendar.Row
                                                    key={row[0]?.year}
                                                    row={row}
                                                >
                                                    {(year) => (
                                                        <YearRangeCalendar.Cell
                                                            key={year.year}
                                                            value={year}
                                                            className={
                                                                styles.calendar
                                                                    .cell
                                                            }
                                                        />
                                                    )}
                                                </YearRangeCalendar.Row>
                                            )}
                                        </YearRangeCalendar.GridBody>
                                    </YearRangeCalendar.Grid>
                                </YearRangeCalendar.Root>
                            </YearRangePicker.Popup>
                        </YearRangePicker.Positioner>
                    </YearRangePicker.Portal>
                </YearRangePicker.Root>
                <button
                    type="button"
                    className={styles.clear}
                    onClick={() => setRange(null)}
                >
                    Clear
                </button>
            </div>
            <ul aria-label="Films" className={styles.list}>
                {films.map((film) => (
                    <li key={film.title} className={styles.item}>
                        <span>{film.title}</span>
                        <span className={styles.year}>{film.year}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
