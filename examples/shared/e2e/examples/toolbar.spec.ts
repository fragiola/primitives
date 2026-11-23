import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// toolbar: a text-format toolbar (spec/toolbar.md). A Toolbar "Text formatting" holding a
// multiple ToggleGroup "Text style" (Bold, Italic, Underline), a separator, a ToggleGroup
// "Alignment" (Left pressed, Center, Right), a separator, a button "Clear" and an input "Font
// size" (16); a paragraph shows the formatting (`data-bold`, `data-italic`, `data-underline`,
// `data-align`, its font size).

const ITEMS = [
    "Bold",
    "Italic",
    "Underline",
    "Left",
    "Center",
    "Right",
    "Clear",
] as const;

test("the toolbar's parts: groups, separators, and one tab stop", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "toolbar" });
    const toolbar = frame.getByRole("toolbar", { name: "Text formatting" });
    await expect(toolbar).toHaveAttribute(
        "data-primitives-part",
        "toolbar-root",
    );
    await expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    const textStyle = toolbar.getByRole("group", { name: "Text style" });
    const alignment = toolbar.getByRole("group", { name: "Alignment" });
    await expect(textStyle.getByRole("button")).toHaveCount(3);
    await expect(alignment.getByRole("button")).toHaveCount(3);
    // a ToggleGroup in a Toolbar takes the toolbar's orientation
    await expect(textStyle).toHaveAttribute("data-orientation", "horizontal");
    const separators = toolbar.getByRole("separator");
    await expect(separators).toHaveCount(2);
    await expect(separators.first()).toHaveAttribute(
        "aria-orientation",
        "vertical",
    );
    await expect(toolbar.getByRole("button", { name: "Left" })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    await expect(
        toolbar.getByRole("textbox", { name: "Font size" }),
    ).toHaveValue("16");
    // the whole toolbar, nested toggles included, is one tab stop
    await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(toolbar.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "tabindex",
        "0",
    );
    expect(errors).toEqual([]);
});

test("the arrows move through every item in order; the input keeps its caret keys", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "toolbar" });
    const toolbar = frame.getByRole("toolbar", { name: "Text formatting" });
    const item = (name: string) => toolbar.getByRole("button", { name });
    const input = toolbar.getByRole("textbox", { name: "Font size" });
    await item("Bold").focus();
    for (const name of ITEMS.slice(1)) {
        await page.keyboard.press("ArrowRight");
        await expect(item(name)).toBeFocused();
    }
    await page.keyboard.press("ArrowRight");
    await expect(input).toBeFocused();
    // reached by the toolbar's keys: its whole text is selected
    expect(
        await input.evaluate(
            (element: HTMLInputElement) =>
                (element.selectionEnd ?? 0) - (element.selectionStart ?? 0),
        ),
    ).toBe(2);
    // the first ArrowRight collapses the selection, the next (caret at the end) wraps to Bold
    await page.keyboard.press("ArrowRight");
    await expect(input).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(item("Bold")).toBeFocused();
    // back: the first ArrowLeft collapses the selection to the start, the next leaves
    await page.keyboard.press("ArrowLeft");
    await expect(input).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(input).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(item("Clear")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(item("Bold")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(item("Bold")).toBeFocused();
    await page.keyboard.press("End");
    await expect(input).toBeFocused();
    // the arrows moved no value
    await expect(item("Bold")).toHaveAttribute("aria-pressed", "false");
    await expect(item("Left")).toHaveAttribute("aria-pressed", "true");
    await item("Center").focus();
    await expect(toolbar.locator('[tabindex="0"]')).toHaveCount(1);
    await expect(item("Center")).toHaveAttribute("tabindex", "0");
});

test("the toggles format the paragraph, Clear resets it, the font size applies", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "toolbar" });
    const toolbar = frame.getByRole("toolbar", { name: "Text formatting" });
    const item = (name: string) => toolbar.getByRole("button", { name });
    const preview = frame.locator("p[data-align]");
    await expect(preview).toHaveAttribute("data-align", "left");
    await expect(preview).not.toHaveAttribute("data-bold");

    await item("Bold").click();
    await item("Italic").click();
    await expect(item("Bold")).toHaveAttribute("aria-pressed", "true");
    await expect(item("Italic")).toHaveAttribute("aria-pressed", "true");
    await expect(preview).toHaveAttribute("data-bold");
    await expect(preview).toHaveAttribute("data-italic");
    await item("Underline").focus();
    await page.keyboard.press("Space");
    await expect(preview).toHaveAttribute("data-underline");
    await item("Bold").click();
    await expect(item("Bold")).toHaveAttribute("aria-pressed", "false");
    await expect(item("Italic")).toHaveAttribute("aria-pressed", "true");
    await expect(preview).not.toHaveAttribute("data-bold");

    await item("Center").click();
    await expect(item("Center")).toHaveAttribute("aria-pressed", "true");
    await expect(item("Left")).toHaveAttribute("aria-pressed", "false");
    await expect(preview).toHaveAttribute("data-align", "center");

    const input = toolbar.getByRole("textbox", { name: "Font size" });
    await input.fill("24");
    await expect(preview).toHaveCSS("font-size", "24px");

    await item("Clear").click();
    await expect(item("Italic")).toHaveAttribute("aria-pressed", "false");
    await expect(item("Left")).toHaveAttribute("aria-pressed", "true");
    await expect(input).toHaveValue("16");
    await expect(preview).toHaveAttribute("data-align", "left");
    await expect(preview).not.toHaveAttribute("data-italic");
    await expect(preview).toHaveCSS("font-size", "16px");
    expect(errors).toEqual([]);
});

test("axe finds no violation, at rest and formatted", async ({ page }) => {
    requireExamples("toolbar");
    await page.goto(`${EMBED_BASE}?id=toolbar`);
    await expect(page.getByRole("toolbar")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Bold" }).click();
    await page.getByRole("button", { name: "Right" }).click();
    await expect(page.getByRole("button", { name: "Bold" })).toHaveAttribute(
        "aria-pressed",
        "true",
    );
    expect(await axeViolations(page)).toEqual([]);
});
