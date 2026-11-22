import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/fieldset.md
const textbox = (page: Page, name: string) =>
    page.getByRole("textbox", { name, exact: true });

test.describe("fieldset / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/fieldset/basic");
    });

    test("a group named by its legend holds its fields", async ({ page }) => {
        const shipping = page.getByRole("group", {
            name: "Shipping address",
            exact: true,
        });
        await expect(shipping).toBeVisible();
        await expect(
            shipping.getByRole("textbox", { name: "Street", exact: true }),
        ).toBeEnabled();
        await expect(
            shipping.getByRole("textbox", { name: "City", exact: true }),
        ).toBeEnabled();
    });

    test("a disabled fieldset disables its fields, and a nested one's", async ({
        page,
    }) => {
        await expect(
            page.getByRole("group", { name: "Billing address", exact: true }),
        ).toBeVisible();
        await expect(
            page.getByRole("group", { name: "Billing contact", exact: true }),
        ).toBeVisible();
        await expect(textbox(page, "Billing street")).toBeDisabled();
        await expect(textbox(page, "Phone")).toBeDisabled();
    });

    test("the disabled fields submit nothing", async ({ page }) => {
        await textbox(page, "Street").fill("Main St");
        await textbox(page, "City").fill("Lisbon");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "street=Main St&city=Lisbon");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
