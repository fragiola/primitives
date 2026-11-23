import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

// the screenshot parks the pointer away: a keyboard focus keeps the card open
test("hover-card / basic: open on focus", async ({ page }) => {
    await openScenario(page, "/hover-card/basic");
    await page.getByRole("button", { name: "Before" }).focus();
    await page.keyboard.press("Tab");
    await expect(
        page.locator('[data-primitives-part="hover-card-popup"]'),
    ).toBeVisible({ timeout: 5000 });
    await expectScreen(page, "hover-card-basic-open");
});

test("hover-card / detached: open on the second trigger, with its backdrop", async ({
    page,
}) => {
    await openScenario(page, "/hover-card/detached");
    await page.getByRole("link", { name: "@grace" }).focus();
    await expect(
        page.locator('[data-primitives-part="hover-card-popup"]'),
    ).toHaveText("Profile of Grace", { timeout: 5000 });
    await expectScreen(page, "hover-card-detached-open");
});
