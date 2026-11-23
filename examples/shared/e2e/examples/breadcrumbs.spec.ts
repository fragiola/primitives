import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// breadcrumbs: a router-linked breadcrumb (spec/breadcrumbs.md). The router starts at
// /docs/components/breadcrumbs; the trail "Breadcrumb" is built from its path: a Link for each
// parent page (Home, Docs, Components) rendered through the router, the current page a Current.
// Under it, the page's heading and a list "Child pages" of plain router links.

test("the trail follows the router's path", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "breadcrumbs" });
    const trail = frame.getByRole("navigation", { name: "Breadcrumb" });
    await expect(trail.getByRole("link")).toHaveText([
        "Home",
        "Docs",
        "Components",
    ]);
    await expect(
        trail.getByText("Breadcrumbs", { exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
        frame.getByRole("heading", { name: "Breadcrumbs" }),
    ).toBeVisible();
    await trail.getByRole("link", { name: "Docs" }).click();
    await expect(frame.getByRole("heading", { name: "Docs" })).toBeVisible();
    await expect(trail.getByRole("link")).toHaveText(["Home"]);
    await expect(trail.getByText("Docs", { exact: true })).toHaveAttribute(
        "aria-current",
        "page",
    );
    await frame
        .getByRole("list", { name: "Child pages" })
        .getByRole("link", { name: "Components" })
        .click();
    await expect(
        frame.getByRole("heading", { name: "Components" }),
    ).toBeVisible();
    await expect(trail.getByRole("link")).toHaveText(["Home", "Docs"]);
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("breadcrumbs");
    await page.goto(`${EMBED_BASE}?id=breadcrumbs`);
    await expect(
        page.getByRole("navigation", { name: "Breadcrumb" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
