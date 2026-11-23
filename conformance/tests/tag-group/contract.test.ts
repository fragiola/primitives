import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tag-group.md: anatomy, state attributes, the roving tab stop, the empty state
test("tag-group / basic: parts, roles and the tab stop", async ({ page }) => {
    await openScenario(page, "/tag-group/basic");
    const root = part(page, "tag-group", "root");
    await expect(root).toHaveCount(1);
    await expect(root).not.toHaveAttribute("role");
    await expect(root).not.toHaveAttribute("data-empty");
    await expect(root).not.toHaveAttribute("data-disabled");

    const label = part(page, "tag-group", "label");
    const labelId = await label.getAttribute("id");
    expect(labelId).toBeTruthy();
    const list = part(page, "tag-group", "list");
    await expect(list).toHaveAttribute("role", "grid");
    await expect(list).toHaveAttribute("aria-labelledby", labelId as string);
    await expect(list).not.toHaveAttribute("tabindex");
    await expect(list).not.toHaveAttribute("data-empty");
    await expect(list).not.toHaveAttribute("aria-multiselectable");

    const tags = part(page, "tag-group", "tag");
    await expect(tags).toHaveCount(5);
    await expect(tags.nth(0)).toHaveAttribute("tabindex", "0");
    for (const [index, tag] of (await tags.all()).entries()) {
        await expect(tag).toHaveAttribute("role", "row");
        if (index > 0) {
            await expect(tag).toHaveAttribute("tabindex", "-1");
        }
        await expect(tag).not.toHaveAttribute("aria-selected");
        await expect(tag).not.toHaveAttribute("data-selected");
        await expect(tag).not.toHaveAttribute("data-disabled");
        const cell = part(tag, "tag-group", "tag-cell");
        await expect(cell).toHaveCount(1);
        await expect(cell).toHaveAttribute("role", "gridcell");
        const remove = part(cell, "tag-group", "remove-button");
        await expect(remove).toHaveAttribute("type", "button");
        await expect(remove).toHaveAttribute("tabindex", "-1");
        await expect(remove).not.toHaveAttribute("data-disabled");
    }
    await expectNoFalseStates(parts(page, "tag-group"));

    // the tab stop follows the focus
    await tags.nth(0).focus();
    await page.keyboard.press("ArrowRight");
    await expect(tags.nth(1)).toHaveAttribute("tabindex", "0");
    await expect(tags.nth(0)).toHaveAttribute("tabindex", "-1");
});

test("tag-group / basic: the empty state", async ({ page }) => {
    await openScenario(page, "/tag-group/basic");
    await part(page, "tag-group", "tag").first().focus();
    for (let count = 0; count < 5; count++) {
        await page.keyboard.press("Delete");
    }
    const list = part(page, "tag-group", "list");
    await expect(list).toHaveAttribute("role", "group");
    await expect(list).toHaveAttribute("tabindex", "-1");
    await expect(list).toHaveAttribute("data-empty", "");
    await expect(part(page, "tag-group", "root")).toHaveAttribute(
        "data-empty",
        "",
    );
    await expect(part(page, "tag-group", "tag")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "tag-group"));
});

test("tag-group / selection: selected and multiselectable", async ({
    page,
}) => {
    await openScenario(page, "/tag-group/selection");
    const list = part(page, "tag-group", "list");
    await expect(list).toHaveAttribute("aria-multiselectable", "true");
    const tags = part(page, "tag-group", "tag");
    for (const [index, tag] of (await tags.all()).entries()) {
        const selected = index === 2;
        await expect(tag).toHaveAttribute(
            "aria-selected",
            selected ? "true" : "false",
        );
        if (selected) {
            await expect(tag).toHaveAttribute("data-selected", "");
        } else {
            await expect(tag).not.toHaveAttribute("data-selected");
        }
    }
    await expect(part(page, "tag-group", "remove-button")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "tag-group"));
});

test("tag-group / disabled: disabled tags and their buttons", async ({
    page,
}) => {
    await openScenario(page, "/tag-group/disabled");
    const tags = part(page, "tag-group", "tag");
    for (const index of [1, 4]) {
        const tag = tags.nth(index);
        await expect(tag).toHaveAttribute("aria-disabled", "true");
        await expect(tag).toHaveAttribute("data-disabled", "");
        await expect(tag).not.toHaveAttribute("tabindex");
        const remove = part(tag, "tag-group", "remove-button");
        await expect(remove).toBeDisabled();
        await expect(remove).toHaveAttribute("data-disabled", "");
    }
    await expect(tags.nth(0)).not.toHaveAttribute("aria-disabled");
    await expectNoFalseStates(parts(page, "tag-group"));
});

test("tag-group / empty: a group, empty", async ({ page }) => {
    await openScenario(page, "/tag-group/empty");
    const list = part(page, "tag-group", "list");
    await expect(list).toHaveAttribute("role", "group");
    await expect(list).toHaveAttribute("data-empty", "");
    await expect(list).not.toHaveAttribute("aria-multiselectable");
    await expect(part(page, "tag-group", "root")).toHaveAttribute(
        "data-empty",
        "",
    );
});

test("tag-group / field: the field's ids and states on the List", async ({
    page,
}) => {
    await openScenario(page, "/tag-group/field");
    const list = part(page, "tag-group", "list");
    const label = page.locator('[data-primitives-part="field-label"]');
    const labelId = await label.getAttribute("id");
    expect(labelId).toBeTruthy();
    await expect(list).toHaveAttribute("aria-labelledby", labelId as string);
    await expect(list).toHaveAttribute("aria-describedby", /.+/);
    await expect(part(page, "tag-group", "label")).toHaveCount(0);
    await part(page, "tag-group", "tag").first().focus();
    await page.keyboard.press("Space");
    await expect(list).toHaveAttribute("data-filled", "");
    await expectNoFalseStates(parts(page, "tag-group"));
});
