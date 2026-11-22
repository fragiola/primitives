import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/button.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

/** The count stays: no click ran, after a moment for a late one. */
async function expectCount(page: Page, count: number): Promise<void> {
    await expectOutput(page, "count", String(count));
}

test.describe("button / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/button/basic");
    });

    test("five buttons: enabled, disabled, and focusable while disabled", async ({
        page,
    }) => {
        await expect(page.getByRole("button")).toHaveCount(5);
        await expect(button(page, "Save")).toBeEnabled();
        await expect(button(page, "Archive")).toBeEnabled();
        await expect(button(page, "Delete")).toBeDisabled();
        await expect(button(page, "Delete")).toHaveAttribute("disabled", "");
        for (const name of ["Publishing", "Locked"]) {
            await expect(button(page, name)).toHaveAttribute(
                "aria-disabled",
                "true",
            );
        }
        await expectOutput(page, "pressed", "none");
        await expectCount(page, 0);
    });

    test("a click, Enter and Space each click once", async ({ page }) => {
        await button(page, "Save").click();
        await expectOutput(page, "pressed", "Save");
        await expectCount(page, 1);
        await button(page, "Save").focus();
        await page.keyboard.press("Enter");
        await expectCount(page, 2);
        await page.keyboard.press("Space");
        await expectCount(page, 3);
    });

    test("the tab order skips the disabled buttons, not the focusable one", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expect(button(page, "Save")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Publishing")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(page, "Archive")).toBeFocused();
    });

    test("a focusable disabled button ignores a click, Enter and Space, and Tab moves on", async ({
        page,
    }) => {
        const publishing = button(page, "Publishing");
        // forced: Playwright waits for an aria-disabled element to be enabled
        await publishing.click({ force: true });
        await publishing.focus();
        await expect(publishing).toBeFocused();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Space");
        await expectOutput(page, "pressed", "none");
        await expectCount(page, 0);
        await page.keyboard.press("Tab");
        await expect(button(page, "Archive")).toBeFocused();
    });

    test("a non-native button clicks on a click, on Enter, and on Space's key up, with no scroll", async ({
        page,
    }) => {
        // a page tall enough to scroll, so a Space that scrolled would show
        await page.evaluate(() => {
            document.body.style.minHeight = "3000px";
        });
        const archive = button(page, "Archive");
        await archive.click();
        await expectOutput(page, "pressed", "Archive");
        await expectCount(page, 1);
        await archive.focus();
        await page.keyboard.press("Enter");
        await expectCount(page, 2);
        await page.keyboard.down(" ");
        await expectCount(page, 2);
        await page.keyboard.up(" ");
        await expectCount(page, 3);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("a disabled non-native button ignores a click", async ({ page }) => {
        await button(page, "Locked").click({ force: true });
        await expectOutput(page, "pressed", "none");
        await expectCount(page, 0);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
