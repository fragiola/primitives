import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// link: a docs navigation (spec/link.md). A navigation "Docs" of four Links rendered through the
// framework's own router: "Getting started" (the page at first), "Guides", "API reference", and
// "Changelog", disabled; the page's heading follows the router's route.

test("the router's links move between the pages, the current one marked", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "link" });
    const nav = frame.getByRole("navigation", { name: "Docs" });
    const link = (name: string) => nav.getByRole("link", { name, exact: true });
    await expect(link("Getting started")).toHaveAttribute(
        "aria-current",
        "page",
    );
    await expect(
        frame.getByRole("heading", { name: "Getting started" }),
    ).toBeVisible();
    await link("Guides").click();
    await expect(frame.getByRole("heading", { name: "Guides" })).toBeVisible();
    await expect(link("Guides")).toHaveAttribute("aria-current", "page");
    await expect(link("Getting started")).not.toHaveAttribute("aria-current");
    const changelog = link("Changelog");
    await expect(changelog).toHaveAttribute("aria-disabled", "true");
    await changelog.click({ force: true });
    await expect(frame.getByRole("heading", { name: "Guides" })).toBeVisible();
    await expect(link("Guides")).toHaveAttribute("aria-current", "page");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("link");
    await page.goto(`${EMBED_BASE}?id=link`);
    await expect(page.getByRole("navigation", { name: "Docs" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
