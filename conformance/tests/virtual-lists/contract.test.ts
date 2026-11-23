import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/virtual-lists.md: a virtual part is its component's part, its options carry their place
// in the set, the rows' room is their margins, the loading state is present or absent

/** The rendered options: few, each with its place in the set and its index. */
async function expectRows(
    items: Locator,
    setSize: number,
    first: number,
): Promise<void> {
    const count = await items.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(60);
    await expect(items.first()).toHaveAttribute(
        "aria-setsize",
        String(setSize),
    );
    await expect(items.first()).toHaveAttribute(
        "aria-posinset",
        String(first + 1),
    );
    await expect(items.first()).toHaveAttribute("data-index", String(first));
    for (const item of await items.all()) {
        const index = Number(await item.getAttribute("data-index"));
        await expect(item).toHaveAttribute("aria-posinset", String(index + 1));
        await expect(item).toHaveAttribute("aria-setsize", String(setSize));
    }
}

/** The room after the last row: its `margin-block-end`, the rest of the list's extent. */
async function expectRoomAfter(items: Locator): Promise<void> {
    await expect
        .poll(() =>
            items
                .last()
                .evaluate((element) =>
                    Number.parseFloat(getComputedStyle(element).marginBlockEnd),
                ),
        )
        .toBeGreaterThan(1000);
}

/** A combobox's last item is pinned (its keys reach it): rendered, the room before it. */
async function expectPinnedEnd(items: Locator, setSize: number): Promise<void> {
    await expect(items.last()).toHaveAttribute(
        "data-index",
        String(setSize - 1),
    );
    await expect
        .poll(() =>
            items
                .last()
                .evaluate((element) =>
                    Number.parseFloat(
                        getComputedStyle(element).marginBlockStart,
                    ),
                ),
        )
        .toBeGreaterThan(1000);
}

async function openPopup(page: Page, name: string): Promise<void> {
    await page.getByRole("combobox", { name }).click();
}

test("listbox-virtual / basic: the root, its rows and their room", async ({
    page,
}) => {
    await openScenario(page, "/listbox-virtual/basic");
    const root = part(page, "listbox", "root");
    await expect(root).toHaveAttribute("role", "listbox");
    await expect(root).toHaveAttribute("aria-orientation", "vertical");
    await expect(root).toHaveAttribute("data-multiple", "");
    await expect(root).not.toHaveAttribute("data-loading");
    await expect(root).not.toHaveAttribute("aria-busy");
    const items = part(page, "listbox", "item");
    await expectRows(items, 10_000, 0);
    await expectRoomAfter(items);
    await expect(items.first()).toHaveAttribute("tabindex", "0");
    await expect(items.nth(2)).toHaveAttribute("data-disabled", "");
    await page.keyboard.press("Tab");
    await page.keyboard.press("End");
    // the tab stop is pinned: the rows before it are room before its row
    const last = page.getByRole("option", { name: "Item 10000" });
    await expect(last).toHaveAttribute("tabindex", "0");
    await expect(last).toHaveAttribute("data-highlighted", "");
    const first = items.first();
    await expect
        .poll(() =>
            first.evaluate((element) =>
                Number.parseFloat(getComputedStyle(element).marginBlockStart),
            ),
        )
        .toBeGreaterThan(1000);
    await expectNoFalseStates(parts(page, "listbox"));
});

test("listbox-virtual / async: the loading state", async ({ page }) => {
    // the first page takes 150 ms: the root's `data-loading` is recorded as it happens
    await page.addInitScript(() => {
        const seen = { loading: false };
        (window as unknown as { seen: typeof seen }).seen = seen;
        new MutationObserver(() => {
            if (
                document
                    .querySelector('[data-primitives-part="listbox-root"]')
                    ?.getAttribute("data-loading") === ""
            ) {
                seen.loading = true;
            }
        }).observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
        });
    });
    await openScenario(page, "/listbox-virtual/async");
    const root = part(page, "listbox", "root");
    await expectOutput(page, "count", "50");
    expect(
        await page.evaluate(
            () =>
                (window as unknown as { seen: { loading: boolean } }).seen
                    .loading,
        ),
    ).toBe(true);
    await expect(root).not.toHaveAttribute("data-loading");
    await expectRows(part(page, "listbox", "item"), 50, 0);
    await expectNoFalseStates(parts(page, "listbox"));
});

test("select-virtual / basic: the list and its rows", async ({ page }) => {
    await openScenario(page, "/select-virtual/basic");
    await openPopup(page, "Item");
    const list = part(page, "select", "list");
    await expect(list).toHaveAttribute("role", "listbox");
    await expect(list).not.toHaveAttribute("data-loading");
    const items = part(page, "select", "item");
    await expectRows(items, 10_000, 0);
    await expectRoomAfter(items);
    await expect(items.first()).toHaveAttribute("data-highlighted", "");
    await expectNoFalseStates(parts(page, "select"));
});

test("select-virtual / async: the rows of the loaded pages", async ({
    page,
}) => {
    await openScenario(page, "/select-virtual/async");
    await expectOutput(page, "count", "50");
    await openPopup(page, "Item");
    await expectRows(part(page, "select", "item"), 50, 0);
    await expect(part(page, "select", "list")).not.toHaveAttribute(
        "data-loading",
    );
    await expectNoFalseStates(parts(page, "select"));
});

test("combobox-virtual / basic: the list and its rows", async ({ page }) => {
    await openScenario(page, "/combobox-virtual/basic");
    await openPopup(page, "Item");
    const list = part(page, "combobox", "list");
    await expect(list).toHaveAttribute("role", "listbox");
    await expect(list).not.toHaveAttribute("data-empty");
    const items = part(page, "combobox", "item");
    await expectRows(items, 10_000, 0);
    await expectPinnedEnd(items, 10_000);
    await expect(items.nth(2)).toHaveAttribute("data-disabled", "");
    await expectNoFalseStates(parts(page, "combobox"));
});

test("combobox-virtual / async: the loading state", async ({ page }) => {
    await openScenario(page, "/combobox-virtual/async");
    await expectOutput(page, "count", "50");
    await openPopup(page, "Item");
    const list = part(page, "combobox", "list");
    await expect(list).not.toHaveAttribute("data-loading");
    await expectRows(part(page, "combobox", "item"), 50, 0);
    await page.getByRole("combobox", { name: "Item" }).pressSequentially("1");
    await expect(list).toHaveAttribute("data-loading", "");
    await expect(list).toHaveAttribute("aria-busy", "true");
    await expectOutput(page, "filter", "1");
    await expect(list).not.toHaveAttribute("data-loading");
    await expectNoFalseStates(parts(page, "combobox"));
});

test("autocomplete-virtual / basic: the list and its rows", async ({
    page,
}) => {
    await openScenario(page, "/autocomplete-virtual/basic");
    await page.getByRole("combobox", { name: "Search" }).pressSequentially("I");
    const list = part(page, "autocomplete", "list");
    await expect(list).toHaveAttribute("role", "listbox");
    const items = part(page, "autocomplete", "item");
    await expectRows(items, 9999, 0);
    await expectPinnedEnd(items, 9999);
    await expectNoFalseStates(parts(page, "autocomplete"));
});

test("autocomplete-virtual / async: the loading state", async ({ page }) => {
    await openScenario(page, "/autocomplete-virtual/async");
    const input = page.getByRole("combobox", { name: "Search" });
    await input.pressSequentially("1");
    const list = part(page, "autocomplete", "list");
    await expect(list).toHaveAttribute("data-loading", "");
    await expectOutput(page, "filter", "1");
    await expect(list).not.toHaveAttribute("data-loading");
    await expectRows(part(page, "autocomplete", "item"), 50, 0);
    await expectNoFalseStates(parts(page, "autocomplete"));
});
