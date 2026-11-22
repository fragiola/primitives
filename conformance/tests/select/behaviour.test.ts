import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/select.md
const trigger = (page: Page) => page.getByRole("combobox", { name: "Fruit" });
const listbox = (page: Page) => page.getByRole("listbox");
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** The highlighted option, as the trigger announces it (`aria-activedescendant`). */
async function expectHighlighted(page: Page, name: string) {
    const id = await option(page, name).getAttribute("id");
    expect(id).not.toBeNull();
    await expect(trigger(page)).toHaveAttribute(
        "aria-activedescendant",
        id as string,
    );
}

/**
 * The highlighted option, whichever way the implementation tracks it (`data-highlighted`, spec
 * state attribute): a wait for the highlight before the next key.
 * Base UI settles its open highlight a frame late, so a key sent before it was overridden in CI.
 */
async function expectActiveOption(page: Page, name: string) {
    await expect(option(page, name)).toHaveAttribute("data-highlighted");
}

test.describe("select / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/select/basic");
    });

    test("a named, collapsed select-only combobox showing its placeholder", async ({
        page,
    }) => {
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "listbox");
        await expect(trigger(page)).toHaveText("Choose a fruit");
        // the hidden input is not in the accessibility tree
        await expect(page.getByRole("combobox")).toHaveCount(1);
        await expect(page.getByRole("textbox")).toHaveCount(0);
        await expect(page.getByRole("button")).toHaveCount(2);
    });

    test("a click opens the list; focus stays on the trigger, which points at the highlight", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await expect(page.getByRole("option")).toHaveText([
            "Apple",
            "Banana",
            "Blueberry",
            "Cherry",
            "Grape",
            "Mango",
            "Orange",
        ]);
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        await expect(trigger(page)).toBeFocused();
        await expectHighlighted(page, "Apple");
    });

    test("the popup sits below the trigger, aligned with it, at least as wide", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        // measured once the popup's enter transition (if any) has finished
        await page.evaluate(() =>
            Promise.all(
                document.getAnimations().map((animation) => animation.finished),
            ),
        );
        const box = await trigger(page).boundingBox();
        const list = await listbox(page).boundingBox();
        expect(box).not.toBeNull();
        expect(list).not.toBeNull();
        const t = box as NonNullable<typeof box>;
        const l = list as NonNullable<typeof list>;
        expect(l.y).toBeGreaterThanOrEqual(t.y + t.height - 1);
        expect(Math.abs(l.x - t.x)).toBeLessThanOrEqual(1);
        // the list sits inside the popup's border
        expect(l.width).toBeGreaterThanOrEqual(t.width - 2);
    });

    test("ArrowDown opens it, Enter chooses; focus stays on the trigger", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await expect(listbox(page)).toBeVisible();
        await expectActiveOption(page, "Apple");
        await page.keyboard.press("ArrowDown");
        await expectActiveOption(page, "Banana");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "banana");
        await expect(trigger(page)).toHaveText("Banana");
        await expect(listbox(page)).toBeHidden();
        await expect(trigger(page)).toBeFocused();
    });

    test("reopened, the selected option is highlighted and selected", async ({
        page,
    }) => {
        await trigger(page).click();
        await option(page, "Banana").click();
        await expectOutput(page, "value", "banana");
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await expect(option(page, "Banana")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        // the selection is what Enter chooses again, and ArrowDown moves on from it
        await expectActiveOption(page, "Banana");
        await page.keyboard.press("ArrowDown");
        await expectActiveOption(page, "Blueberry");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "blueberry");
    });

    test("typeahead, Home and End", async ({ page }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await page.keyboard.type("m");
        await expectActiveOption(page, "Mango");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "mango");
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await expect(listbox(page)).toBeVisible();
        // the selected option is highlighted on open; Home moves on from it (Base UI settles its
        // open highlight a frame late, so a Home sent earlier was overridden in CI)
        await expectActiveOption(page, "Mango");
        await page.keyboard.press("Home");
        await expectActiveOption(page, "Apple");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "apple");
    });

    // spec/select.md, "Typing while closed" (D4 §3: the APG select-only combobox)
    test("typing on the closed trigger opens the list on the match, without choosing", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("c");
        await expect(listbox(page)).toBeVisible();
        await expectOutput(page, "reason", "list-navigation");
        await expectActiveOption(page, "Cherry");
        await expectHighlighted(page, "Cherry");
        await expect(trigger(page)).toBeFocused();
        await expectOutput(page, "value", "none");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "cherry");
        await expect(listbox(page)).toBeHidden();
    });

    test("typing quickly on the closed trigger extends the search", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.type("bl");
        await expect(listbox(page)).toBeVisible();
        await expectActiveOption(page, "Blueberry");
        await expectHighlighted(page, "Blueberry");
        await expectOutput(page, "value", "none");
    });

    test("typing on the closed trigger can highlight a disabled option, never choose it", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("o");
        await expect(listbox(page)).toBeVisible();
        await expectActiveOption(page, "Orange");
        await page.keyboard.press("Enter");
        await expect(listbox(page)).toBeVisible();
        await expectOutput(page, "value", "none");
    });

    test("a disabled option cannot be chosen", async ({ page }) => {
        await trigger(page).click();
        await expect(option(page, "Orange")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await option(page, "Orange").click({ force: true });
        await expect(listbox(page)).toBeVisible();
        await expectOutput(page, "value", "none");
    });

    test("Escape closes without choosing", async ({ page }) => {
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Escape");
        await expect(listbox(page)).toBeHidden();
        await expectOutput(page, "reason", "escape-key");
        await expectOutput(page, "value", "none");
        await expect(trigger(page)).toBeFocused();
    });

    test("a click chooses; an outside press closes", async ({ page }) => {
        await trigger(page).click();
        await option(page, "Cherry").click();
        await expectOutput(page, "value", "cherry");
        await expect(trigger(page)).toHaveText("Cherry");
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await page.mouse.click(400, 400);
        await expect(listbox(page)).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
    });

    test("non-modal: the page keeps its pointer and its scroll while open", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        const state = await page.evaluate(() => ({
            pointer: getComputedStyle(document.body).pointerEvents,
            overflow: getComputedStyle(document.documentElement).overflow,
        }));
        expect(state).toEqual({ pointer: "auto", overflow: "visible" });
    });

    test("Tab chooses the highlighted option and moves on", async ({
        page,
    }) => {
        await trigger(page).focus();
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("ArrowDown");
        await page.keyboard.press("Tab");
        await expect(listbox(page)).toBeHidden();
        await expectOutput(page, "value", "banana");
    });

    test("required blocks the submission and focuses the trigger; then it submits", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(trigger(page)).toBeFocused();
        await expectSubmitted(page, "none");
        await trigger(page).click();
        await option(page, "Banana").click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "fruit=banana");
    });

    test("a form reset shows the placeholder again", async ({ page }) => {
        await trigger(page).click();
        await option(page, "Banana").click();
        await expect(trigger(page)).toHaveText("Banana");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(trigger(page)).toHaveText("Choose a fruit");
        await expectOutput(page, "value", "none");
    });

    test("has no axe violation, closed and open", async ({ page }) => {
        await expectNoAxeViolations(page);
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test("select / controlled: a value the consumer refuses is not shown", async ({
    page,
}) => {
    await openScenario(page, "/select/controlled");
    await expect(trigger(page)).toHaveText("Apple");
    await trigger(page).click();
    await option(page, "Cherry").click();
    await expectOutput(page, "requested", "cherry");
    await expect(listbox(page)).toBeHidden();
    await expect(trigger(page)).toHaveText("Apple");
    await expectOutput(page, "value", "apple");
    await trigger(page).click();
    await option(page, "Banana").click();
    await expect(trigger(page)).toHaveText("Banana");
});

// spec/select.md, "Modal" (D4 §3 "Menu and Select `modal`")
test.describe("select / modal", () => {
    const outside = (page: Page) =>
        page.getByRole("button", { name: "Outside button" });

    /** A press at the centre of the element, wherever the pointer events go (no hit check). */
    async function pressAt(page: Page, name: string) {
        const box = await page.getByRole("button", { name }).boundingBox();
        if (box === null) {
            throw new Error("missing box");
        }
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    }

    async function wheelScrolls(page: Page): Promise<boolean> {
        await page.mouse.move(10, 10);
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(200);
        return page.evaluate(() => window.scrollY > 0);
    }

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/select/modal");
    });

    test("the page does not scroll while open", async ({ page }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        expect(await wheelScrolls(page)).toBe(false);
    });

    test("an outside press only closes: it reaches no element, focus stays on the trigger", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await pressAt(page, "Outside button");
        await expect(listbox(page)).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
        await expectOutput(page, "outside", "none");
        await expect(outside(page)).not.toBeFocused();
        await expect(trigger(page)).toBeFocused();
    });

    test("once closed, the page takes the pointer and scrolls again", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(listbox(page)).toBeHidden();
        await outside(page).click();
        await expectOutput(page, "outside", "pressed");
        expect(await wheelScrolls(page)).toBe(true);
    });

    test("the pointer still works inside, and the trigger still toggles", async ({
        page,
    }) => {
        await trigger(page).click();
        await option(page, "Cherry").click();
        await expectOutput(page, "value", "cherry");
        await expect(listbox(page)).toBeHidden();
        await trigger(page).click();
        await expect(listbox(page)).toBeVisible();
        await trigger(page).click();
        await expect(listbox(page)).toBeHidden();
        await expectOutput(page, "reason", "trigger-press");
    });
});

test.describe("select / groups", () => {
    const food = (page: Page) => page.getByRole("combobox", { name: "Food" });

    async function expectFoodHighlighted(page: Page, name: string) {
        const id = await option(page, name).getAttribute("id");
        expect(id).not.toBeNull();
        await expect(food(page)).toHaveAttribute(
            "aria-activedescendant",
            id as string,
        );
    }

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/select/groups");
    });

    test("closed, it shows the selected item's label from the kept-mounted list", async ({
        page,
    }) => {
        await expect(food(page)).toHaveText("Carrot");
        await expectOutput(page, "value", "carrot");
    });

    test("two named groups of options; the selected one is highlighted", async ({
        page,
    }) => {
        await food(page).click();
        await expect(page.getByRole("listbox")).toBeVisible();
        await expect(page.getByRole("group", { name: "Fruits" })).toBeVisible();
        await expect(
            page.getByRole("group", { name: "Vegetables" }),
        ).toBeVisible();
        await expect(
            page.getByRole("group", { name: "Fruits" }).getByRole("option"),
        ).toHaveText(["Apple", "Banana"]);
        await expect(page.getByRole("option")).toHaveCount(5);
        await expectFoodHighlighted(page, "Carrot");
        await expect(option(page, "Carrot")).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    test("the keys move across groups, skipping labels and the separator", async ({
        page,
    }) => {
        await food(page).click();
        await expectFoodHighlighted(page, "Carrot");
        await page.keyboard.press("ArrowUp");
        await expectFoodHighlighted(page, "Banana");
        await page.keyboard.press("ArrowDown");
        await expectFoodHighlighted(page, "Carrot");
        await page.keyboard.press("ArrowDown");
        await expectFoodHighlighted(page, "Leek");
        await page.keyboard.press("ArrowDown");
        await expectFoodHighlighted(page, "Potato");
        await page.keyboard.press("Home");
        await expectFoodHighlighted(page, "Apple");
        await page.keyboard.press("End");
        await expectFoodHighlighted(page, "Potato");
    });

    test("Enter chooses; the Value shows the item's text", async ({ page }) => {
        await food(page).click();
        await page.keyboard.press("Home");
        await page.keyboard.press("ArrowDown");
        await expectFoodHighlighted(page, "Banana");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "banana");
        await expect(food(page)).toHaveText("Banana");
    });

    test("typing while closed matches the registered labels", async ({
        page,
    }) => {
        await food(page).focus();
        await page.keyboard.press("p");
        await expect(page.getByRole("listbox")).toBeVisible();
        await expectFoodHighlighted(page, "Potato");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "potato");
        // the ItemText only, not the indicator after it
        await expect(food(page)).toHaveText("Potato");
    });

    test("has no axe violation, closed and open", async ({ page }) => {
        await expectNoAxeViolations(page);
        await food(page).click();
        await expect(page.getByRole("listbox")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
