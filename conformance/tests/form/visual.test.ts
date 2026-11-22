import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("form / basic: the server's answer", async ({ page }) => {
    await openScenario(page, "/form/basic");
    await page.getByRole("textbox", { name: "Email" }).fill("ada@example.com");
    await page.getByRole("textbox", { name: "Username" }).fill("admin");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("This username is taken.")).toBeVisible();
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await expectScreen(page, "form-basic-server-error");
});
