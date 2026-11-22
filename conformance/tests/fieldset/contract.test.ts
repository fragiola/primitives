import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/fieldset.md: anatomy, the legend's name, the disabled state

test("fieldset / basic: parts, the legend's id and the disabled state", async ({
    page,
}) => {
    await openScenario(page, "/fieldset/basic");
    const roots = part(page, "fieldset", "root");
    const legends = part(page, "fieldset", "legend");
    await expect(roots).toHaveCount(3);
    await expect(legends).toHaveCount(3);
    for (const index of [0, 1, 2]) {
        const root = roots.nth(index);
        const legend = legends.nth(index);
        await expect(root).toHaveJSProperty("tagName", "FIELDSET");
        await expect(legend).toHaveJSProperty("tagName", "DIV");
        const id = await legend.getAttribute("id");
        expect(id).toBeTruthy();
        await expect(root).toHaveAttribute("aria-labelledby", id as string);
    }
    const [shipping, billing, contact] = [0, 1, 2].map((index) =>
        roots.nth(index),
    ) as [Locator, Locator, Locator];
    await expect(shipping).not.toHaveAttribute("data-disabled");
    await expect(shipping).not.toHaveAttribute("disabled");
    await expect(legends.nth(0)).not.toHaveAttribute("data-disabled");
    for (const [root, legend] of [
        [billing, legends.nth(1)],
        [contact, legends.nth(2)],
    ] as const) {
        await expect(root).toHaveAttribute("data-disabled", "");
        await expect(legend).toHaveAttribute("data-disabled", "");
    }
    await expect(billing).toHaveAttribute("disabled", "");
    // every field part inside the disabled fieldset is disabled, none outside it
    const inside = billing.locator('[data-primitives-part^="field-"]');
    expect(await inside.count()).toBeGreaterThanOrEqual(6);
    await expect(
        page.locator(
            'fieldset[data-disabled] [data-primitives-part^="field-"]:not([data-disabled])',
        ),
    ).toHaveCount(0);
    await expect(
        shipping.locator('[data-primitives-part^="field-"][data-disabled]'),
    ).toHaveCount(0);
    await expectNoFalseStates(
        page.locator(
            '[data-primitives-part^="fieldset-"], [data-primitives-part^="field-"]',
        ),
    );
});
