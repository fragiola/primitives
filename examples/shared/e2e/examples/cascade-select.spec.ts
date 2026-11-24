import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    promoted,
    requireExamples,
} from "../helpers.ts";

// cascade-select: a city chosen through its region and country (spec/cascade-select.md). A
// required CascadeSelect in a Field `name="city"` (Label "City", Error "Choose a city."); regions
// Americas, Asia, Europe; "Save" prints "Saved: <path>". Non-modal: never promoted.

test("the keyboard opens a level per step and chooses a city; Save submits the path", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "cascade-select" });
    const trigger = frame.getByRole("combobox", { name: "City" });
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "cascade-select-trigger",
    );
    await expect(trigger).toHaveText("Choose a city");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    const levels = frame.getByRole("listbox");
    await expect(levels).toHaveCount(1);
    await expect(levels.first().getByRole("option")).toHaveText([
        "Americas",
        "Asia",
        "Europe",
    ]);
    expect(await promoted(page)).toBe(false);
    await expect(trigger).toBeFocused();

    // typeahead in the level, then Right opens the next one
    await page.keyboard.press("e");
    await expect(frame.getByRole("option", { name: "Europe" })).toHaveAttribute(
        "data-highlighted",
        "",
    );
    await page.keyboard.press("ArrowRight");
    await expect(levels).toHaveCount(2);
    await expect(levels.nth(1).getByRole("option")).toHaveText([
        "France",
        "Portugal",
    ]);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(levels).toHaveCount(3);
    await expect(levels.nth(2).getByRole("option")).toHaveText([
        "Lisbon",
        "Porto",
    ]);
    // Left goes back a level
    await page.keyboard.press("ArrowLeft");
    await expect(levels).toHaveCount(2);
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(levels).toHaveCount(0);
    await expect(trigger).toHaveText("Europe / Portugal / Porto");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: europe/portugal/porto",
    );
    expect(errors).toEqual([]);
});

test("a hover opens a level; saving with no city shows the error", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "cascade-select" });
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByText("Choose a city.")).toBeVisible();
    await expect(frame.getByRole("status")).toHaveText("");

    const trigger = frame.getByRole("combobox", { name: "City" });
    await trigger.click();
    await frame.getByRole("option", { name: "Asia" }).hover();
    await expect(frame.getByRole("option", { name: "Japan" })).toBeVisible();
    await frame.getByRole("option", { name: "Japan" }).hover();
    await frame.getByRole("option", { name: "Tokyo" }).click();
    await expect(frame.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toHaveText("Asia / Japan / Tokyo");
    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByText("Choose a city.")).toBeHidden();
    await expect(frame.getByRole("status")).toHaveText(
        "Saved: asia/japan/tokyo",
    );
});

test("axe finds no violation with two levels open", async ({ page }) => {
    requireExamples("cascade-select");
    await page.goto(`${EMBED_BASE}?id=cascade-select`);
    const trigger = page.getByRole("combobox", { name: "City" });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("listbox")).toHaveCount(2);
    expect(await axeViolations(page)).toEqual([]);
});
