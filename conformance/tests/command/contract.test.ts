import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/command.md: anatomy, ARIA, the hidden parts, the live regions

test("command / basic: parts, roles and states", async ({ page }) => {
    await openScenario(page, "/command/basic");
    await expect(part(page, "command", "root")).toHaveCount(1);
    await expect(part(page, "command", "root")).not.toHaveAttribute("role");
    const input = part(page, "command", "input");
    await expect(input).toHaveAttribute("role", "combobox");
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveAttribute("autocomplete", "off");
    await expect(input).toHaveAttribute("spellcheck", "false");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    const list = part(page, "command", "list");
    await expect(list).toHaveAttribute("role", "listbox");
    await expect(list).toHaveAttribute("tabindex", "-1");
    await expect(list).not.toHaveAttribute("aria-busy");
    await expect(list).not.toHaveAttribute("data-empty");
    await expect(input).toHaveAttribute(
        "aria-controls",
        (await list.getAttribute("id")) as string,
    );

    const groups = part(page, "command", "group");
    await expect(groups).toHaveCount(2);
    const labels = part(page, "command", "group-label");
    await expect(groups.nth(0)).toHaveAttribute("role", "group");
    await expect(groups.nth(0)).toHaveAttribute(
        "aria-labelledby",
        (await labels.nth(0).getAttribute("id")) as string,
    );
    const separator = part(page, "command", "separator");
    await expect(separator).toHaveAttribute("role", "presentation");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");

    const items = part(page, "command", "item");
    await expect(items).toHaveCount(6);
    await expect(items.nth(0)).toHaveAttribute("role", "option");
    await expect(items.nth(0)).toHaveAttribute("data-highlighted", "");
    await expect(items.nth(1)).not.toHaveAttribute("data-highlighted");
    await expect(items.nth(1)).toHaveAttribute("aria-selected", "false");
    await expect(items.nth(2)).toHaveAttribute("aria-disabled", "true");
    await expect(items.nth(2)).toHaveAttribute("data-disabled", "");
    await expect(input).toHaveAttribute(
        "aria-activedescendant",
        (await items.nth(0).getAttribute("id")) as string,
    );

    const empty = part(page, "command", "empty");
    await expect(empty).toHaveCount(1);
    await expect(empty).toHaveAttribute("role", "status");
    await expect(empty).toHaveAttribute("aria-live", "polite");
    await expect(empty).toHaveAttribute("aria-atomic", "true");
    await expect(empty).toBeEmpty();
    await expectNoFalseStates(parts(page, "command"));

    await input.fill("emo");
    // a part that shows nothing stays in the DOM, `hidden`
    await expect(items).toHaveCount(6);
    await expect(items.nth(0)).toHaveAttribute("hidden", "");
    await expect(items.nth(1)).not.toHaveAttribute("hidden");
    await expect(groups.nth(1)).toHaveAttribute("hidden", "");
    await expect(separator).toHaveAttribute("hidden", "");

    await input.fill("zzz");
    await expect(list).toHaveAttribute("data-empty", "");
    await expect(input).not.toHaveAttribute("aria-activedescendant");
    await expect(empty).toHaveText("No results.");
    await expectNoFalseStates(parts(page, "command"));
});

test("command / async: the loading part and the busy list", async ({
    page,
}) => {
    await openScenario(page, "/command/async");
    const loading = part(page, "command", "loading");
    await expect(loading).toHaveAttribute("role", "status");
    await expect(loading).toHaveAttribute("aria-live", "polite");
    await expect(part(page, "command", "item")).toHaveCount(50);
    await expect(loading).toBeEmpty();
    const list = part(page, "command", "list");
    await expect(list).not.toHaveAttribute("aria-busy");
    await expect(list).not.toHaveAttribute("data-loading");
    await expectNoFalseStates(parts(page, "command"));
});

test("command / filter: a forced Item and Separator", async ({ page }) => {
    await openScenario(page, "/command/filter");
    await part(page, "command", "input").fill("zzz");
    const items = part(page, "command", "item");
    await expect(items.last()).toHaveText("Ask AI");
    await expect(items.last()).not.toHaveAttribute("hidden");
    await expect(items.last()).toHaveAttribute("data-highlighted", "");
});

test("command-virtual / basic: the rows' place in the set", async ({
    page,
}) => {
    await openScenario(page, "/command-virtual/basic");
    const items = part(page, "command", "item");
    await expect(items.first()).toHaveAttribute("aria-posinset", "1");
    await expect(items.first()).toHaveAttribute("aria-setsize", "10000");
    await expect(part(page, "command", "list")).toHaveAttribute(
        "role",
        "listbox",
    );
    await expectNoFalseStates(parts(page, "command"));
});
