import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/toggle.md
const toggle = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });

async function expectPressed(
    page: Page,
    name: string,
    pressed: boolean,
): Promise<void> {
    await expect(toggle(page, name)).toHaveAttribute(
        "aria-pressed",
        String(pressed),
    );
}

test.describe("toggle / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toggle/basic");
    });

    test("four toggle buttons with their pressed state", async ({ page }) => {
        await expect(page.getByRole("button")).toHaveCount(4);
        await expectPressed(page, "Bold", false);
        await expectPressed(page, "Italic", true);
        await expectPressed(page, "Underline", false);
        await expect(toggle(page, "Underline")).toBeDisabled();
        await expectPressed(page, "Strike", false);
        // the pressed state is a state of the button role
        await expect(
            page.getByRole("button", { name: "Italic", pressed: true }),
        ).toHaveCount(1);
    });

    test("a click presses and releases a toggle, reported with reason none", async ({
        page,
    }) => {
        await toggle(page, "Bold").click();
        await expectPressed(page, "Bold", true);
        await expectOutput(page, "toggle", "Bold");
        await expectOutput(page, "pressed", "true");
        await expectOutput(page, "reason", "none");
        await toggle(page, "Bold").click();
        await expectPressed(page, "Bold", false);
        await expectOutput(page, "pressed", "false");
    });

    test("Enter presses it and Space releases it", async ({ page }) => {
        await toggle(page, "Bold").focus();
        await page.keyboard.press("Enter");
        await expectPressed(page, "Bold", true);
        await page.keyboard.press("Space");
        await expectPressed(page, "Bold", false);
        await expectOutput(page, "pressed", "false");
    });

    test("Tab skips the disabled toggle", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(toggle(page, "Bold")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(toggle(page, "Italic")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(toggle(page, "Strike")).toBeFocused();
    });

    test("a non-native toggle presses on Enter's key down and Space's key up, with no scroll", async ({
        page,
    }) => {
        await page.evaluate(() => {
            document.body.style.minHeight = "3000px";
        });
        const strike = toggle(page, "Strike");
        await strike.focus();
        await page.keyboard.down("Enter");
        await expectPressed(page, "Strike", true);
        await page.keyboard.up("Enter");
        await page.keyboard.down(" ");
        await expectPressed(page, "Strike", true);
        await page.keyboard.up(" ");
        await expectPressed(page, "Strike", false);
        await expectOutput(page, "toggle", "Strike");
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test("a disabled toggle ignores a click", async ({ page }) => {
        // forced: the press must reach the disabled toggle, which then does nothing
        await toggle(page, "Underline").click({ force: true });
        await expectPressed(page, "Underline", false);
        await expectOutput(page, "toggle", "none");
    });

    test("has no axe violation, at rest and pressed", async ({ page }) => {
        await expectNoAxeViolations(page);
        await toggle(page, "Bold").click();
        await expectPressed(page, "Bold", true);
        await expectNoAxeViolations(page);
    });
});

test.describe("toggle / controlled", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/toggle/controlled");
    });

    test("the consumer's pressed state, and a change it refuses", async ({
        page,
    }) => {
        const mute = toggle(page, "Mute");
        await expectPressed(page, "Mute", true);
        await mute.click();
        await expectOutput(page, "requested", "false");
        await expectOutput(page, "pressed", "false");
        await expectPressed(page, "Mute", false);
        await page.getByRole("checkbox", { name: "Locked" }).check();
        await mute.click();
        await expectOutput(page, "requested", "true");
        await expectOutput(page, "pressed", "false");
        await expectPressed(page, "Mute", false);
    });
});
