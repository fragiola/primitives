import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/virtual-lists.md
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** Fewer than 60 options in the DOM: the list is virtual. */
async function expectFewOptions(page: Page): Promise<void> {
    await expect(page.getByRole("option").first()).toBeVisible();
    expect(await page.getByRole("option").count()).toBeLessThan(60);
}

/** The option is inside its scroll container's visible box. */
async function expectInView(target: Locator): Promise<void> {
    await expect
        .poll(() =>
            target.evaluate((element) => {
                let container = element.parentElement;
                while (container !== null) {
                    const overflow = getComputedStyle(container).overflowY;
                    if (overflow === "auto" || overflow === "scroll") {
                        break;
                    }
                    container = container.parentElement;
                }
                if (container === null) {
                    return false;
                }
                const box = element.getBoundingClientRect();
                const view = container.getBoundingClientRect();
                return box.top >= view.top - 1 && box.bottom <= view.bottom + 1;
            }),
        )
        .toBe(true);
}

/** The option `aria-activedescendant` names, by its name. */
async function expectActive(
    combobox: Locator,
    page: Page,
    name: string | null,
): Promise<void> {
    if (name === null) {
        await expect(combobox).not.toHaveAttribute(
            "aria-activedescendant",
            /.+/,
        );
        return;
    }
    const target = option(page, name);
    await expect(target).toHaveAttribute("id", /.+/);
    await expect(combobox).toHaveAttribute(
        "aria-activedescendant",
        (await target.getAttribute("id")) as string,
    );
}

/** Scrolls an element to the end of its content. */
async function scrollToEnd(container: Locator): Promise<void> {
    await container.evaluate((element) => {
        element.scrollTop = element.scrollHeight;
    });
}

test.describe("listbox-virtual / basic", () => {
    test("every key reaches every item, with its place in the set", async ({
        page,
    }) => {
        await openScenario(page, "/listbox-virtual/basic");
        const list = page.getByRole("listbox", { name: "Items" });
        await expect(list).toHaveAttribute("aria-multiselectable", "true");
        await expectFewOptions(page);
        const first = page.getByRole("option").first();
        await expect(first).toHaveText("Item 1");
        await expect(first).toHaveAttribute("aria-setsize", "10000");
        await expect(first).toHaveAttribute("aria-posinset", "1");

        await page.keyboard.press("Tab");
        await expect(option(page, "Item 1")).toBeFocused();
        await page.keyboard.press("End");
        const last = option(page, "Item 10000");
        await expect(last).toBeFocused();
        await expect(last).toHaveAttribute("aria-posinset", "10000");
        await expectInView(last);
        await page.keyboard.press("Home");
        await expect(option(page, "Item 1")).toBeFocused();

        // a page: the last option whose bottom is within the list's height from the first's top
        const page_ = await list.evaluate((element) => {
            const options = [...element.querySelectorAll('[role="option"]')];
            const top = options[0]?.getBoundingClientRect().top ?? 0;
            return options.filter(
                (item) =>
                    item.getBoundingClientRect().bottom - top <=
                    element.clientHeight,
            ).length;
        });
        await page.keyboard.press("PageDown");
        const paged = page.locator('[role="option"]:focus');
        await expect(paged).toHaveAttribute("aria-posinset", String(page_));
        await expectInView(paged);

        await page.keyboard.press("z");
        const zulu = option(page, "Zulu");
        await expect(zulu).toBeFocused();
        await expect(zulu).toHaveAttribute("aria-posinset", "7777");
        await expectInView(zulu);
        expect(await page.getByRole("option").count()).toBeLessThan(60);
    });

    test("ranges and select all cover the items not in the DOM", async ({
        page,
    }) => {
        await openScenario(page, "/listbox-virtual/basic");
        await page.keyboard.press("Tab");
        await page.keyboard.press("z");
        await expect(option(page, "Zulu")).toBeFocused();
        await page.keyboard.press("Space");
        await expectOutput(page, "count", "1");
        await expectOutput(page, "last", "item-7777");
        await page.keyboard.press("Control+Shift+End");
        await expectOutput(page, "count", "2224");
        await expectOutput(page, "last", "item-10000");
        await expect(option(page, "Item 10000")).toBeFocused();
        await page.keyboard.press("Control+a");
        await expectOutput(page, "count", "9999");
    });

    test("the focused option stays when it scrolls out of view", async ({
        page,
    }) => {
        await openScenario(page, "/listbox-virtual/basic");
        await page.keyboard.press("Tab");
        await page.keyboard.press("End");
        await expect(option(page, "Item 10000")).toBeFocused();
        const list = page.getByRole("listbox", { name: "Items" });
        await list.evaluate((element) => {
            element.scrollTop = 0;
        });
        await expect(option(page, "Item 1")).toBeVisible();
        await expect(option(page, "Item 10000")).toBeFocused();
        await page.keyboard.press("ArrowUp");
        await expect(option(page, "Item 9999")).toBeFocused();
        await expectInView(option(page, "Item 9999"));
        await expectNoAxeViolations(page);
    });
});

test("listbox-virtual / async: loads its pages as it scrolls", async ({
    page,
}) => {
    await openScenario(page, "/listbox-virtual/async");
    const list = page.getByRole("listbox", { name: "Items" });
    await expect(list).toHaveAttribute("data-loading", "");
    await expect(list).toHaveAttribute("aria-busy", "true");
    await expectOutput(page, "count", "50");
    await expectOutput(page, "status", "idle");
    await expect(list).not.toHaveAttribute("data-loading");
    await expect(list).not.toHaveAttribute("aria-busy");
    await scrollToEnd(list);
    await expect(list).toHaveAttribute("data-loading", "");
    await expectOutput(page, "count", "100");
    await option(page, "Item 1").focus();
    await page.keyboard.press("End");
    await expect(option(page, "Item 100")).toBeFocused();
    await expect(option(page, "Item 100")).toHaveAttribute(
        "aria-setsize",
        "100",
    );
    await expectNoAxeViolations(page);
});

test.describe("select-virtual / basic", () => {
    test("the keys and the typeahead reach every item", async ({ page }) => {
        await openScenario(page, "/select-virtual/basic");
        const trigger = page.getByRole("combobox", { name: "Item" });
        await trigger.click();
        await expectFewOptions(page);
        await expectActive(trigger, page, "Item 1");
        await page.keyboard.press("End");
        await expectActive(trigger, page, "Item 10000");
        const last = option(page, "Item 10000");
        await expect(last).toHaveAttribute("aria-posinset", "10000");
        await expect(last).toHaveAttribute("aria-setsize", "10000");
        await expectInView(last);
        await expectNoAxeViolations(page);
        await page.keyboard.press("z");
        await expectActive(trigger, page, "Zulu");
        await expectInView(option(page, "Zulu"));
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "item-7777");
        await expect(page.getByRole("listbox")).toHaveCount(0);
        await trigger.click();
        await expectActive(trigger, page, "Zulu");
        await expectInView(option(page, "Zulu"));
        expect(await page.getByRole("option").count()).toBeLessThan(60);
    });
});

test("select-virtual / async: the popup loads more at its end", async ({
    page,
}) => {
    await openScenario(page, "/select-virtual/async");
    await expectOutput(page, "count", "50");
    const trigger = page.getByRole("combobox", { name: "Item" });
    await trigger.click();
    const list = page.getByRole("listbox");
    await expect(option(page, "Item 1")).toBeVisible();
    await scrollToEnd(list);
    await expectOutput(page, "count", "100");
    await expect(list).not.toHaveAttribute("data-loading");
    await page.keyboard.press("End");
    await expectActive(trigger, page, "Item 100");
    await expectNoAxeViolations(page);
});

test.describe("combobox-virtual / basic", () => {
    test("the arrows, the filter and the selected item", async ({ page }) => {
        await openScenario(page, "/combobox-virtual/basic");
        const input = page.getByRole("combobox", { name: "Item" });
        await input.click();
        await expectFewOptions(page);
        await expectActive(input, page, null);
        await page.keyboard.press("ArrowUp");
        await expectActive(input, page, "Item 10000");
        await expect(option(page, "Item 10000")).toHaveAttribute(
            "aria-posinset",
            "10000",
        );
        await expectInView(option(page, "Item 10000"));
        await page.keyboard.press("ArrowDown");
        await expectActive(input, page, null);
        await page.keyboard.press("ArrowDown");
        await expectActive(input, page, "Item 1");
        await expectNoAxeViolations(page);

        await input.fill("Item 99");
        await expect(option(page, "Item 99")).toHaveAttribute(
            "aria-setsize",
            "111",
        );
        await page.keyboard.press("ArrowUp");
        await expectActive(input, page, "Item 9999");
        await expect(option(page, "Item 9999")).toHaveAttribute(
            "aria-posinset",
            "111",
        );
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "item-9999");
        await expect(input).toHaveValue("Item 9999");

        await input.fill("Item 5");
        await page.keyboard.press("Escape");
        await expect(input).toHaveValue("Item 9999");
        await page.keyboard.press("ArrowDown");
        await expectActive(input, page, "Item 9999");
        await expect(option(page, "Item 9999")).toHaveAttribute(
            "aria-setsize",
            "10000",
        );
        await expectInView(option(page, "Item 9999"));
    });
});

test("combobox-virtual / async: no stale page, and load more", async ({
    page,
}) => {
    await openScenario(page, "/combobox-virtual/async");
    const input = page.getByRole("combobox", { name: "Item" });
    await input.click();
    // `1` loads for 800 ms: the list says it loads, then `12` replaces the load
    await input.pressSequentially("1");
    await expect(page.getByRole("status")).toHaveText("Loading…");
    await expect(page.getByRole("listbox")).toHaveAttribute("data-loading", "");
    await expect(page.getByRole("listbox")).toHaveAttribute(
        "aria-busy",
        "true",
    );
    await input.pressSequentially("2");
    await expectOutput(page, "filter", "12");
    await expect(page.getByRole("status")).toHaveText("");
    await page.waitForTimeout(1000);
    await expectOutput(page, "filter", "12");
    await expectOutput(page, "count", "50");
    for (const name of await page.getByRole("option").allTextContents()) {
        expect(name).toContain("12");
    }
    await scrollToEnd(page.getByRole("listbox"));
    await expectOutput(page, "count", "100");
    for (const name of await page.getByRole("option").allTextContents()) {
        expect(name).toContain("12");
    }
    await expectNoAxeViolations(page);
});

test("autocomplete-virtual / basic: the set and the last match", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete-virtual/basic");
    const input = page.getByRole("combobox", { name: "Search" });
    await input.click();
    await input.pressSequentially("Item 1");
    await expectFewOptions(page);
    await expect(page.getByRole("option").first()).toHaveAttribute(
        "aria-setsize",
        "1112",
    );
    await page.keyboard.press("ArrowUp");
    await expectActive(input, page, "Item 10000");
    await expect(option(page, "Item 10000")).toHaveAttribute(
        "aria-posinset",
        "1112",
    );
    await expectInView(option(page, "Item 10000"));
    await expectNoAxeViolations(page);
    await page.keyboard.press("Enter");
    await expectOutput(page, "value", "Item 10000");
});

test("autocomplete-virtual / async: no stale page, and load more", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete-virtual/async");
    const input = page.getByRole("combobox", { name: "Search" });
    await input.click();
    await input.pressSequentially("12");
    await expectOutput(page, "filter", "12");
    await page.waitForTimeout(1000);
    await expectOutput(page, "filter", "12");
    for (const name of await page.getByRole("option").allTextContents()) {
        expect(name).toContain("12");
    }
    await scrollToEnd(page.getByRole("listbox"));
    await expectOutput(page, "count", "100");
    await expectNoAxeViolations(page);
});
