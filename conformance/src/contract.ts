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
