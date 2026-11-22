import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";

// spec/direction.md, "Anatomy": the provider renders nothing of its own, and sets no `dir`

test("direction / provider: no element and no dir of its own", async ({
    page,
}) => {
    await openScenario(page, "/direction/provider", { today: true });
    await expect(
        page.locator('[data-primitives-part^="direction-"]'),
    ).toHaveCount(0);
    await expect(page.locator("[dir]")).toHaveCount(0);
    // the components' parts are there, under the provider
    await expect(
        page.locator('[data-primitives-part="tabs-list"]'),
    ).toHaveCount(1);
    await expect(
        page.locator('[data-primitives-part="slider-root"]'),
    ).toHaveCount(1);
});
