import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { part } from "../../src/contract.ts";
import {
    dropFiles,
    inputFileNames,
    opensNoChooser,
    pasteFiles,
    pickFiles,
} from "../../src/files.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/file-upload.md, "Scenarios"
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const hiddenInput = (page: Page) => part(page, "file-upload", "hidden-input");
/** Whether a `fetch` of an object URL still reads it (a revoked one fails). */
const readable = (page: Page, url: string) =>
    page.evaluate(
        (src) =>
            fetch(src).then(
                () => true,
                () => false,
            ),
        url,
    );

test.describe("file-upload / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/file-upload/basic");
    });

    test("a named group, its buttons and the hidden file input", async ({
        page,
    }) => {
        await expect(
            page.getByRole("group", { name: "Attachments" }),
        ).toBeVisible();
        await expect(button(page, "Drop files here")).toBeVisible();
        await expect(button(page, "Choose files")).toBeVisible();
        const input = hiddenInput(page);
        await expect(input).toHaveAttribute("type", "file");
        await expect(input).toHaveAttribute("multiple", "");
        await expect(input).toHaveAttribute("accept", "image/*,.pdf");
        await expect(input).toHaveAttribute("tabindex", "-1");
        await expect(input).toHaveAttribute("aria-hidden", "true");
        await expect(part(page, "file-upload", "clear-trigger")).toBeHidden();
        await expect(part(page, "file-upload", "root")).toHaveAttribute(
            "data-empty",
            "",
        );
        await expectNoAxeViolations(page);
    });

    test("picks, rejections, deletions, paste and clearing", async ({
        page,
    }) => {
        const dropzone = button(page, "Drop files here");
        await dropFiles(dropzone, [
            { name: "photo.png", size: 1500 },
            { name: "notes.txt", size: 10 },
            { name: "big.png", size: 2_000_000 },
            { name: "my scan.pdf", size: 100 },
        ]);
        await expectOutput(page, "value", "photo.png");
        await expectOutput(page, "reason", "drop");
        await expectOutput(
            page,
            "rejected",
            "notes.txt (invalid-type); big.png (too-large); my scan.pdf (name-has-spaces)",
        );
        const photo = page
            .getByTestId("accepted")
            .getByRole("listitem")
            .filter({ hasText: "photo.png" });
        await expect(photo).toContainText("1.5 kB");
        const image = photo.locator("img");
        await expect(image).toHaveAttribute("src", /^blob:/);
        await expect
            .poll(() =>
                image.evaluate(
                    (element) => (element as HTMLImageElement).naturalWidth,
                ),
            )
            .toBe(2);
        await expect(part(page, "file-upload", "announcer")).toHaveText(
            "1 files, 3 rejected",
        );
        expect(await inputFileNames(hiddenInput(page))).toEqual(["photo.png"]);
        await expectNoAxeViolations(page);

        const chooser = await pickFiles(
            page,
            () => button(page, "Choose files").click(),
            [{ name: "a.pdf" }, { name: "b.png" }, { name: "c.png" }],
        );
        expect(chooser.isMultiple()).toBe(true);
        await expectOutput(page, "value", "photo.png, a.pdf, b.png");
        await expectOutput(page, "reason", "input-change");
        await expectOutput(page, "rejected", "c.png (too-many)");
        expect(await inputFileNames(hiddenInput(page))).toEqual([
            "photo.png",
            "a.pdf",
            "b.png",
        ]);

        const bSource = await page
            .getByTestId("accepted")
            .getByRole("listitem")
            .filter({ hasText: "b.png" })
            .locator("img")
            .getAttribute("src");
        await button(page, "Remove a.pdf").click();
        await expectOutput(page, "value", "photo.png, b.png");
        await expectOutput(page, "reason", "delete-press");
        await expect(button(page, "Remove b.png")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "photo.png");
        await expect(button(page, "Remove photo.png")).toBeFocused();
        expect(bSource).toMatch(/^blob:/);
        expect(await readable(page, bSource ?? "")).toBe(false);

        await button(page, "Dismiss c.png").click();
        await expectOutput(page, "rejected", "none");
        await expectOutput(page, "value", "photo.png");

        await dropzone.focus();
        await pasteFiles(dropzone, [{ name: "d.png" }]);
        await expectOutput(page, "value", "photo.png, d.png");
        await expectOutput(page, "reason", "input-paste");
        await pickFiles(page, () => page.keyboard.press("Enter"), [
            { name: "e.png" },
        ]);
        await expectOutput(page, "value", "photo.png, d.png, e.png");

        await button(page, "Clear all").click();
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "clear-press");
        await expect(part(page, "file-upload", "clear-trigger")).toBeHidden();
        await expect(button(page, "Choose files")).toBeFocused();
        expect(await inputFileNames(hiddenInput(page))).toEqual([]);
        await expectNoAxeViolations(page);
    });

    test("the Label opens the dialog", async ({ page }) => {
        await pickFiles(page, () => page.getByText("Attachments").click(), [
            { name: "a.png" },
        ]);
        await expectOutput(page, "value", "a.png");
    });
});

test.describe("file-upload / single", () => {
    test("a new file replaces the file; several are rejected", async ({
        page,
    }) => {
        await openScenario(page, "/file-upload/single");
        await expect(hiddenInput(page)).not.toHaveAttribute("multiple");
        const dropzone = button(page, "Drop an image");
        await dropFiles(dropzone, [{ name: "a.png" }]);
        await expectOutput(page, "value", "a.png");
        const preview = page.getByRole("img", { name: "Avatar preview" });
        await expect(preview).toHaveAttribute("src", /^blob:/);
        const aSource = (await preview.getAttribute("src")) ?? "";
        await dropFiles(dropzone, [{ name: "b.png" }]);
        await expectOutput(page, "value", "b.png");
        await expect(preview).not.toHaveAttribute("src", aSource);
        expect(await readable(page, aSource)).toBe(false);
        await dropFiles(dropzone, [{ name: "c.png" }, { name: "d.png" }]);
        await expectOutput(
            page,
            "rejected",
            "c.png (too-many); d.png (too-many)",
        );
        await expectOutput(page, "value", "b.png");
        await expectNoAxeViolations(page);
    });
});

test.describe("file-upload / form", () => {
    test("required, the native submission of the assigned files, and reset", async ({
        page,
    }) => {
        await openScenario(page, "/file-upload/form");
        const root = part(page, "file-upload", "root");
        const label = page.getByText("Documents", { exact: true });
        const inputId = await hiddenInput(page).getAttribute("id");
        await expect(label).toHaveAttribute("for", inputId ?? "");
        await expect(
            page.getByRole("group", { name: "Documents" }),
        ).toBeVisible();

        await button(page, "Send").click();
        await expect(page.getByText("Add at least one document")).toBeVisible();
        await expect(button(page, "Choose documents")).toBeFocused();
        await expect(root).toHaveAttribute("aria-invalid", "true");
        await expect(root).toHaveAttribute("data-invalid", "");
        await expectOutput(page, "submitted", "none");

        await dropFiles(button(page, "Drop documents"), [
            { name: "a.pdf", size: 100 },
            { name: "b.png", size: 2000 },
        ]);
        await expectOutput(page, "value", "a.pdf, b.png");
        await button(page, "Send").click();
        await expectOutput(page, "submitted", "a.pdf:100, b.png:2000");
        await expect(page.getByText("Add at least one document")).toBeHidden();
        await expectNoAxeViolations(page);

        await button(page, "Reset").click();
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "none");
        expect(await inputFileNames(hiddenInput(page))).toEqual([]);
        await button(page, "Send").click();
        await expect(page.getByText("Add at least one document")).toBeVisible();
    });
});

test.describe("file-upload / disabled", () => {
    test("no press, no tab stop, no drop", async ({ page }) => {
        await openScenario(page, "/file-upload/disabled");
        await expect(button(page, "Choose files")).toBeDisabled();
        await expect(hiddenInput(page)).toBeDisabled();
        const dropzone = button(page, "Drop files here");
        await expect(dropzone).toHaveAttribute("aria-disabled", "true");
        await expect(dropzone).not.toHaveAttribute("tabindex");
        await expect(part(page, "file-upload", "root")).toHaveAttribute(
            "data-disabled",
            "",
        );
        await dropFiles(dropzone, [{ name: "a.png" }]);
        expect(
            await opensNoChooser(page, () => dropzone.click({ force: true })),
        ).toBe(true);
        await expectOutput(page, "value", "none");
        await expectNoAxeViolations(page);
    });
});
