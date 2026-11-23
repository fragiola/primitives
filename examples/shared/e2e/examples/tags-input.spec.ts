import { expect, type FrameLocator, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// tags-input: email recipients (spec/tags-input.md). A `<label for="recipients">` "To" and a
// TagsInput (`validate`: an email address; `editable`; `blurBehavior="add"`) holding
// "ada@example.com" and "grace@example.com" at first: a Control with one Tag per recipient (a
// TagText with the address, a TagInput "Edit recipient", a TagRemove "Remove <address>", text
// "×") then the Input (`id="recipients"`), and a ClearTrigger "Clear recipients" (text "×") after
// the Control. Under it, a status: empty, "<text> is not an email address." or "<text> is already
// a recipient." after a refusal, emptied by the next change of the recipients.

/** A recipient's Tag, found by its TagText. */
const tagOf = (frame: FrameLocator, email: string) =>
    frame.locator(part("tags-input-tag"), {
        has: frame.locator(part("tags-input-tag-text"), { hasText: email }),
    });

const texts = (frame: FrameLocator) =>
    frame.locator(part("tags-input-tag-text")).allTextContents();

test("Enter and a comma add an address; a refused text stays and is explained", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "tags-input" });
    const input = frame.getByRole("textbox", { name: "To" });
    const status = frame.getByRole("status");
    await expect(input).toHaveAttribute(
        "data-primitives-part",
        "tags-input-input",
    );
    expect(await texts(frame)).toEqual([
        "ada@example.com",
        "grace@example.com",
    ]);
    await expect(
        frame.getByRole("button", { name: "Remove ada@example.com" }),
    ).toBeVisible();
    await expect(
        frame.getByRole("button", { name: "Clear recipients" }),
    ).toBeVisible();
    // the TagInputs are hidden until a tag is edited
    await expect(
        frame.getByRole("textbox", { name: "Edit recipient" }),
    ).toHaveCount(0);

    await input.click();
    await page.keyboard.type("alan@example.com");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("");
    expect(await texts(frame)).toEqual([
        "ada@example.com",
        "grace@example.com",
        "alan@example.com",
    ]);

    await page.keyboard.type("nope");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("nope");
    await expect(status).toHaveText("nope is not an email address.");
    await input.fill("");

    await page.keyboard.type("ada@example.com,");
    await expect(input).toHaveValue("ada@example.com");
    await expect(status).toHaveText("ada@example.com is already a recipient.");
    await input.fill("");

    await page.keyboard.type("linus@example.com,");
    await expect(input).toHaveValue("");
    await expect(status).toHaveText("");
    expect(await texts(frame)).toHaveLength(4);
    expect(errors).toEqual([]);
});

test("Backspace reaches the last recipient and removes it; the arrows move between them", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "tags-input" });
    const input = frame.getByRole("textbox", { name: "To" });
    await input.click();
    await page.keyboard.press("Backspace");
    await expect(tagOf(frame, "grace@example.com")).toBeFocused();
    expect(await texts(frame)).toHaveLength(2);
    await page.keyboard.press("ArrowLeft");
    await expect(tagOf(frame, "ada@example.com")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(input).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("Backspace");
    expect(await texts(frame)).toEqual(["ada@example.com"]);
    await expect(tagOf(frame, "ada@example.com")).toBeFocused();
    // a printable character goes back to the field
    await page.keyboard.type("b");
    await expect(input).toBeFocused();
    await expect(input).toHaveValue("b");
});

test("a double press edits a recipient; a remove button and Clear drop them", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "tags-input" });
    const input = frame.getByRole("textbox", { name: "To" });

    await tagOf(frame, "grace@example.com").dblclick();
    const edit = frame.getByRole("textbox", { name: "Edit recipient" });
    await expect(edit).toBeFocused();
    await expect(edit).toHaveValue("grace@example.com");
    await expect(tagOf(frame, "grace@example.com")).toHaveAttribute(
        "data-editing",
        "",
    );
    await edit.fill("grace@example.org");
    await page.keyboard.press("Enter");
    await expect(tagOf(frame, "grace@example.org")).toBeFocused();
    expect(await texts(frame)).toEqual([
        "ada@example.com",
        "grace@example.org",
    ]);

    await frame.getByRole("button", { name: "Remove ada@example.com" }).click();
    expect(await texts(frame)).toEqual(["grace@example.org"]);
    await expect(input).toBeFocused();

    // leaving the field adds what was typed
    await page.keyboard.type("linus@example.com");
    await input.blur();
    await expect(input).toHaveValue("");
    expect(await texts(frame)).toEqual([
        "grace@example.org",
        "linus@example.com",
    ]);

    const clear = frame.getByRole("button", { name: "Clear recipients" });
    await clear.click();
    expect(await texts(frame)).toEqual([]);
    await expect(input).toBeFocused();
    await expect(clear).toBeHidden();
    await expect(frame.locator(part("tags-input-root"))).toHaveAttribute(
        "data-empty",
        "",
    );
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("tags-input");
    await page.goto(`${EMBED_BASE}?id=tags-input`);
    await expect(page.getByRole("textbox", { name: "To" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
