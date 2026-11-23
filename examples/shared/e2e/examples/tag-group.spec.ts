import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// tag-group: filter tags (spec/tag-group.md). A TagGroup labelled "Topics", `selectionMode`
// "multiple", of the tags "Design", "Engineering", "Research" and "Writing" (none selected), each
// a TagCell with its name and a RemoveButton "Remove <name>" (text "×"); the app removes a tag on
// `onRemove` (and drops it from the selection), and shows "No topics left." in the Root once none
// is left. Then a list "Articles" of six articles, each with its topic: "Color systems that scale"
// and "Type for the screen" (Design), "Profiling a slow render" and "A token pipeline"
// (Engineering), "Interviewing fifty users" (Research), "Release notes people read" (Writing);
// the selected topics narrow it (none selected: every remaining topic's articles), and a status
// "Showing <n> of 6 articles.".

/** A tag's row: its name is its text then its remove button's ("Design Remove Design"). */
const tagName = (name: string) => new RegExp(`^${name}\\b`);

test("selecting topics narrows the articles; the arrows move between the tags", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "tag-group" });
    const grid = frame.getByRole("grid", { name: "Topics" });
    const tag = (name: string) =>
        grid.getByRole("row", { name: tagName(name) });
    const articles = frame.getByRole("list", { name: "Articles" });
    const status = frame.getByRole("status");
    await expect(grid).toHaveAttribute(
        "data-primitives-part",
        "tag-group-list",
    );
    await expect(grid).toHaveAttribute("aria-multiselectable", "true");
    await expect(grid.getByRole("row")).toHaveCount(4);
    await expect(grid.getByRole("gridcell")).toHaveCount(4);
    for (const name of ["Design", "Engineering", "Research", "Writing"]) {
        await expect(tag(name)).toHaveAttribute("aria-selected", "false");
        await expect(
            tag(name).getByRole("button", { name: `Remove ${name}` }),
        ).toBeVisible();
    }
    await expect(articles.getByRole("listitem")).toHaveCount(6);
    await expect(status).toHaveText("Showing 6 of 6 articles.");

    // a press selects (and focuses) a tag; the articles follow
    await tag("Design").click();
    await expect(tag("Design")).toHaveAttribute("aria-selected", "true");
    await expect(tag("Design")).toHaveAttribute("data-selected", "");
    await expect(tag("Design")).toBeFocused();
    await expect(articles.getByRole("listitem")).toHaveCount(2);
    await expect(status).toHaveText("Showing 2 of 6 articles.");

    // the arrows move the focus only; Space and Enter toggle the focused tag
    await page.keyboard.press("ArrowRight");
    await expect(tag("Engineering")).toBeFocused();
    await expect(tag("Engineering")).toHaveAttribute("aria-selected", "false");
    await page.keyboard.press("Space");
    await expect(tag("Engineering")).toHaveAttribute("aria-selected", "true");
    await expect(status).toHaveText("Showing 4 of 6 articles.");
    await page.keyboard.press("End");
    await expect(tag("Writing")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tag("Design")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(tag("Writing")).toBeFocused();
    await page.keyboard.press("Home");
    await expect(tag("Design")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(tag("Design")).toHaveAttribute("aria-selected", "false");
    await expect(articles.getByRole("listitem")).toHaveCount(2);
    await expect(articles).toContainText("Profiling a slow render");

    // one tab stop: the focused tag
    await expect(
        frame.locator(`${part("tag-group-tag")}[tabindex="0"]`),
    ).toHaveCount(1);
    await expect(tag("Design")).toHaveAttribute("tabindex", "0");
    expect(errors).toEqual([]);
});

test("Delete, Backspace and a remove button drop a tag; the last one leaves the empty message", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "tag-group" });
    const grid = frame.getByRole("grid", { name: "Topics" });
    const tag = (name: string) =>
        grid.getByRole("row", { name: tagName(name) });
    const status = frame.getByRole("status");

    // a selected tag's removal drops it from the selection and its articles from the list
    await tag("Engineering").click();
    await expect(status).toHaveText("Showing 2 of 6 articles.");
    await page.keyboard.press("Delete");
    await expect(grid.getByRole("row")).toHaveCount(3);
    await expect(tag("Research")).toBeFocused();
    await expect(status).toHaveText("Showing 4 of 6 articles.");
    for (const name of ["Design", "Research", "Writing"]) {
        await expect(tag(name)).toHaveAttribute("aria-selected", "false");
    }

    // the remove button: the focus moves to the next tag
    await tag("Design").getByRole("button", { name: "Remove Design" }).click();
    await expect(grid.getByRole("row")).toHaveCount(2);
    await expect(tag("Research")).toBeFocused();
    await expect(status).toHaveText("Showing 2 of 6 articles.");

    // Backspace on the last tag: the focus moves to the one before it
    await page.keyboard.press("End");
    await expect(tag("Writing")).toBeFocused();
    await page.keyboard.press("Backspace");
    await expect(tag("Research")).toBeFocused();
    await page.keyboard.press("Delete");

    // no tag left: the List is a named group that keeps the focus, and the message shows
    await expect(frame.getByRole("grid")).toHaveCount(0);
    const group = frame.getByRole("group", { name: "Topics" });
    await expect(group).toBeFocused();
    await expect(group).toHaveAttribute("data-empty", "");
    await expect(frame.locator(part("tag-group-root"))).toHaveAttribute(
        "data-empty",
        "",
    );
    await expect(frame.getByText("No topics left.")).toBeVisible();
    await expect(status).toHaveText("Showing 0 of 6 articles.");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("tag-group");
    await page.goto(`${EMBED_BASE}?id=tag-group`);
    await expect(page.getByRole("grid")).toBeVisible();
    await page.getByRole("row", { name: tagName("Research") }).click();
    expect(await axeViolations(page)).toEqual([]);
});
