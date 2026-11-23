import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/autocomplete.md
const input = (page: Page, name: string) =>
    page.getByRole("combobox", { name, exact: true });
const options = (page: Page) => page.getByRole("option");
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** The highlighted suggestion (`aria-activedescendant`), or none. */
async function expectActive(
    page: Page,
    field: string,
    name: string | null,
): Promise<void> {
    if (name === null) {
        await expect(input(page, field)).not.toHaveAttribute(
            "aria-activedescendant",
            /.+/,
        );
        return;
    }
    const id = await option(page, name).getAttribute("id");
    expect(id).not.toBeNull();
    await expect(input(page, field)).toHaveAttribute(
        "aria-activedescendant",
        id as string,
    );
}

/** The listed suggestions, in order. */
async function expectOptions(
    page: Page,
    names: readonly string[],
): Promise<void> {
    await expect(options(page)).toHaveText(names as string[]);
}

/** The input's text, and the part of it that is selected (the inline completion). */
async function expectText(
    page: Page,
    field: string,
    text: string,
    selected = "",
): Promise<void> {
    await expect(input(page, field)).toHaveValue(text);
    await expect
        .poll(() =>
            input(page, field).evaluate((element) => {
                const box = element as HTMLInputElement;
                return box.value.slice(
                    box.selectionStart ?? 0,
                    box.selectionEnd ?? 0,
                );
            }),
        )
        .toBe(selected);
}

/** Replaces the input's text with `text`, as a user selecting it all and typing. */
async function retype(page: Page, field: string, text: string) {
    await input(page, field).press("ControlOrMeta+a");
    await page.keyboard.type(text);
}

test.describe("autocomplete / basic (list)", () => {
    const field = "Search";
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/autocomplete/basic");
    });

    test("a combobox with list autocomplete; a press on the input opens nothing", async ({
        page,
    }) => {
        await expect(input(page, field)).toHaveAttribute(
            "aria-autocomplete",
            "list",
        );
        await expect(input(page, field)).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        await input(page, field).click();
        await expect(page.getByRole("listbox")).toHaveCount(0);
        await expectOutput(page, "open", "false");
    });

    test("typing opens and filters, highlighting nothing; the arrows highlight, the text stays", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("b");
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "input-change");
        await expectOutput(page, "value", "b");
        await expectOptions(page, ["Banana", "Blueberry"]);
        await expectActive(page, field, null);
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Banana");
        await expectText(page, field, "b");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Blueberry");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, null);
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Banana");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "Banana");
        await expectOutput(page, "reason", "item-press");
        await expect(input(page, field)).toHaveValue("Banana");
        await expectOutput(page, "open", "false");
        await page.keyboard.press("Escape");
        await expectOutput(page, "value", "");
        await expectOutput(page, "reason", "escape-key");
    });

    test("Escape closes the list and keeps the text, then clears it", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("ch");
        await expectOptions(page, ["Cherry"]);
        await page.keyboard.press("Escape");
        await expectOutput(page, "open", "false");
        await expect(input(page, field)).toHaveValue("ch");
        await page.keyboard.press("Escape");
        await expect(input(page, field)).toHaveValue("");
        await expectOutput(page, "value", "");
    });

    test("free text: no suggestion, Enter keeps the text; an empty text closes the list", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("kiwi");
        await expect(page.getByText("No suggestion.")).toBeVisible();
        await expect(options(page)).toHaveCount(0);
        await page.keyboard.press("Enter");
        await expectOutput(page, "open", "false");
        await expectOutput(page, "value", "kiwi");
        await page.keyboard.type("x");
        await expectOutput(page, "open", "true");
        await input(page, field).press("ControlOrMeta+a");
        await page.keyboard.press("Delete");
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "input-clear");
        await expectOutput(page, "value", "");
    });

    test("ArrowDown opens on the first suggestion; ArrowUp returns to the input; Alt+ArrowUp closes", async ({
        page,
    }) => {
        await input(page, field).focus();
        await page.keyboard.press("ArrowDown");
        await expectOutput(page, "reason", "list-navigation");
        await expect(options(page)).toHaveCount(7);
        await expectActive(page, field, "Apple");
        await page.keyboard.press("ArrowUp");
        await expectActive(page, field, null);
        await page.keyboard.press("Alt+ArrowUp");
        await expectOutput(page, "open", "false");
    });

    test("a disabled suggestion is highlighted, never chosen", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("an");
        await expectOptions(page, ["Banana", "Mango", "Orange"]);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Orange");
        await expect(option(page, "Orange")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "an");
        await expectOutput(page, "open", "true");
    });

    test("the Trigger toggles the list, a click chooses; Clear empties the text", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("an");
        const trigger = page.getByRole("button", { name: "Show suggestions" });
        await trigger.click();
        await expectOutput(page, "open", "false");
        await expect(input(page, field)).toBeFocused();
        await trigger.click();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expect(input(page, field)).toBeFocused();
        await option(page, "Mango").click();
        await expectOutput(page, "value", "Mango");
        await expectOutput(page, "open", "false");
        const clear = page.getByRole("button", { name: "Clear search" });
        await clear.click();
        await expectOutput(page, "reason", "clear-press");
        await expectOutput(page, "value", "");
        await expect(input(page, field)).toBeFocused();
        await expect(clear).toHaveCount(0);
    });

    test("Tab closes the list without choosing and moves on", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("gr");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Grape");
        await page.keyboard.press("Tab");
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "focus-out");
        await expectOutput(page, "value", "gr");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        await input(page, field).click();
        await page.keyboard.type("b");
        await expectOptions(page, ["Banana", "Blueberry"]);
        await expectNoAxeViolations(page);
    });
});

test.describe("autocomplete / both (inline completion)", () => {
    const field = "Fruit";
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/autocomplete/both");
    });

    test("typing completes the first suggestion inline, the completion selected", async ({
        page,
    }) => {
        await expect(input(page, field)).toHaveAttribute(
            "aria-autocomplete",
            "both",
        );
        await input(page, field).click();
        await page.keyboard.type("b");
        await expectOptions(page, ["Banana", "Blueberry"]);
        await expectActive(page, field, "Banana");
        await expectText(page, field, "Banana", "anana");
        await expectOutput(page, "value", "b");
        await page.keyboard.type("l");
        await expectOutput(page, "value", "Bl");
        await expectOptions(page, ["Blueberry"]);
        await expectActive(page, field, "Blueberry");
        await expectText(page, field, "Blueberry", "ueberry");
    });

    test("a deletion removes the completion and highlights nothing", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("bl");
        await expectText(page, field, "Blueberry", "ueberry");
        await page.keyboard.press("Backspace");
        await expectText(page, field, "Bl");
        await expectActive(page, field, null);
        await page.keyboard.press("Backspace");
        await expectText(page, field, "B");
        await expectOutput(page, "value", "B");
        await expectOptions(page, ["Banana", "Blueberry"]);
        await expectActive(page, field, null);
    });

    test("the arrows show the highlighted suggestion, the list filtered by the value; Escape restores it", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("b");
        await page.keyboard.press("Backspace");
        await expectText(page, field, "B");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Banana");
        await expect(input(page, field)).toHaveValue("Banana");
        await expectOptions(page, ["Banana", "Blueberry"]);
        await page.keyboard.press("ArrowDown");
        await expect(input(page, field)).toHaveValue("Blueberry");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, null);
        await expect(input(page, field)).toHaveValue("B");
        await page.keyboard.press("ArrowDown");
        await expect(input(page, field)).toHaveValue("Banana");
        await page.keyboard.press("Escape");
        await expect(page.getByRole("listbox")).toHaveCount(0);
        await expect(input(page, field)).toHaveValue("B");
        await expectOutput(page, "value", "B");
    });

    test("leaving the input accepts the completion", async ({ page }) => {
        await input(page, field).click();
        await page.keyboard.type("ch");
        await expectText(page, field, "Cherry", "erry");
        await page.keyboard.press("Tab");
        await expectOutput(page, "value", "Cherry");
        await expectOutput(page, "reason", "input-blur");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
    });

    test("a disabled suggestion is never completed", async ({ page }) => {
        await input(page, field).click();
        await page.keyboard.type("or");
        await expectOptions(page, ["Orange"]);
        await expectActive(page, field, null);
        await expectText(page, field, "or");
    });

    test("has no axe violation while open", async ({ page }) => {
        await input(page, field).click();
        await page.keyboard.type("b");
        await expectActive(page, field, "Banana");
        await expectNoAxeViolations(page);
    });
});

test.describe("autocomplete / inline", () => {
    const field = "Fruit";
    test("completes over a fixed list", async ({ page }) => {
        await openScenario(page, "/autocomplete/inline");
        await expect(input(page, field)).toHaveAttribute(
            "aria-autocomplete",
            "inline",
        );
        await input(page, field).click();
        await page.keyboard.type("m");
        await expect(options(page)).toHaveCount(7);
        await expectActive(page, field, "Mango");
        await expectText(page, field, "Mango", "ango");
        await expectOutput(page, "value", "m");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Orange");
        await expect(input(page, field)).toHaveValue("Orange");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "m");
        await page.keyboard.press("ArrowUp");
        await expectActive(page, field, "Mango");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "Mango");
        await expect(page.getByRole("listbox")).toHaveCount(0);
    });
});

test.describe("autocomplete / none", () => {
    const field = "Fruit";
    test("a press opens it; no filtering; autoHighlight; an empty text keeps it open", async ({
        page,
    }) => {
        await openScenario(page, "/autocomplete/none");
        await expect(input(page, field)).toHaveAttribute(
            "aria-autocomplete",
            "none",
        );
        await input(page, field).click();
        await expectOutput(page, "reason", "input-press");
        await expect(options(page)).toHaveCount(7);
        await expectActive(page, field, null);
        await page.keyboard.type("zz");
        await expect(options(page)).toHaveCount(7);
        await expectActive(page, field, "Apple");
        await expectText(page, field, "zz");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "Apple");
        await retype(page, field, "a");
        await expect(page.getByRole("listbox")).toBeVisible();
        await page.keyboard.press("Backspace");
        await expectOutput(page, "value", "");
        await expect(page.getByRole("listbox")).toBeVisible();
    });
});

test.describe("autocomplete / groups", () => {
    const field = "Produce";
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/autocomplete/groups");
    });

    test("groups, the keys across them, the limit, the empty state", async ({
        page,
    }) => {
        await input(page, field).click();
        await page.keyboard.type("c");
        const fruits = page.getByRole("group", { name: "Fruits" });
        const vegetables = page.getByRole("group", { name: "Vegetables" });
        await expect(fruits.getByRole("option")).toHaveText(["Cherry"]);
        await expect(vegetables.getByRole("option")).toHaveText([
            "Carrot",
            "Celery",
        ]);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Celery");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "Celery");
        await retype(page, field, "a");
        await expectOptions(page, ["Apple", "Banana", "Carrot"]);
        await retype(page, field, "xyz");
        await expect(page.getByText("Nothing found.")).toBeVisible();
        await expect(page.getByRole("listbox").getByRole("group")).toHaveCount(
            0,
        );
    });

    test("has no axe violation while open", async ({ page }) => {
        await input(page, field).click();
        await page.keyboard.type("c");
        await expect(options(page)).toHaveCount(3);
        await expectNoAxeViolations(page);
    });
});

test.describe("autocomplete / async", () => {
    const field = "City";
    test("suggestions loaded as the text changes; a gone highlight is dropped", async ({
        page,
    }) => {
        await openScenario(page, "/autocomplete/async");
        await input(page, field).click();
        await page.keyboard.type("br");
        await expect(
            page.getByRole("status").getByText("Loading…"),
        ).toHaveCount(1);
        await expectOutput(page, "loaded", "br");
        await expectOptions(page, ["Brasília"]);
        await expectActive(page, field, null);
        await page.keyboard.press("ArrowDown");
        await expectActive(page, field, "Brasília");
        await page.keyboard.type("x");
        await expectActive(page, field, null);
        await expectOutput(page, "loaded", "brx");
        await expect(page.getByText("No city found.")).toBeVisible();
        await page.keyboard.press("Backspace");
        await expectOutput(page, "loaded", "br");
        await expectOptions(page, ["Brasília"]);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "Brasília");
    });
});

test.describe("autocomplete / field", () => {
    const field = "City";
    const submit = (page: Page) => page.getByRole("button", { name: "Submit" });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/autocomplete/field");
    });

    test("labelled and described by the field; the label focuses the input", async ({
        page,
    }) => {
        await expect(input(page, field)).toHaveAccessibleDescription(
            "Type or pick one.",
        );
        await expect(input(page, field)).not.toHaveAttribute("aria-invalid");
        await page.getByText("City", { exact: true }).click();
        await expect(input(page, field)).toBeFocused();
    });

    test("a failed submission shows the error; free text and a suggestion submit", async ({
        page,
    }) => {
        await submit(page).click();
        await expectSubmitted(page, "none");
        await expect(input(page, field)).toBeFocused();
        await expect(input(page, field)).toHaveAttribute(
            "aria-invalid",
            "true",
        );
        await expect(page.getByText("Enter a city.")).toBeVisible();
        await expectNoAxeViolations(page);
        await input(page, field).click();
        await page.keyboard.type("Lima");
        // no highlight: Enter closes the list and submits the form
        await page.keyboard.press("Enter");
        await expectSubmitted(page, "city=Lima");
        await expect(page.getByRole("listbox")).toHaveCount(0);
        await retype(page, field, "kra");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await expect(input(page, field)).toHaveValue("Kraków");
        await submit(page).click();
        await expectSubmitted(page, "city=Kraków");
    });

    test("a form reset empties the input", async ({ page }) => {
        await input(page, field).click();
        await page.keyboard.type("Lima");
        await resetForm(page);
        await expect(input(page, field)).toHaveValue("");
        await submit(page).click();
        await expectSubmitted(page, "none");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
