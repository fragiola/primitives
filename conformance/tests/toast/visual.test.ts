import { expect, type Page, test } from "@playwright/test";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

async function stackOfThree(page: Page) {
    await openScenario(page, "/toast/limit");
    const notify = page.getByRole("button", { name: "Notify" });
    for (let index = 0; index < 3; index += 1) {
        await notify.click();
    }
    await expect(
        page.getByRole("dialog", { name: "Notification 3" }),
    ).toBeVisible();
    await page.mouse.move(0, 0);
    await settleAnimations(page);
}

test("toast / limit: the stack, collapsed", async ({ page }) => {
    await stackOfThree(page);
    await expectScreen(page, "toast-limit-collapsed");
});

// the keyboard in the region expands it (the screenshot parks the pointer, which would not)
test("toast / limit: the stack, expanded by F6", async ({ page }) => {
    await stackOfThree(page);
    await page.getByRole("button", { name: "Notify" }).focus();
    await page.keyboard.press("F6");
    await expect(
        page.locator('[data-primitives-part="toast-viewport"]'),
    ).toHaveAttribute("data-expanded", "");
    await settleAnimations(page);
    await expectScreen(page, "toast-limit-expanded");
});
