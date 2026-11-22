import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("radio-group / basic: checked and focused", async ({ page }) => {
    await openScenario(page, "/radio-group/basic");
    const pro = page.getByRole("radio", { name: "Pro", exact: true });
    await pro.focus();
    await page.keyboard.press("Space");
    await expect(pro).toHaveAttribute("aria-checked", "true");
    await expectScreen(page, "radio-group-basic-checked");
});

test("radio-group / controlled: horizontal", async ({ page }) => {
    await openScenario(page, "/radio-group/controlled");
    await expect(
        page.getByRole("radio", { name: "Medium", exact: true }),
    ).toHaveAttribute("aria-checked", "true");
    await expectScreen(page, "radio-group-controlled");
});
