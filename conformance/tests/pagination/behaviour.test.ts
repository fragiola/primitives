import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/pagination.md
const nav = (page: Page, name: string) =>
    page.getByRole("navigation", { name, exact: true });

const button = (scope: Locator, name: string) =>
    scope.getByRole("button", { name, exact: true });

const link = (scope: Locator, name: string) =>
    scope.getByRole("link", { name, exact: true });

/** The range as the spec writes it: the page parts' texts and `…` for an ellipsis. */
async function range(scope: Locator): Promise<string> {
    return scope
        .locator(
            '[data-primitives-part="pagination-item"], [data-primitives-part="pagination-ellipsis"]',
        )
        .evaluateAll((elements) =>
            elements
                .map((element) =>
                    element.getAttribute("data-primitives-part") ===
                    "pagination-ellipsis"
                        ? "…"
                        : (element.textContent ?? "").trim(),
                )
                .join(" "),
        );
}

/** The text of every part with `aria-current="page"`. */
async function current(scope: Locator): Promise<string[]> {
    return scope
        .locator('[aria-current="page"]')
        .evaluateAll((elements) =>
            elements.map((element) => (element.textContent ?? "").trim()),
        );
}

test.describe("pagination / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/pagination/basic");
    });

    test("a named navigation with the range around page 5", async ({
        page,
    }) => {
        const results = nav(page, "Results pages");
        await expect(results).toBeVisible();
        expect(await range(results)).toBe("1 … 4 5 6 … 10");
        for (const name of ["1", "4", "5", "6", "10"]) {
            await expect(button(results, name)).toBeVisible();
        }
        expect(await current(results)).toEqual(["5"]);
        await expect(button(results, "5")).toHaveAttribute(
            "aria-current",
            "page",
        );
        await expectOutput(page, "page", "5");
        await expectOutput(page, "reason", "none");
    });

    test("a page press moves the current page and the range", async ({
        page,
    }) => {
        const results = nav(page, "Results pages");
        await button(results, "6").click();
        await expectOutput(page, "page", "6");
        await expectOutput(page, "reason", "item-press");
        expect(await current(results)).toEqual(["6"]);
        expect(await range(results)).toBe("1 … 5 6 7 … 10");
    });

    test("Next, Last, First and Previous, disabled at their edges", async ({
        page,
    }) => {
        const results = nav(page, "Results pages");
        await button(results, "6").click();
        await button(results, "Next page").click();
        await expectOutput(page, "page", "7");
        await expectOutput(page, "reason", "next-press");
        await button(results, "Last page").click();
        await expectOutput(page, "page", "10");
        await expectOutput(page, "reason", "last-press");
        expect(await range(results)).toBe("1 … 6 7 8 9 10");
        await expect(button(results, "Next page")).toBeDisabled();
        await expect(button(results, "Last page")).toBeDisabled();
        await expect(button(results, "Previous page")).toBeEnabled();
        await button(results, "First page").click();
        await expectOutput(page, "page", "1");
        await expectOutput(page, "reason", "first-press");
        await expect(button(results, "Previous page")).toBeDisabled();
        await expect(button(results, "First page")).toBeDisabled();
        expect(await range(results)).toBe("1 2 3 4 5 … 10");
    });

    test("Previous moves back one page", async ({ page }) => {
        const results = nav(page, "Results pages");
        await button(results, "Previous page").click();
        await expectOutput(page, "page", "4");
        await expectOutput(page, "reason", "previous-press");
    });

    test("the keyboard: every control in the tab order, Enter presses", async ({
        page,
    }) => {
        const results = nav(page, "Results pages");
        await button(results, "First page").focus();
        await page.keyboard.press("Tab");
        await expect(button(results, "Previous page")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(results, "1")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(button(results, "4")).toBeFocused();
        await page.keyboard.press("Enter");
        await expectOutput(page, "page", "4");
        await expectOutput(page, "reason", "item-press");
        // the current page reports nothing; the focus stays on it
        await expect(button(results, "4")).toBeFocused();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Shift+Tab");
        await expect(button(results, "3")).toBeFocused();
        await expectOutput(page, "page", "4");
        await expectOutput(page, "reason", "item-press");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("pagination / links", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/pagination/links");
    });

    test("links for ten pages, the first current, Previous aria-disabled", async ({
        page,
    }) => {
        const archive = nav(page, "Archive pages");
        expect(await range(archive)).toBe("1 2 3 4 5 6 …");
        expect(await current(archive)).toEqual(["1"]);
        await expect(link(archive, "1")).toHaveAttribute(
            "aria-current",
            "page",
        );
        const previous = link(archive, "Previous page");
        await expect(previous).toHaveAttribute("aria-disabled", "true");
        await expect(previous).not.toHaveAttribute("disabled");
        await expect(link(archive, "Next page")).not.toHaveAttribute(
            "aria-disabled",
        );
    });

    test("a disabled link does nothing", async ({ page }) => {
        const archive = nav(page, "Archive pages");
        await link(archive, "Previous page").click({ force: true });
        await expectOutput(page, "page", "none");
        expect(await page.evaluate(() => window.location.hash)).toBe("");
    });

    test("a link press moves the page and lets the link navigate", async ({
        page,
    }) => {
        const archive = nav(page, "Archive pages");
        await link(archive, "6").click();
        await expectOutput(page, "page", "6");
        await expect
            .poll(() => page.evaluate(() => window.location.hash))
            .toBe("#page-6");
        expect(await current(archive)).toEqual(["6"]);
        expect(await range(archive)).toBe("… 4 5 6 7 8 …");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
