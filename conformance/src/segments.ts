import { expect, type Locator, type Page } from "@playwright/test";

// The date and time fields' helpers (spec/date-field.md, "Scenarios"): the expected names, orders
// and texts are computed in the browser with its own `Intl`, never hard-coded (engines differ).

/** The field's `group` by its accessible name. */
export function fieldGroup(page: Page, name: string): Locator {
    return page.getByRole("group", { name, exact: true });
}

/** The editable segments of a group, in document order. */
export function spinbuttons(group: Locator): Locator {
    return group.getByRole("spinbutton");
}

/** The segment of one type in a group (`data-type`). */
export function segment(group: Locator, type: string): Locator {
    return group.locator(`[role="spinbutton"][data-type="${type}"]`);
}

/** The editable segments' types, in document order. */
export function segmentTypes(group: Locator): Promise<string[]> {
    return spinbuttons(group).evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("data-type") ?? ""),
    );
}

/** The editable segment types of `Intl`'s format for the locale, in its order. */
export function intlOrder(
    page: Page,
    locale: string,
    options: Intl.DateTimeFormatOptions,
): Promise<string[]> {
    return page.evaluate(
        ({ locale, options }) =>
            new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" })
                .formatToParts(Date.UTC(2026, 10, 23, 14, 35, 45))
                .map((part) => part.type)
                .filter((type) => type !== "literal"),
        { locale, options },
    );
}

/** A segment type's name in the locale (`Intl.DisplayNames`, `dateTimeField`). */
export function segmentName(
    page: Page,
    locale: string,
    type: string,
): Promise<string> {
    return page.evaluate(
        ({ locale, type }) =>
            new Intl.DisplayNames(locale, { type: "dateTimeField" }).of(type) ??
            "",
        { locale, type },
    );
}

/** The day period texts of a locale's 12-hour clock: AM then PM. */
export function dayPeriods(
    page: Page,
    locale: string,
): Promise<[string, string]> {
    return page.evaluate((locale) => {
        const format = new Intl.DateTimeFormat(locale, {
            hour: "numeric",
            hour12: true,
            timeZone: "UTC",
        });
        const period = (hour: number) =>
            format
                .formatToParts(Date.UTC(2026, 10, 23, hour))
                .find((part) => part.type === "dayPeriod")?.value ?? "";
        return [period(0), period(12)] as [string, string];
    }, locale);
}

/** Types `keys` one by one into the focused element (each its own key press). */
export async function typeKeys(page: Page, keys: string): Promise<void> {
    for (const key of keys) {
        await page.keyboard.press(key);
    }
}

/** The left edges of elements, to compare where bidi placed them. */
export function lefts(locator: Locator): Promise<number[]> {
    return locator.evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().left),
    );
}

/** The hidden input's validity flags that are set (`valid` when none). */
export async function validity(hidden: Locator): Promise<string[]> {
    return hidden.evaluate((element) => {
        const state = (element as HTMLInputElement).validity;
        const keys = [
            "valueMissing",
            "rangeUnderflow",
            "rangeOverflow",
            "stepMismatch",
            "badInput",
            "customError",
        ] as const;
        const set = keys.filter((key) => state[key]);
        return set.length === 0 ? ["valid"] : set;
    });
}

/** Expects the segments of a group to be placeholders: no value at all. */
export async function expectPlaceholders(group: Locator): Promise<void> {
    const all = spinbuttons(group);
    const count = await all.count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index += 1) {
        await expect(all.nth(index)).not.toHaveAttribute("aria-valuenow");
        await expect(all.nth(index)).toHaveAttribute("data-placeholder", "");
    }
}
