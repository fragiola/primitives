// The calendar's expected strings (spec/calendar.md), computed with `Intl` as the components do.

/** The full date name of a calendar cell (spec/calendar.md: `Intl` `dateStyle: "full"`). */
export function fullDate(
    locale: string,
    year: number,
    month: number,
    day: number,
): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(
        new Date(year, month - 1, day),
    );
}

/** A month heading (`Intl` `month: "long", year: "numeric"`). */
export function monthHeading(
    locale: string,
    year: number,
    month: number,
): string {
    return new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
    }).format(new Date(year, month - 1, 1));
}

/** A weekday's short name (`Intl` `weekday: "short"`), from any date on that weekday. */
export function shortWeekday(
    locale: string,
    year: number,
    month: number,
    day: number,
): string {
    return new Intl.DateTimeFormat(locale, { weekday: "short" }).format(
        new Date(year, month - 1, day),
    );
}

/** A month's name (`Intl` `month: "long"`), a month cell's content. */
export function longMonth(locale: string, year: number, month: number): string {
    return new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(year, month - 1, 1),
    );
}

/** A year (`Intl` `year: "numeric"`), a year cell's name and a month grid's heading. */
export function yearName(locale: string, year: number): string {
    return new Intl.DateTimeFormat(locale, { year: "numeric" }).format(
        new Date(year, 0, 1),
    );
}

/** A page of years (`Intl.DateTimeFormat#formatRange`, its spaces as U+0020), a year grid's heading. */
export function yearSpan(locale: string, first: number, last: number): string {
    return new Intl.DateTimeFormat(locale, { year: "numeric" })
        .formatRange(new Date(first, 0, 1), new Date(last, 0, 1))
        .replace(/[\u00a0\u2009\u202f]/g, " ");
}
