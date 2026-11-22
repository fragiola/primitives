import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("switch / basic", async ({ page }) => {
    await openScenario(page, "/switch/basic");
    await expect(
        page.getByRole("switch", { name: "Wi-Fi", exact: true }),
    ).toHaveAttribute("aria-checked", "true");
    await expectScreen(page, "switch-basic");
});

test("switch / basic: focused, off", async ({ page }) => {
    await openScenario(page, "/switch/basic");
    const wifi = page.getByRole("switch", { name: "Wi-Fi", exact: true });
    await wifi.focus();
    await page.keyboard.press("Space");
    await expect(wifi).toHaveAttribute("aria-checked", "false");
    await expectScreen(page, "switch-basic-off");
});
