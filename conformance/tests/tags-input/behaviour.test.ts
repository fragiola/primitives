import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tags-input.md. A tag has no role: it is found by its TagText's text, and its Tag (the
// element that takes the focus) is the TagText's parent (the anatomy).
const textbox = (page: Page, name: string) =>
    page.getByRole("textbox", { name, exact: true });
const tagText = (page: Page, text: string) =>
    page.getByText(text, { exact: true });
const tag = (page: Page, text: string) => tagText(page, text).locator("..");

/** Pastes `text` into the element, as the browser's paste event carries it. */
async function paste(target: Locator, text: string): Promise<void> {
    await target.evaluate((element, pasted) => {
        const data = new DataTransfer();
        data.setData("text/plain", pasted);
        element.dispatchEvent(
            new ClipboardEvent("paste", {
                clipboardData: data,
                bubbles: true,
                cancelable: true,
            }),
        );
    }, text);
}

test.describe("tags-input / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tags-input/basic");
    });

    test("a named textbox after its tags; the tags are out of the tab order", async ({
        page,
    }) => {
        await expect(textbox(page, "Tags")).toBeVisible();
        await expect(tagText(page, "react")).toBeVisible();
        await expect(tagText(page, "vue")).toBeVisible();
        for (const name of ["Remove react", "Remove vue", "Clear tags"]) {
            await expect(page.getByRole("button", { name })).toBeVisible();
        }
        // the hidden inputs are no textbox of the page
        await expect(page.getByRole("textbox")).toHaveCount(1);
        await page.keyboard.press("Tab");
        await expect(textbox(page, "Tags")).toBeFocused();
    });

    test("Enter adds the text; an empty text adds nothing", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.type("angular");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "react,vue,angular");
        await expectOutput(page, "reason", "keyboard");
        await expect(input).toHaveValue("");
        await expect(tagText(page, "angular")).toBeVisible();
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "react,vue,angular");
    });

    test("the delimiter ends a tag; the text after it stays", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.type("svelte,");
        await expectOutput(page, "value", "react,vue,svelte");
        await expectOutput(page, "reason", "input-change");
        await expect(input).toHaveValue("");
        await page.keyboard.type(" solid ,qwik");
        await expectOutput(page, "value", "react,vue,svelte,solid");
        await expect(input).toHaveValue("qwik");
    });

    test("a duplicate is refused and stays in the textbox, trimmed", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.type(" react ");
        await page.keyboard.press("Enter");
        await expectOutput(page, "invalid", "duplicate");
        await expectOutput(page, "value", "none");
        await expect(input).toHaveValue("react");
        await expect(input).toBeFocused();
    });

    test("a refused text is offered again only by a typed delimiter", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        // one input: typed key by key, "react," would already be refused
        await input.fill("react,vue");
        await page.keyboard.press("Enter");
        await expectOutput(page, "invalid", "duplicate");
        await expect(input).toHaveValue("react,vue");
        await page.getByRole("button", { name: "Remove react" }).click();
        await expectOutput(page, "value", "vue");
        await expect(input).toBeFocused();
        await page.keyboard.press("End");
        // a character only changes the text: "react", now no duplicate, is not added
        await page.keyboard.type("x");
        await expect(input).toHaveValue("react,vuex");
        await expectOutput(page, "value", "vue");
        await expectOutput(page, "reason", "chip-remove-press");
        await page.keyboard.type(",");
        await expectOutput(page, "value", "vue,react,vuex");
        await expectOutput(page, "reason", "input-change");
        await expect(input).toHaveValue("");
    });

    test("Backspace at the start focuses the last tag, then removes it", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.press("Backspace");
        await expect(tag(page, "vue")).toBeFocused();
        await expectOutput(page, "value", "none");
        await page.keyboard.press("Backspace");
        await expectOutput(page, "value", "react");
        await expectOutput(page, "reason", "keyboard");
        await expect(tag(page, "react")).toBeFocused();
        await page.keyboard.press("Backspace");
        await expectOutput(page, "value", "none");
        await expect(input).toBeFocused();
        await page.keyboard.type("ab");
        await page.keyboard.press("Backspace");
        await expect(input).toHaveValue("a");
        await expect(input).toBeFocused();
    });

    test("the arrows move between the tags and back to the textbox", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.press("ArrowLeft");
        await expect(tag(page, "vue")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(tag(page, "react")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(tag(page, "react")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(tag(page, "vue")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(input).toBeFocused();
    });

    test("Delete removes toward the end; a character goes to the textbox", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.press("ArrowLeft");
        await page.keyboard.press("ArrowLeft");
        await expect(tag(page, "react")).toBeFocused();
        await page.keyboard.press("Delete");
        await expectOutput(page, "value", "vue");
        await expect(tag(page, "vue")).toBeFocused();
        await page.keyboard.press("x");
        await expect(input).toBeFocused();
        await expect(input).toHaveValue("x");
    });

    test("a remove button removes its tag and focuses the textbox", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Remove react" }).click();
        await expectOutput(page, "value", "vue");
        await expectOutput(page, "reason", "chip-remove-press");
        await expect(textbox(page, "Tags")).toBeFocused();
    });

    test("Clear removes every tag and the text, then hides; axe with tags and empty", async ({
        page,
    }) => {
        await expectNoAxeViolations(page);
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.type("draft");
        await page.getByRole("button", { name: "Clear tags" }).click();
        await expectOutput(page, "value", "none");
        await expectOutput(page, "reason", "clear-press");
        await expect(input).toHaveValue("");
        await expect(input).toBeFocused();
        await expect(
            page.getByRole("button", { name: "Clear tags" }),
        ).toBeHidden();
        await expectNoAxeViolations(page);
    });
});

test.describe("tags-input / basic, right to left", () => {
    test("the previous and next arrows swap", async ({ page }) => {
        await openScenario(page, "/tags-input/basic", { dir: "rtl" });
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.press("ArrowLeft");
        await expect(input).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(tag(page, "vue")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(tag(page, "react")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(tag(page, "vue")).toBeFocused();
        await page.keyboard.press("ArrowLeft");
        await expect(input).toBeFocused();
        await page.keyboard.press("Backspace");
        await expect(tag(page, "vue")).toBeFocused();
    });
});

test.describe("tags-input / options", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tags-input/options");
    });

    test("its own delimiter, and validate", async ({ page }) => {
        const input = textbox(page, "Emails");
        await input.click();
        await page.keyboard.type("ada@example.com;");
        await expectOutput(page, "value", "ada@example.com");
        await page.keyboard.type("a,b");
        await expect(input).toHaveValue("a,b");
        await page.keyboard.press("Enter");
        await expectOutput(page, "invalid", "invalid a,b");
        await expect(input).toHaveValue("a,b");
    });

    test("a paste with the delimiter adds its parts, up to max", async ({
        page,
    }) => {
        const input = textbox(page, "Emails");
        await input.click();
        await page.keyboard.type("ada@example.com;");
        await paste(input, "bob@example.com; cy@example.com; dee@example.com");
        await expectOutput(
            page,
            "value",
            "ada@example.com,bob@example.com,cy@example.com",
        );
        await expectOutput(page, "reason", "input-paste");
        await expectOutput(page, "invalid", "max dee@example.com");
        await expect(input).toHaveValue("dee@example.com");
        await expectNoAxeViolations(page);
    });
});

test.describe("tags-input / edit", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tags-input/edit");
    });

    const editor = (page: Page) => textbox(page, "Edit tag");

    test("Enter edits a tag in place, Enter commits it", async ({ page }) => {
        await expect(editor(page)).toHaveCount(0);
        await tagText(page, "two").click();
        await expect(tag(page, "two")).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(editor(page)).toBeFocused();
        await expect(editor(page)).toHaveValue("two");
        expect(
            await editor(page).evaluate((input) => {
                const field = input as HTMLInputElement;
                return [field.selectionStart, field.selectionEnd];
            }),
        ).toEqual([0, 3]);
        await expect(
            page.getByRole("button", { name: "Remove two" }),
        ).toBeHidden();
        await page.keyboard.type("deux");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "one,deux,three");
        await expectOutput(page, "reason", "keyboard");
        await expect(tag(page, "deux")).toBeFocused();
        await expect(editor(page)).toHaveCount(0);
    });

    test("a double press edits; Escape drops the edit", async ({ page }) => {
        await tagText(page, "one").dblclick();
        await expect(editor(page)).toBeFocused();
        await page.keyboard.type("uno");
        await page.keyboard.press("Escape");
        await expect(tag(page, "one")).toBeFocused();
        await expectOutput(page, "value", "none");
    });

    test("a double press inside the edit keeps its text", async ({ page }) => {
        await tagText(page, "one").dblclick();
        await page.keyboard.type("uno");
        await editor(page).dblclick();
        await expect(editor(page)).toBeFocused();
        await expect(editor(page)).toHaveValue("uno");
        await page.keyboard.press("End");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "uno,two,three");
    });

    test("an edit follows its tag through the removal of another", async ({
        page,
    }) => {
        await tagText(page, "two").click();
        await page.keyboard.press("Enter");
        await page.keyboard.type("deux");
        await page.getByRole("button", { name: "Remove one" }).click();
        // the edit of "two" ends by the blur, on "two", not on the tag now at its place
        await expectOutput(page, "value", "deux,three");
        await expectOutput(page, "reason", "input-blur");
        await expect(editor(page)).toHaveCount(0);
        await expect(textbox(page, "Tags")).toBeFocused();
        await expect(tagText(page, "three")).toBeVisible();
    });

    test("a refused edit goes on; an empty edit removes the tag", async ({
        page,
    }) => {
        await tagText(page, "three").click();
        await page.keyboard.press("Enter");
        await page.keyboard.type("one");
        await page.keyboard.press("Enter");
        await expectOutput(page, "invalid", "duplicate");
        await expect(editor(page)).toBeFocused();
        await page.keyboard.press("Escape");
        await tagText(page, "two").click();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Backspace");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "one,three");
        await expect(tag(page, "three")).toBeFocused();
    });

    test("leaving the edit commits it; axe while editing", async ({ page }) => {
        await tagText(page, "one").click();
        await page.keyboard.press("Enter");
        await expectNoAxeViolations(page);
        await page.keyboard.type("uno");
        await page.getByRole("button", { name: "After" }).click();
        await expectOutput(page, "value", "uno,two,three");
        await expectOutput(page, "reason", "input-blur");
        await expect(editor(page)).toHaveCount(0);
    });
});

test.describe("tags-input / blur", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tags-input/blur");
    });

    test('"add" adds the text when the focus leaves', async ({ page }) => {
        const input = textbox(page, "Add on blur");
        await input.click();
        await page.keyboard.type("draft");
        await page.keyboard.press("Tab");
        await expectOutput(page, "add", "draft");
        await expectOutput(page, "add-reason", "input-blur");
        await expect(input).toHaveValue("");
    });

    test('"clear" empties it', async ({ page }) => {
        const input = textbox(page, "Clear on blur");
        await input.click();
        await page.keyboard.type("draft");
        await page.keyboard.press("Tab");
        await expect(input).toHaveValue("");
        await expectOutput(page, "clear", "none");
    });

    test("by default, it stays", async ({ page }) => {
        const input = textbox(page, "Keep on blur");
        await input.click();
        await page.keyboard.type("draft");
        await page.keyboard.press("Tab");
        await expect(input).not.toBeFocused();
        await expect(input).toHaveValue("draft");
    });
});

test.describe("tags-input / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tags-input/field");
    });

    test("labelled and described; the hidden inputs are not in the tree", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await expect(input).toHaveAccessibleDescription(
            "Press Enter to add a tag.",
        );
        await expect(input).not.toHaveAttribute("aria-invalid");
        await expect(page.getByRole("textbox")).toHaveCount(2);
        await expectNoAxeViolations(page);
    });

    test("a required, empty TagsInput blocks the submission and takes the focus", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        const input = textbox(page, "Tags");
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByText("Add at least one tag.")).toBeVisible();
        await expectNoAxeViolations(page);
    });

    test("Enter adds, then submits from an empty text; one entry per tag", async ({
        page,
    }) => {
        const input = textbox(page, "Tags");
        await input.click();
        await page.keyboard.type("alpha");
        await page.keyboard.press("Enter");
        await expectSubmitted(page, "none");
        await expect(tagText(page, "alpha")).toBeVisible();
        await page.keyboard.press("Enter");
        await expectSubmitted(page, "tags=alpha&labels=bug");
        await textbox(page, "Labels").click();
        await page.keyboard.type("beta");
        await page.keyboard.press("Enter");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "tags=alpha&labels=bug&labels=beta");
    });

    test("a reset returns the tags and the text to their defaults", async ({
        page,
    }) => {
        await textbox(page, "Tags").click();
        await page.keyboard.type("alpha");
        await page.keyboard.press("Enter");
        await textbox(page, "Labels").click();
        await page.keyboard.type("beta");
        await page.keyboard.press("Enter");
        await page.keyboard.type("draft");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(tagText(page, "alpha")).toHaveCount(0);
        await expect(tagText(page, "beta")).toHaveCount(0);
        await expect(tagText(page, "bug")).toBeVisible();
        await expect(textbox(page, "Labels")).toHaveValue("");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
    });
});
