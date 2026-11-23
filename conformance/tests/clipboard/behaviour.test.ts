import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { part } from "../../src/contract.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/clipboard.md: the test browser may read and write the clipboard
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const COMMAND = "pnpm add @fragiola/primitives";
const copyButton = (page: Page) =>
    page.getByRole("button", { name: "Copy install command" });
const announcer = (page: Page) => part(page, "clipboard", "announcer");
const readClipboard = (page: Page) =>
    page.evaluate(() => navigator.clipboard.readText());

test.describe("clipboard / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/clipboard/basic");
        await page.evaluate(() => navigator.clipboard.writeText(""));
    });

    test("a read-only text, a copy button and an empty polite region", async ({
        page,
    }) => {
        const input = page.getByRole("textbox", { name: "Install command" });
        await expect(input).toHaveValue(COMMAND);
        await expect(input).toHaveAttribute("readonly", "");
        await expect(copyButton(page)).toBeVisible();
        await expect(announcer(page)).toHaveAttribute("aria-live", "polite");
        await expect(announcer(page)).toHaveText("");
        await expectNoAxeViolations(page);
    });

    test("a click copies, announces, and returns to idle after the timeout", async ({
        page,
    }) => {
        await copyButton(page).click();
        await expectOutput(page, "status", "copied");
        await expectOutput(page, "reason", "trigger-press");
        expect(await readClipboard(page)).toBe(COMMAND);
        await expect(announcer(page)).toHaveText("Copied to clipboard");
        await expect(copyButton(page)).toBeFocused();
        await expectNoAxeViolations(page);

        await expectOutput(page, "status", "idle");
        await expectOutput(page, "reason", "none");
        await expect(announcer(page)).toHaveText("");
    });

    test("Enter on the button copies", async ({ page }) => {
        await copyButton(page).focus();
        await page.keyboard.press("Enter");
        await expectOutput(page, "status", "copied");
        expect(await readClipboard(page)).toBe(COMMAND);
    });
});

test.describe("clipboard / failure", () => {
    test.beforeEach(async ({ page }) => {
        // the browser refuses the write, as a denied permission does
        await page.addInitScript(() => {
            Object.defineProperty(navigator.clipboard, "writeText", {
                value: () => Promise.reject(new Error("NotAllowedError")),
            });
        });
        await openScenario(page, "/clipboard/failure");
    });

    test("a refused write fails, announces, and selects the text", async ({
        page,
    }) => {
        await copyButton(page).click();
        await expectOutput(page, "status", "failed");
        await expectOutput(page, "error", "NotAllowedError");
        await expect(announcer(page)).toHaveText(
            "Copy failed: select the text and copy it",
        );
        const input = page.getByRole("textbox", { name: "Install command" });
        await expect(input).toBeFocused();
        expect(
            await input.evaluate((element: HTMLInputElement) => [
                element.selectionStart,
                element.selectionEnd,
            ]),
        ).toEqual([0, COMMAND.length]);

        await expectOutput(page, "status", "idle");
        await expect(announcer(page)).toHaveText("");
    });
});
