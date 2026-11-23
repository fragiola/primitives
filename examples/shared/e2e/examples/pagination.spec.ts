import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// pagination: a results pager (spec/pagination.md). A table of 42 orders, five per page, and a
// Pagination "Orders pages" of 9 pages with Previous and Next.

test("the pager moves through the table's pages", async ({ page }) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "pagination" });
    const pager = frame.getByRole("navigation", { name: "Orders pages" });
    await expect(
        pager.getByRole("button", { name: "1", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
        pager.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    await expect(frame.getByRole("cell", { name: "#1001" })).toBeVisible();
    await pager.getByRole("button", { name: "Next page" }).click();
    await expect(
        pager.getByRole("button", { name: "2", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(frame.getByRole("cell", { name: "#1006" })).toBeVisible();
    await pager.getByRole("button", { name: "9", exact: true }).click();
    await expect(frame.getByRole("cell", { name: "#1042" })).toBeVisible();
    await expect(frame.getByRole("row")).toHaveCount(3);
    await expect(
        pager.getByRole("button", { name: "Next page" }),
    ).toBeDisabled();
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("pagination");
    await page.goto(`${EMBED_BASE}?id=pagination`);
    await expect(
        page.getByRole("navigation", { name: "Orders pages" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
