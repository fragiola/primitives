import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tag-group.md. A Tag's name is its content: its text, then its RemoveButton's name when it
// has one ("News Remove News"), so a tag is found by the start of its name.
const tag = (page: Page, name: string) =>
    page.getByRole("row", { name: new RegExp(`^${name}\\b`) });

async function expectFocused(page: Page, name: string): Promise<void> {
    await expect(tag(page, name)).toBeFocused();
}

/** Exactly these tags are selected, in order. */
async function expectSelected(
    page: Page,
    names: readonly string[],
): Promise<void> {
    const selected = page.getByRole("row", { selected: true });
    await expect(selected).toHaveCount(names.length);
    for (const [index, name] of names.entries()) {
        await expect(selected.nth(index)).toHaveAccessibleName(
            new RegExp(`^${name}\\b`),
        );
    }
}

test.describe("tag-group / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tag-group/basic");
    });

    test("a named grid of five rows, each with one gridcell, nothing selectable", async ({
        page,
    }) => {
        const grid = page.getByRole("grid", { name: "Categories" });
        await expect(grid).toBeVisible();
        await expect(grid).not.toHaveAttribute("aria-multiselectable");
        const rows = grid.getByRole("row");
        await expect(rows).toHaveCount(5);
        for (const row of await rows.all()) {
            await expect(row).not.toHaveAttribute("aria-selected");
            await expect(row.getByRole("gridcell")).toHaveCount(1);
        }
        await expect(
            page.getByRole("button", { name: /^Remove / }),
        ).toHaveCount(5);
    });

    test("one tab stop; the arrows of both axes move and wrap; Home and End", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "Travel");
        await page.keyboard.press("ArrowLeft");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowLeft");
        await expectFocused(page, "Sports");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "Travel");
        await page.keyboard.press("ArrowUp");
        await expectFocused(page, "News");
        await page.keyboard.press("End");
        await expectFocused(page, "Sports");
        await page.keyboard.press("Home");
        await expectFocused(page, "News");
        await page.keyboard.press("Space");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("row", { selected: true })).toHaveCount(0);
    });

    test("Tab leaves; Shift+Tab returns to the last focused tag", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expectFocused(page, "Travel");
    });

    test("Delete and Backspace remove the focused tag; the focus moves to the next, else the previous", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Delete");
        await expectOutput(page, "tags", "news,gaming,shopping,sports");
        await expectOutput(page, "removed", "travel");
        await expectOutput(page, "reason", "keyboard");
        await expectFocused(page, "Gaming");
        await page.keyboard.press("End");
        await page.keyboard.press("Backspace");
        await expectOutput(page, "tags", "news,gaming,shopping");
        await expectFocused(page, "Shopping");
    });

    test("a RemoveButton removes its tag and moves the focus on", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Remove News" }).click();
        await expectOutput(page, "tags", "travel,gaming,shopping,sports");
        await expectOutput(page, "reason", "chip-remove-press");
        await expectFocused(page, "Travel");
        await expect(page.getByRole("row", { selected: true })).toHaveCount(0);
    });

    test("removing the last tag focuses the empty group; axe with tags and empty", async ({
        page,
    }) => {
        await expectNoAxeViolations(page);
        await page.keyboard.press("Tab");
        for (const next of ["Travel", "Gaming", "Shopping", "Sports"]) {
            await page.keyboard.press("Delete");
            await expectFocused(page, next);
        }
        await page.keyboard.press("Delete");
        await expectOutput(page, "tags", "none");
        await expect(page.getByRole("grid")).toHaveCount(0);
        const group = page.getByRole("group", { name: "Categories" });
        await expect(group).toBeFocused();
        await expect(page.getByText("No categories.")).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
        await expectNoAxeViolations(page);
    });
});

test.describe("tag-group / basic, right to left", () => {
    test("ArrowLeft and ArrowRight swap; ArrowDown does not", async ({
        page,
    }) => {
        await openScenario(page, "/tag-group/basic", { dir: "rtl" });
        await page.keyboard.press("Tab");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowLeft");
        await expectFocused(page, "Travel");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "Sports");
        await page.keyboard.press("ArrowDown");
        await expectFocused(page, "News");
    });
});

test.describe("tag-group / selection", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tag-group/selection");
    });

    test("a multiselectable grid; every row says whether it is selected", async ({
        page,
    }) => {
        const grid = page.getByRole("grid", { name: "Interests" });
        await expect(grid).toHaveAttribute("aria-multiselectable", "true");
        for (const row of await grid.getByRole("row").all()) {
            await expect(row).toHaveAttribute(
                "aria-selected",
                /^(true|false)$/,
            );
        }
        await expectSelected(page, ["Gaming"]);
    });

    test("Space and Enter toggle the focused tag; the tab stop does not follow the selection", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await expectFocused(page, "News");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "news,gaming");
        await expectOutput(page, "reason", "keyboard");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Enter");
        await expectOutput(page, "value", "news,travel,gaming");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "news,travel");
        await expectSelected(page, ["News", "Travel"]);
    });

    test("a press toggles and focuses a tag; nothing is removable", async ({
        page,
    }) => {
        await tag(page, "Shopping").click();
        await expectOutput(page, "value", "gaming,shopping");
        await expectOutput(page, "reason", "item-press");
        await expectFocused(page, "Shopping");
        await tag(page, "Gaming").click();
        await expectOutput(page, "value", "shopping");
        await tag(page, "Shopping").focus();
        await page.keyboard.press("Delete");
        await page.keyboard.press("Backspace");
        await expect(page.getByRole("row")).toHaveCount(5);
        await expectNoAxeViolations(page);
    });
});

test.describe("tag-group / single", () => {
    test("Space, Enter and a press select one tag; the selected one stays", async ({
        page,
    }) => {
        await openScenario(page, "/tag-group/single");
        const grid = page.getByRole("grid", { name: "Sort" });
        await expect(grid).not.toHaveAttribute("aria-multiselectable");
        await expect(grid.getByRole("row")).toHaveCount(3);
        await expectSelected(page, []);
        await page.keyboard.press("Tab");
        await expectFocused(page, "Newest");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "newest");
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "oldest");
        await page.keyboard.press("Enter");
        await expectSelected(page, ["Oldest"]);
        await expectOutput(page, "value", "oldest");
        await tag(page, "Popular").click();
        await expectOutput(page, "value", "popular");
        await expectSelected(page, ["Popular"]);
    });
});

test.describe("tag-group / disabled", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tag-group/disabled");
    });

    test("disabled tags are skipped by the keys and take no press", async ({
        page,
    }) => {
        for (const name of ["Travel", "Sports"]) {
            await expect(tag(page, name)).toHaveAttribute(
                "aria-disabled",
                "true",
            );
            await expect(
                page.getByRole("button", { name: `Remove ${name}` }),
            ).toBeDisabled();
        }
        await page.keyboard.press("Tab");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "Gaming");
        await page.keyboard.press("End");
        await expectFocused(page, "Shopping");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "News");
        await page.keyboard.press("ArrowLeft");
        await expectFocused(page, "Shopping");
        await tag(page, "Travel").click({ force: true });
        await expectOutput(page, "value", "none");
        await expect(tag(page, "Travel")).not.toBeFocused();
    });

    test("a removal's focus passes over the disabled tags", async ({
        page,
    }) => {
        await page.keyboard.press("Tab");
        await page.keyboard.press("ArrowRight");
        await expectFocused(page, "Gaming");
        await page.keyboard.press("Delete");
        await expectFocused(page, "Shopping");
        await page.keyboard.press("Delete");
        await expectOutput(page, "tags", "news,travel,sports");
        await expectFocused(page, "News");
        await expectNoAxeViolations(page);
    });
});

test.describe("tag-group / empty", () => {
    test("a named group with no tab stop", async ({ page }) => {
        await openScenario(page, "/tag-group/empty");
        await expect(page.getByRole("grid")).toHaveCount(0);
        // an empty List has no size: it is in the accessibility tree, not visible
        await expect(
            page.getByRole("group", { name: "Categories" }),
        ).toHaveCount(1);
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
        await expectNoAxeViolations(page);
    });
});

test.describe("tag-group / field", () => {
    test("labelled and described by the Field", async ({ page }) => {
        await openScenario(page, "/tag-group/field");
        const grid = page.getByRole("grid", { name: "Skills" });
        await expect(grid).toHaveAccessibleDescription(
            "Your strongest skills.",
        );
        await expect(grid).not.toHaveAttribute("aria-invalid");
        await page.keyboard.press("Tab");
        await expectFocused(page, "Design");
        await page.keyboard.press("Space");
        await expectOutput(page, "value", "design");
        await expectNoAxeViolations(page);
    });
});

test.describe("tag-group / form", () => {
    test("a failed submission focuses the tab stop, passing over disabledKeys", async ({
        page,
    }) => {
        await openScenario(page, "/tag-group/form");
        const grid = page.getByRole("grid", { name: "Skills" });
        await page.getByRole("button", { name: "Submit" }).click();
        await expectFocused(page, "Writing");
        await expect(grid).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByText("Choose a skill.")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
