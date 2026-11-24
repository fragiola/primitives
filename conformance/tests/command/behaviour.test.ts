import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/command.md
const input = (page: Page) =>
    page.getByRole("combobox", { name: "Command", exact: true });
const options = (page: Page) => page.getByRole("option");
// the recipe hides an empty list: found by its part, not its role
const list = (page: Page) =>
    page.locator('[data-primitives-part="command-list"]');
const option = (page: Page, name: string) =>
    page.getByRole("option", { name, exact: true });

/** The highlighted Item (`aria-activedescendant`, `aria-selected`), or none. */
async function expectActive(page: Page, name: string | null): Promise<void> {
    if (name === null) {
        await expect(input(page)).not.toHaveAttribute(
            "aria-activedescendant",
            /.+/,
        );
        return;
    }
    const id = await option(page, name).getAttribute("id");
    expect(id).not.toBeNull();
    await expect(input(page)).toHaveAttribute(
        "aria-activedescendant",
        id as string,
    );
    await expect(option(page, name)).toHaveAttribute("aria-selected", "true");
    await expect(option(page, name)).toHaveAttribute("data-highlighted", "");
}

async function expectOptions(
    page: Page,
    names: readonly string[],
): Promise<void> {
    await expect(options(page)).toHaveText(names as string[]);
}

/** Replaces the Input's text. */
async function search(page: Page, text: string): Promise<void> {
    await input(page).fill("");
    if (text !== "") {
        await input(page).pressSequentially(text);
    }
}

const ALL = [
    "Calendar",
    "Search Emoji",
    "Calculator",
    "Profile",
    "Billing",
    "Archive",
];

test("command / basic: the combobox, its always displayed list and the first highlight", async ({
    page,
}) => {
    await openScenario(page, "/command/basic");
    await expect(input(page)).toHaveAttribute("aria-expanded", "true");
    await expect(input(page)).toHaveAttribute("aria-autocomplete", "list");
    const listId = await page.getByRole("listbox").getAttribute("id");
    await expect(input(page)).toHaveAttribute(
        "aria-controls",
        listId as string,
    );
    await expectOptions(page, ALL);
    await expectActive(page, "Calendar");
    await expect(option(page, "Search Emoji")).toHaveAttribute(
        "aria-selected",
        "false",
    );
    await expectNoAxeViolations(page);
});

test("command / basic: the arrows, Home and End move the highlight, wrapping; Enter runs it", async ({
    page,
}) => {
    await openScenario(page, "/command/basic");
    await input(page).focus();
    await expectActive(page, "Calendar");
    await page.keyboard.press("ArrowDown");
    await expectActive(page, "Search Emoji");
    await page.keyboard.press("ArrowDown");
    await expectActive(page, "Calculator");
    await expect(option(page, "Calculator")).toHaveAttribute(
        "aria-disabled",
        "true",
    );
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "none");
    await page.keyboard.press("End");
    await expectActive(page, "Archive");
    await page.keyboard.press("ArrowDown");
    await expectActive(page, "Calendar");
    await page.keyboard.press("ArrowUp");
    await expectActive(page, "Archive");
    await page.keyboard.press("Home");
    await expectActive(page, "Calendar");
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "Calendar");
    await expect(input(page)).toBeFocused();
});

test("command / basic: typing filters, scores and hides the empty groups", async ({
    page,
}) => {
    await openScenario(page, "/command/basic");
    const groups = page.locator('[data-primitives-part="command-group"]');
    const separator = page.locator(
        '[data-primitives-part="command-separator"]',
    );
    await expect(separator).toBeVisible();

    await search(page, "emo");
    await expectOptions(page, ["Search Emoji"]);
    await expectActive(page, "Search Emoji");
    await expect(groups.nth(1)).toHaveAttribute("hidden", "");
    await expect(groups.nth(0)).not.toHaveAttribute("hidden");
    await expect(separator).toHaveAttribute("hidden", "");
    await expectOutput(page, "search", "emo");

    await search(page, "acc");
    await expectOptions(page, ["Profile"]);
    await expect(groups.nth(0)).toHaveAttribute("hidden", "");

    await search(page, "ar");
    await expectOptions(page, ["Calendar", "Search Emoji", "Archive"]);
    await expectActive(page, "Archive");
    await expectNoAxeViolations(page);

    await search(page, "zzz");
    await expect(options(page)).toHaveCount(0);
    await expect(page.getByRole("status")).toHaveText("No results.");
    await expect(list(page)).toHaveAttribute("data-empty", "");
    await expectActive(page, null);
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "none");
    await expectNoAxeViolations(page);

    await search(page, "");
    await expectOptions(page, ALL);
    await expect(separator).toBeVisible();
    await expect(page.getByRole("status")).toHaveText("");
    await expect(list(page)).not.toHaveAttribute("data-empty");
});

test("command / basic: the pointer highlights and runs, the focus staying in the Input", async ({
    page,
}) => {
    await openScenario(page, "/command/basic");
    await input(page).focus();
    await option(page, "Billing").hover();
    await expectActive(page, "Billing");
    await option(page, "Billing").click();
    await expectOutput(page, "ran", "Billing");
    await expect(input(page)).toBeFocused();
    // a disabled option (`aria-disabled`): Playwright waits for an enabled one unless forced
    await option(page, "Calculator").click({ force: true });
    await expectOutput(page, "ran", "Billing");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "After" })).toBeFocused();
});

test("command / filter: the app's filter, and an Item always shown", async ({
    page,
}) => {
    await openScenario(page, "/command/filter");
    await search(page, "ar");
    await expectOptions(page, ["Archive", "Ask AI"]);
    await expectActive(page, "Archive");
    await search(page, "x");
    await expectOptions(page, ["Ask AI"]);
    await expect(page.getByRole("status")).toHaveText("");
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "Ask AI");
});

test("command / pages: a page empties the text, Backspace on an empty Input goes back", async ({
    page,
}) => {
    await openScenario(page, "/command/pages");
    await search(page, "proj");
    await expectActive(page, "Search projects…");
    await page.keyboard.press("Enter");
    await expectOutput(page, "pages", "projects");
    await expect(input(page)).toHaveValue("");
    await expectOptions(page, ["Primitives", "Tree", "Splitter"]);
    await expectActive(page, "Primitives");
    await expectNoAxeViolations(page);

    await page.keyboard.type("tr");
    await expectOptions(page, ["Tree"]);
    await page.keyboard.press("Backspace");
    await page.keyboard.press("Backspace");
    await expect(input(page)).toHaveValue("");
    await expectOutput(page, "pages", "projects");
    await page.keyboard.press("Backspace");
    await expectOutput(page, "pages", "");
    await expectOutput(page, "reason", "backspace-key");
    await expectOptions(page, ["Search projects…", "Change theme…"]);
    await expectActive(page, "Search projects…");
    await page.keyboard.press("Backspace");
    await expectOutput(page, "pages", "");
    await expectOptions(page, ["Search projects…", "Change theme…"]);
});

/** Records the List's busy states and the Loading part's text while busy (a quick load cannot skip it). */
async function watchLoading(page: Page): Promise<() => Promise<string[]>> {
    await page.evaluate(() => {
        const list = document.querySelector('[role="listbox"]') as Element;
        const loading = document.querySelector(
            '[data-primitives-part="command-loading"]',
        ) as Element;
        const seen: string[] = [];
        (window as unknown as { seen: string[] }).seen = seen;
        const record = () => {
            if (list.getAttribute("aria-busy") === "true") {
                seen.push(`busy ${loading.textContent}`);
            }
        };
        new MutationObserver(record).observe(list, { attributes: true });
        new MutationObserver(record).observe(loading, {
            childList: true,
            subtree: true,
            characterData: true,
        });
    });
    return () =>
        page.evaluate(() => (window as unknown as { seen: string[] }).seen);
}

test("command / async: the results load for the text", async ({ page }) => {
    await openScenario(page, "/command/async");
    await expect(options(page)).toHaveCount(50);
    await expect(page.getByText("Loading…")).toHaveCount(0);
    await expectActive(page, "Item 1");

    const seen = await watchLoading(page);
    await search(page, "777");
    await expectOutput(page, "filter", "777");
    expect(await seen()).toContain("busy Loading…");
    await expect(page.getByRole("listbox")).not.toHaveAttribute("aria-busy");
    await expect(page.getByText("Loading…")).toHaveCount(0);
    await expect(options(page).first()).toHaveText("Item 777");
    for (const text of await options(page).allTextContents()) {
        expect(text).toContain("777");
    }
    await expectActive(page, "Item 777");
    await expectNoAxeViolations(page);

    await search(page, "xyz");
    await expectOutput(page, "filter", "xyz");
    await expect(page.getByText("No results.")).toBeVisible();
});

test("command / dialog: Cmd/Ctrl+K opens the Command in a Dialog", async ({
    page,
}) => {
    await openScenario(page, "/command/dialog");
    const trigger = page.getByRole("button", { name: "Open command menu" });
    await trigger.focus();
    await page.keyboard.press("Control+k");
    await expect(
        page.getByRole("dialog", { name: "Command menu" }),
    ).toBeVisible();
    await expect(input(page)).toBeFocused();
    await expectNoAxeViolations(page);
    await page.keyboard.press("Escape");
    await expectOutput(page, "open", "false");
    await expect(trigger).toBeFocused();

    await page.keyboard.press("Meta+k");
    await expect(input(page)).toBeFocused();
    await page.keyboard.type("bill");
    await expectActive(page, "Billing");
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "Billing");
    await expectOutput(page, "open", "false");
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expectOutput(page, "open", "true");
    await expect(input(page)).toBeFocused();
    await page.keyboard.press("Control+k");
    await expectOutput(page, "open", "false");
});

test("command-virtual / basic: 10 000 Items, only those in view rendered", async ({
    page,
}) => {
    await openScenario(page, "/command-virtual/basic");
    await expectActive(page, "Item 1");
    expect(await options(page).count()).toBeLessThan(60);
    await expect(options(page).first()).toHaveAttribute(
        "aria-setsize",
        "10000",
    );
    await input(page).focus();
    await page.keyboard.press("End");
    await expectActive(page, "Item 10000");
    await expect(option(page, "Item 10000")).toHaveAttribute(
        "aria-posinset",
        "10000",
    );
    await expect(option(page, "Item 10000")).toBeInViewport();
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "Item 10000");

    await search(page, "zulu");
    await expectOptions(page, ["Zulu"]);
    await expect(option(page, "Zulu")).toHaveAttribute("aria-setsize", "1");
    await expectActive(page, "Zulu");
    await page.keyboard.press("Enter");
    await expectOutput(page, "ran", "Zulu");

    await search(page, "Item 99");
    await expectActive(page, "Item 99");
    await expectNoAxeViolations(page);
});
