import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted, resetForm } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/listbox.md
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** The option has the focus. */
async function expectFocused(page: Page, name: string): Promise<void> {
    await expect(option(page, name)).toBeFocused();
}

/** Exactly these options are selected, in the list's order. */
async function expectSelected(
    page: Page,
    names: readonly string[],
): Promise<void> {
    const selected = page.getByRole("option", { selected: true });
    await expect(selected).toHaveCount(names.length);
    for (const [index, name] of names.entries()) {
        await expect(selected.nth(index)).toHaveAccessibleName(name);
    }
}

/** Presses `key` `times` times. */
async function press(page: Page, key: string, times = 1): Promise<void> {
    for (let count = 0; count < times; count++) {
        await page.keyboard.press(key);
    }
}

test.describe("listbox / single", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/listbox/single");
    });

    test("a named, vertical, single-select listbox of seven options", async ({
        page,
    }) => {
        const list = page.getByRole("listbox", { name: "Fruit" });
        await expect(list).toHaveAttribute("aria-orientation", "vertical");
        await expect(list).not.toHaveAttribute("aria-multiselectable");
        await expect(page.getByRole("option")).toHaveCount(7);
        await expect(page.getByRole("option", { selected: true })).toHaveCount(
            0,
        );
        await expect(option(page, "Orange")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
    });

    test("Tab enters at the first option; the arrows move the focus, not the selection", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expectFocused(page, "Apple");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "Banana");
        await expect(option(page, "Banana")).toHaveAttribute(
            "data-highlighted",
            "",
        );
        await expectOutput(page, "value", "none");
        await expectSelected(page, []);
    });

    test("Space and Enter select the focused option; the selected one stays", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "banana");
        await expectOutput(page, "reason", "keyboard");
        await expectSelected(page, ["Banana"]);
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "blueberry");
        await expectSelected(page, ["Blueberry"]);
        await page.keyboard.press("Space");
        await expectSelected(page, ["Blueberry"]);
        await expectOutput(page, "value", "blueberry");
    });

    test("a disabled option takes focus, never the selection; the arrows wrap; Home and End", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Space");
        await page.keyboard.press("End");
        await expectFocused(page, "Orange");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "banana");
        await expectSelected(page, ["Banana"]);
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "Apple");
        await page.keyboard.press("ArrowUp");
        await expectFocused(page, "Orange");
        await page.keyboard.press("Home");
        await expectFocused(page, "Apple");
    });

    test("typeahead moves the focus", async ({ page }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("m");
        await expectFocused(page, "Mango");
        await page.waitForTimeout(600);
        await page.keyboard.press("b");
        await expectFocused(page, "Banana");
        await page.keyboard.press("l");
        await expectFocused(page, "Blueberry");
        await page.waitForTimeout(600);
        await page.keyboard.press("b");
        await expectFocused(page, "Banana");
        await page.keyboard.press("b");
        await expectFocused(page, "Blueberry");
        await expectSelected(page, []);
    });

    test("Tab leaves; Shift+Tab comes back to the selected option", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await press(page, "ArrowDown", 2);
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "Cherry");
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expectFocused(page, "Blueberry");
    });

    test("a click selects and focuses an option; a disabled one is only focused", async ({
        page,
    }) => {
        await option(page, "Cherry").click();
        await expectFocused(page, "Cherry");
        await expectOutput(page, "value", "cherry");
        await expectOutput(page, "reason", "item-press");
        await option(page, "Orange").click({ force: true });
        await expectFocused(page, "Orange");
        await expectOutput(page, "value", "cherry");
        await expectSelected(page, ["Cherry"]);
    });

    test("PageDown and PageUp go to the ends of a list that does not scroll", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("PageDown");
        await expectFocused(page, "Orange");
        await page.keyboard.press("PageUp");
        await expectFocused(page, "Apple");
    });

    test("has no axe violation", async ({ page }) => {
        await option(page, "Banana").click();
        await expectNoAxeViolations(page);
    });
});

test.describe("listbox / multiple (the toggle model)", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/listbox/multiple");
    });

    test("a named multi-select listbox, nothing selected", async ({ page }) => {
        await expect(
            page.getByRole("listbox", { name: "Toppings" }),
        ).toHaveAttribute("aria-multiselectable", "true");
        await expect(page.getByRole("option")).toHaveCount(8);
        await expectSelected(page, []);
    });

    test("Space toggles the focused option", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expectFocused(page, "Cheese");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "cheese");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "cheese,mushrooms");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "cheese");
    });

    test("Shift and an arrow move and toggle, passing a disabled option by", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("Space");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Shift+ArrowUp");
        await expectFocused(page, "Cheese");
        await expectOutput(page, "value", "none");
        await page.keyboard.press("Shift+ArrowDown");
        await expectOutput(page, "value", "mushrooms");
        await page.keyboard.press("Shift+ArrowDown");
        await expectFocused(page, "Olives");
        await expectOutput(page, "value", "mushrooms");
        await page.keyboard.press("Shift+ArrowDown");
        await expectFocused(page, "Onions");
        await expectOutput(page, "value", "mushrooms,onions");
    });

    test("Shift+Space selects the range from the anchor", async ({ page }) => {
        await option(page, "Peppers").focus();
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "peppers");
        await press(page, "ArrowDown", 2);
        await expectFocused(page, "Spinach");
        await page.keyboard.press("Shift+Space");
        await expectOutput(page, "value", "peppers,pineapple,spinach");
        await expectSelected(page, ["Peppers", "Pineapple", "Spinach"]);
    });

    test("Ctrl+A selects every enabled option, then none", async ({ page }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("Control+a");
        await expectOutput(
            page,
            "value",
            "cheese,mushrooms,onions,peppers,pineapple,spinach,tomatoes",
        );
        await page.keyboard.press("Control+a");
        await expectOutput(page, "value", "none");
    });

    test("Ctrl+Shift+End and Ctrl+Shift+Home select to the ends and focus them", async ({
        page,
    }) => {
        await option(page, "Onions").focus();
        await page.keyboard.press("Control+Shift+End");
        await expectFocused(page, "Tomatoes");
        await expectOutput(
            page,
            "value",
            "onions,peppers,pineapple,spinach,tomatoes",
        );
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Control+Shift+Home");
        await expectFocused(page, "Cheese");
        await expectOutput(
            page,
            "value",
            "cheese,mushrooms,onions,peppers,pineapple,spinach,tomatoes",
        );
    });

    test("a click toggles, Shift+click adds the range from the anchor", async ({
        page,
    }) => {
        await option(page, "Onions").click();
        await expectOutput(page, "value", "onions");
        await option(page, "Spinach").click({ modifiers: ["Shift"] });
        await expectOutput(page, "value", "onions,peppers,pineapple,spinach");
        await expectFocused(page, "Spinach");
        await option(page, "Peppers").click();
        await expectOutput(page, "value", "onions,pineapple,spinach");
    });

    test("has no axe violation with options selected", async ({ page }) => {
        await option(page, "Cheese").click();
        await option(page, "Onions").click();
        await expectNoAxeViolations(page);
    });
});

test.describe("listbox / replace (the replace model)", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/listbox/replace");
    });

    test("the selection follows the focus, passing a disabled option by", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expectFocused(page, "Cheese");
        await expectSelected(page, []);
        await page.keyboard.press("ArrowDown");
        await expectOutput(page, "value", "mushrooms");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "Olives");
        await expectOutput(page, "value", "mushrooms");
        await page.keyboard.press("ArrowDown");
        await expectOutput(page, "value", "onions");
    });

    test("Ctrl moves without selecting; Ctrl+Space toggles; Shift and an arrow toggle", async ({
        page,
    }) => {
        await option(page, "Onions").click();
        await page.keyboard.press("Control+ArrowDown");
        await expectFocused(page, "Peppers");
        await expectOutput(page, "value", "onions");
        await page.keyboard.press("Control+Space");
        await expectOutput(page, "value", "onions,peppers");
        await page.keyboard.press("Control+Space");
        await expectOutput(page, "value", "onions");
        await page.keyboard.press("Shift+ArrowDown");
        await expectFocused(page, "Pineapple");
        await expectOutput(page, "value", "onions,pineapple");
    });

    test("Space replaces; Shift+Space makes the range the selection", async ({
        page,
    }) => {
        await option(page, "Pineapple").focus();
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "pineapple");
        await press(page, "Control+ArrowDown", 2);
        await expectFocused(page, "Tomatoes");
        await page.keyboard.press("Shift+Space");
        await expectOutput(page, "value", "pineapple,spinach,tomatoes");
    });

    test("Ctrl+Shift+Home makes the range the selection; Ctrl+A then unselects all", async ({
        page,
    }) => {
        await option(page, "Tomatoes").click();
        await page.keyboard.press("Control+Shift+Home");
        await expectFocused(page, "Cheese");
        await expectOutput(
            page,
            "value",
            "cheese,mushrooms,onions,peppers,pineapple,spinach,tomatoes",
        );
        await page.keyboard.press("Control+a");
        await expectOutput(page, "value", "none");
    });

    test("a click replaces, Ctrl+click toggles, Shift+click makes the range the selection", async ({
        page,
    }) => {
        await option(page, "Cheese").click();
        await expectOutput(page, "value", "cheese");
        await option(page, "Onions").click({ modifiers: ["ControlOrMeta"] });
        await expectOutput(page, "value", "cheese,onions");
        await option(page, "Peppers").click({ modifiers: ["Shift"] });
        await expectOutput(page, "value", "onions,peppers");
        await option(page, "Spinach").click();
        await expectOutput(page, "value", "spinach");
    });

    test("typeahead focuses and selects", async ({ page }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("t");
        await expectFocused(page, "Tomatoes");
        await expectOutput(page, "value", "tomatoes");
    });
});

test.describe("listbox / groups", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/listbox/groups");
    });

    test("two named groups of three options", async ({ page }) => {
        const fruits = page.getByRole("group", { name: "Fruits" });
        const vegetables = page.getByRole("group", { name: "Vegetables" });
        await expect(fruits.getByRole("option")).toHaveCount(3);
        await expect(vegetables.getByRole("option")).toHaveCount(3);
    });

    test("the keys cross the groups; labels and the separator take no focus", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expectFocused(page, "Apple");
        await press(page, "ArrowDown", 3);
        await expectFocused(page, "Carrot");
        await page.keyboard.press("End");
        await expectFocused(page, "Potato");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "Apple");
    });

    test("typeahead across groups, Enter selects", async ({ page }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.type("ce");
        await expectFocused(page, "Celery");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "celery");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("listbox / horizontal", () => {
    test("the horizontal arrows, no loop", async ({ page }) => {
        await openScenario(page, "/listbox/horizontal");
        await expect(
            page.getByRole("listbox", { name: "Size" }),
        ).toHaveAttribute("aria-orientation", "horizontal");
        await page.keyboard.press("Tab");
        await expectFocused(page, "M");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "L");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "L");
        await page.keyboard.press("End");
        await expectFocused(page, "XL");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "XL");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "xl");
        await page.keyboard.press("ArrowLeft");
        await expectFocused(page, "L");
        await page.keyboard.press("Home");
        await expectFocused(page, "S");
    });

    test("right to left, the horizontal arrows swap", async ({ page }) => {
        await openScenario(page, "/listbox/horizontal", { dir: "rtl" });
        await page.keyboard.press("Tab");
        await expectFocused(page, "M");
        await page.keyboard.press("ArrowLeft");
        await expectFocused(page, "L");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "M");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "S");
    });
});

test.describe("listbox / field", () => {
    const fruit = (page: Page) => page.getByRole("listbox", { name: "Fruit" });
    const submit = (page: Page) => page.getByRole("button", { name: "Submit" });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/listbox/field");
    });

    test("labelled and described by the field", async ({ page }) => {
        await expect(fruit(page)).toHaveAccessibleDescription("Pick one.");
        await expect(fruit(page)).not.toHaveAttribute("aria-invalid");
    });

    test("a failed submission shows the error; selecting hides it; the form submits both lists", async ({
        page,
    }) => {
        await submit(page).click();
        await expectSubmitted(page, "none");
        await expectFocused(page, "Apple");
        await expect(fruit(page)).toHaveAttribute("aria-invalid", "true");
        await expect(fruit(page)).toHaveAttribute("data-invalid", "");
        await expect(page.getByText("Choose a fruit.")).toBeVisible();
        await expect(fruit(page)).toHaveAccessibleDescription(
            "Pick one. Choose a fruit.",
        );
        await expectNoAxeViolations(page);
        await option(page, "Banana").click();
        await expect(page.getByText("Choose a fruit.")).toHaveCount(0);
        await expect(fruit(page)).not.toHaveAttribute("aria-invalid");
        await submit(page).click();
        await expectSubmitted(page, "fruit=banana&toppings=cheese");
        await option(page, "Onions").click();
        await submit(page).click();
        await expectSubmitted(
            page,
            "fruit=banana&toppings=cheese&toppings=onions",
        );
    });

    test("a form reset returns both lists to their defaults", async ({
        page,
    }) => {
        await option(page, "Banana").click();
        await option(page, "Onions").click();
        await resetForm(page);
        await expectSelected(page, ["Cheese"]);
        await submit(page).click();
        await expectSubmitted(page, "none");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
