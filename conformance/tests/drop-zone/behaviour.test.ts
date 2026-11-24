import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { part } from "../../src/contract.ts";
import {
    dispatchFileDrag,
    dropFiles,
    opensNoChooser,
    pasteFiles,
    pickFiles,
} from "../../src/files.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/drop-zone.md, "Scenarios": the files are built in the page, the dialog is Playwright's
// file chooser
const NAME = "Drop images or PDFs here, or press to choose";
const zone = (page: Page) => page.getByRole("button", { name: NAME });

test.describe("drop-zone / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/drop-zone/basic");
    });

    test("a button, a tab stop, and an empty polite region", async ({
        page,
    }) => {
        await expect(zone(page)).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(zone(page)).toBeFocused();
        const announcer = part(page, "drop-zone", "announcer");
        await expect(announcer).toHaveAttribute("aria-live", "polite");
        await expect(announcer).toHaveText("");
        await expectNoAxeViolations(page);
    });

    test("a drag of files is a drop target, across the Root's children", async ({
        page,
    }) => {
        const child = zone(page).locator("span").first();
        await dispatchFileDrag(
            zone(page),
            ["dragenter", "dragover"],
            [{ name: "photo.png" }],
        );
        await expect(zone(page)).toHaveAttribute("data-drop-target", "");
        await expectOutput(page, "dropTarget", "true");
        await expectNoAxeViolations(page);
        await dispatchFileDrag(child, ["dragenter"], [{ name: "photo.png" }]);
        await dispatchFileDrag(
            zone(page),
            ["dragleave"],
            [{ name: "photo.png" }],
        );
        await expect(zone(page)).toHaveAttribute("data-drop-target", "");
        await dispatchFileDrag(child, ["dragleave"], [{ name: "photo.png" }]);
        await expect(zone(page)).not.toHaveAttribute("data-drop-target");
        await expectOutput(page, "dropTarget", "false");
    });

    test("a drop takes the accepted files, rejects the others and announces", async ({
        page,
    }) => {
        const prevented = await dropFiles(zone(page), [
            { name: "photo.png", size: 1500 },
            { name: "notes.txt", size: 10 },
            { name: "scan.PDF", size: 100, type: "application/pdf" },
        ]);
        expect(prevented).toBe(true);
        await expectOutput(page, "accepted", "photo.png, scan.PDF");
        await expectOutput(page, "rejected", "notes.txt");
        await expectOutput(page, "reason", "drop");
        await expect(zone(page)).not.toHaveAttribute("data-drop-target");
        await expect(part(page, "drop-zone", "announcer")).toHaveText(
            "2 accepted, 1 rejected",
        );
    });

    test("a drag of text is no drop target", async ({ page }) => {
        const prevented = await dispatchFileDrag(
            zone(page),
            ["dragenter", "dragover"],
            [],
            "text",
        );
        expect(prevented).toBe(false);
        await expect(zone(page)).not.toHaveAttribute("data-drop-target");
    });

    test("Enter, Space and a click open the file dialog", async ({ page }) => {
        await zone(page).focus();
        const chooser = await pickFiles(
            page,
            () => page.keyboard.press("Enter"),
            [{ name: "a.png" }],
        );
        expect(chooser.isMultiple()).toBe(true);
        expect(
            await chooser
                .element()
                .evaluate((input) =>
                    (input as HTMLInputElement).getAttribute("accept"),
                ),
        ).toBe("image/*,.pdf");
        await expectOutput(page, "accepted", "a.png");
        await expectOutput(page, "reason", "input-change");
        await expect(zone(page)).toBeFocused();

        await pickFiles(page, () => page.keyboard.press("Space"), [
            { name: "b.pdf" },
        ]);
        await expectOutput(page, "accepted", "b.pdf");
        await pickFiles(page, () => zone(page).click(), [{ name: "c.png" }]);
        await expectOutput(page, "accepted", "c.png");
    });

    test("a paste of files on the focused Root takes them, a paste of text nothing", async ({
        page,
    }) => {
        await zone(page).focus();
        await pasteFiles(zone(page), [{ name: "b.png" }]);
        await expectOutput(page, "accepted", "b.png");
        await expectOutput(page, "reason", "input-paste");
        await pasteFiles(zone(page), []);
        await page.waitForTimeout(100);
        await expectOutput(page, "accepted", "b.png");
        await expect(part(page, "drop-zone", "announcer")).toHaveText(
            "1 accepted, 0 rejected",
        );
    });
});

test.describe("drop-zone / single", () => {
    test("a drop of several files rejects them all; one is taken", async ({
        page,
    }) => {
        await openScenario(page, "/drop-zone/single");
        await dropFiles(zone(page), [{ name: "a.png" }, { name: "b.png" }]);
        await expectOutput(page, "accepted", "none");
        await expectOutput(page, "rejected", "a.png, b.png");
        await dropFiles(zone(page), [{ name: "c.png" }]);
        await expectOutput(page, "accepted", "c.png");
        await zone(page).focus();
        const chooser = await pickFiles(
            page,
            () => page.keyboard.press("Enter"),
            [{ name: "d.png" }],
        );
        expect(chooser.isMultiple()).toBe(false);
        await expectOutput(page, "accepted", "d.png");
    });
});

test.describe("drop-zone / disabled", () => {
    test("takes no drag, drop or press, and is no tab stop", async ({
        page,
    }) => {
        await openScenario(page, "/drop-zone/disabled");
        await expect(zone(page)).toHaveAttribute("aria-disabled", "true");
        await expect(zone(page)).toHaveAttribute("data-disabled", "");
        await expect(zone(page)).not.toHaveAttribute("tabindex");
        await page.keyboard.press("Tab");
        await expect(zone(page)).not.toBeFocused();
        await dispatchFileDrag(
            zone(page),
            ["dragenter", "dragover"],
            [{ name: "a.png" }],
        );
        await expect(zone(page)).not.toHaveAttribute("data-drop-target");
        // the drop is canceled (the browser would open the file) and reports nothing
        expect(await dropFiles(zone(page), [{ name: "a.png" }])).toBe(true);
        expect(
            await opensNoChooser(page, () => zone(page).click({ force: true })),
        ).toBe(true);
        await expectOutput(page, "accepted", "none");
        await expectNoAxeViolations(page);
    });
});
