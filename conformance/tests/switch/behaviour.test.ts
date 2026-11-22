import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/switch.md
const toggle = (page: Page, name: string) =>
    page.getByRole("switch", { name, exact: true });

const expectOn = (page: Page, name: string, on: boolean) =>
    expect(toggle(page, name)).toHaveAttribute("aria-checked", String(on));

test.describe("switch / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/switch/basic");
    });

    test("five named switches, no hidden input in the tree", async ({
        page,
    }) => {
        await expect(page.getByRole("switch")).toHaveCount(5);
        await expectOn(page, "Wi-Fi", true);
        await expectOn(page, "Bluetooth", false);
        await expect(toggle(page, "Accept terms")).toHaveAttribute(
            "aria-required",
            "true",
        );
        await expect(toggle(page, "Location")).toHaveAttribute(
            "aria-readonly",
            "true",
        );
        await expect(toggle(page, "Airplane mode")).toBeDisabled();
    });

    test("a click on the switch or its label toggles it", async ({ page }) => {
        await toggle(page, "Wi-Fi").click();
        await expectOn(page, "Wi-Fi", false);
        await expectOutput(page, "wifi", "false");
        await page.getByText("Wi-Fi", { exact: true }).click();
        await expectOn(page, "Wi-Fi", true);
        await expectOutput(page, "wifi", "true");
    });

    test("Space and Enter toggle", async ({ page }) => {
        await toggle(page, "Wi-Fi").focus();
        await page.keyboard.press("Space");
        await expectOn(page, "Wi-Fi", false);
        await page.keyboard.press("Enter");
        await expectOn(page, "Wi-Fi", true);
        await expectOutput(page, "wifi", "true");
    });

    test("required blocks the submission and focuses it; on, the form submits every switch", async ({
        page,
    }) => {
        const submit = page.getByRole("button", { name: "Submit" });
        await submit.click();
        await expectSubmitted(page, "none");
        await expect(toggle(page, "Accept terms")).toBeFocused();
        await toggle(page, "Accept terms").click();
        await submit.click();
        await expectSubmitted(
            page,
            "wifi=on&bluetooth=no&terms=on&location=on",
        );
        await toggle(page, "Bluetooth").click();
        await submit.click();
        await expectSubmitted(
            page,
            "wifi=on&bluetooth=yes&terms=on&location=on",
        );
    });

    test("a read-only switch ignores a click, Space and Enter", async ({
        page,
    }) => {
        const location = toggle(page, "Location");
        await location.click();
        await expectOn(page, "Location", true);
        await location.focus();
        await expect(location).toBeFocused();
        await page.keyboard.press("Space");
        await page.keyboard.press("Enter");
        await expectOn(page, "Location", true);
    });

    test("a form reset returns every switch to its default", async ({
        page,
    }) => {
        await toggle(page, "Wi-Fi").click();
        await toggle(page, "Bluetooth").click();
        await toggle(page, "Accept terms").click();
        await expectOn(page, "Accept terms", true);
        await page.getByRole("button", { name: "Reset" }).click();
        await expectOn(page, "Wi-Fi", true);
        await expectOn(page, "Bluetooth", false);
        await expectOn(page, "Accept terms", false);
        await expectOn(page, "Location", true);
    });

    test("a disabled switch ignores clicks", async ({ page }) => {
        // forced: the press must reach the disabled switch's label, which then does nothing
        await page.getByText("Airplane mode").click({ force: true });
        await toggle(page, "Airplane mode").click({ force: true });
        await expectOn(page, "Airplane mode", false);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test("switch / controlled: an off the consumer refuses stays on", async ({
    page,
}) => {
    await openScenario(page, "/switch/controlled");
    const dark = toggle(page, "Dark mode");
    await expect(dark).toHaveAttribute("aria-checked", "true");
    await dark.click();
    await expectOutput(page, "requested", "false");
    await expect(dark).toHaveAttribute("aria-checked", "true");
    await expectOutput(page, "checked", "true");
    await dark.focus();
    await page.keyboard.press("Space");
    await expect(dark).toHaveAttribute("aria-checked", "true");
    await expectOutput(page, "checked", "true");
});
