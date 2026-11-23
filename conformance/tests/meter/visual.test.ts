import { expect, test } from "@playwright/test";
import { openScenario } from "../../src/scenario.ts";
import { expectScreen, visualOnlyInCi } from "../../src/visual.ts";

test.beforeEach(visualOnlyInCi);

test("meter / basic", async ({ page }) => {
    await openScenario(page, "/meter/basic");
    await expect(page.getByRole("meter", { name: "Storage" })).toHaveAttribute(
        "aria-valuetext",
        "384 GB",
    );
    await expectScreen(page, "meter-basic");
});

test("meter / basic?dir=rtl", async ({ page }) => {
    await openScenario(page, "/meter/basic", { dir: "rtl" });
    await expect(page.getByRole("meter", { name: "Battery" })).toHaveAttribute(
        "aria-valuenow",
        "60",
    );
    await expectScreen(page, "meter-basic-rtl");
});
