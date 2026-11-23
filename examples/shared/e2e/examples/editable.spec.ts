import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// editable: an inline-editable title (spec/editable.md). A `<label for="document-title">`
// "Document title" and an Editable (`defaultValue` "Quarterly report", the default modes) whose
// Area holds its Preview and Input, then its triggers "Rename" (a pencil), "Save" (a check) and
// "Cancel" (a cross); a status: empty, "Saved “<title>”." after a commit, "Edit cancelled." after a
// revert.

test("the pencil edits; Enter saves and the focus returns to it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "editable" });
    const preview = frame.locator(part("editable-preview"));
    await expect(preview).toHaveText("Quarterly report");
    await expect(frame.getByRole("textbox")).toHaveCount(0);

    await frame.getByRole("button", { name: "Rename" }).click();
    const input = frame.getByRole("textbox", { name: "Document title" });
    await expect(input).toBeFocused();
    await page.keyboard.type("Annual report");
    await page.keyboard.press("Enter");
    await expect(frame.getByRole("status")).toHaveText(
        "Saved “Annual report”.",
    );
    await expect(preview).toHaveText("Annual report");
    await expect(frame.getByRole("button", { name: "Rename" })).toBeFocused();
    expect(errors).toEqual([]);
});

test("a focus on the title edits; Escape and Cancel put it back", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "editable" });
    const preview = frame.locator(part("editable-preview"));
    await preview.focus();
    const input = frame.getByRole("textbox", { name: "Document title" });
    await expect(input).toBeFocused();
    await page.keyboard.type("Draft");
    await page.keyboard.press("Escape");
    await expect(frame.getByRole("status")).toHaveText("Edit cancelled.");
    await expect(preview).toHaveText("Quarterly report");

    await frame.getByRole("button", { name: "Rename" }).click();
    await page.keyboard.type("Memo");
    await frame.getByRole("button", { name: "Cancel" }).click();
    await expect(preview).toHaveText("Quarterly report");
    await frame.getByRole("button", { name: "Rename" }).click();
    await page.keyboard.type("Memo");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(preview).toHaveText("Memo");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("editable");
    await page.goto(`${EMBED_BASE}?id=editable`);
    await expect(page.getByRole("button", { name: "Rename" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
