import { expect, type Locator, type Page } from "@playwright/test";

/** Every element of one part: `[data-primitives-part="<component>-<part>"]` (spec/README.md). */
export function part(
    page: Page | Locator,
    component: string,
    name: string,
): Locator {
    return page.locator(`[data-primitives-part="${component}-${name}"]`);
}

/** Every element of one component: its part attribute starts with `<component>-`. */
export function parts(page: Page | Locator, component: string): Locator {
    return page.locator(`[data-primitives-part^="${component}-"]`);
}

/** A boolean state attribute is present (empty) or absent, never `"false"`. */
export async function expectNoFalseStates(locator: Locator): Promise<void> {
    const falseStates = await locator.evaluateAll((elements) =>
        elements.flatMap((element) =>
            [...element.attributes]
                .filter(
                    (attribute) =>
                        attribute.name.startsWith("data-") &&
                        attribute.value === "false",
                )
                .map(
                    (attribute) =>
                        `${element.tagName}[${attribute.name}="false"]`,
                ),
        ),
    );
    expect(falseStates).toEqual([]);
}

/**
 * An overlay part's open state (spec/README.md, "State attributes"): exactly one of `data-open`
 * and `data-closed` is present, `data-open` while open, `data-closed` while it is rendered and not
 * open (its exit running, or kept mounted).
 */
export async function expectOpenState(
    locator: Locator,
    open: boolean,
): Promise<void> {
    if (open) {
        await expect(locator).toHaveAttribute("data-open", "");
        await expect(locator).not.toHaveAttribute("data-closed");
    } else {
        await expect(locator).toHaveAttribute("data-closed", "");
        await expect(locator).not.toHaveAttribute("data-open");
    }
}
