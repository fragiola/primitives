// The entry of @fragiola/primitives/month-year: the month and year values (`{ year, month }`,
// `{ year }`, no day, no time zone), the grid of a month or year calendar (a page of 12 items, its
// rows and its key map) and their locale data from `Intl` (spec/month-calendar.md). Independent of
// `/date`, so the day calendars never import it.

export {
    currentYearMonth,
    fromMonthIndex,
    monthIndex,
    type PlainYear,
    type PlainYearMonth,
    toIsoYear,
    toIsoYearMonth,
    type YearMonthRange,
    type YearRange,
} from "./plain-year-month.ts";
export {
    UNIT_PAGE_SIZE,
    type UnitKeyOptions,
    unitKeyTarget,
    unitPageStart,
    unitRows,
} from "./unit-grid.ts";
export {
    formatMonthName,
    formatYear,
    formatYearMonth,
    formatYearSpan,
} from "./unit-locale-data.ts";
