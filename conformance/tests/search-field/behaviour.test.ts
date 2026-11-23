import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/search-field.md
const searchbox = (page: Page, name: string) =>
    page.getByRole("searchbox", { name, exact: true });

test.describe("search-field / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/search-field/basic");
    });

    test("a searchbox in a search landmark, its clear button out of the tab order", async ({
        page,
    }) => {
        const landmark = page.getByRole("search", { name: "Products" });
        const input = landmark.getByRole("searchbox", {
            name: "Search",
            exact: true,
        });
        await expect(input).toBeVisible();
        // an empty field's ClearButton is rendered, and invisible (the recipe)
        const clear = landmark.getByRole("button", {
            name: "Clear search",
            includeHidden: true,
        });
        await expect(clear).toHaveAttribute("tabindex", "-1");
        await expect(clear).toHaveAttribute(
            "aria-controls",
            (await input.getAttribute("id")) ?? "",
        );
        await expectNoAxeViolations(page);
    });

    test("typing reports the query", async ({ page }) => {
        await searchbox(page, "Search").fill("lamp");
        await expectOutput(page, "value", "lamp");
        await expectOutput(page, "reason", "input-change");
        await expectNoAxeViolations(page);
    });

    test("Escape clears, then is left to the page", async ({ page }) => {
        const input = searchbox(page, "Search");
        await input.fill("lamp");
        await page.keyboard.press("Escape");
        await expect(input).toHaveValue("");
        await expectOutput(page, "value", "");
        await expectOutput(page, "reason", "escape-key");
        await expect(input).toBeFocused();
        await expectOutput(page, "page-escape", "0");
        await page.keyboard.press("Escape");
        await expectOutput(page, "page-escape", "1");
        await expectOutput(page, "reason", "escape-key");
        await expect(input).toBeFocused();
    });

    test("Enter submits the query", async ({ page }) => {
        const input = searchbox(page, "Search");
        await input.fill("desk");
        await page.keyboard.press("Enter");
        await expectOutput(page, "submitted", "desk");
        await expectSubmitted(page, "q=desk");
    });

    test("the tab order skips the clear button", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(searchbox(page, "Search")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "Go" })).toBeFocused();
    });

    test("the clear button empties the field and focuses it", async ({
        page,
    }) => {
        const input = searchbox(page, "Search");
        await input.fill("desk");
        await page.getByRole("button", { name: "Go" }).focus();
        await page.getByRole("button", { name: "Clear search" }).click();
        await expect(input).toHaveValue("");
        await expectOutput(page, "reason", "clear-press");
        await expect(input).toBeFocused();
    });
});

test.describe("search-field / states", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/search-field/states");
    });

    test("disabled and read-only fields are not cleared", async ({ page }) => {
        await expect(searchbox(page, "Disabled search")).toBeDisabled();
        await expect(
            page.getByRole("button", { name: "Clear disabled search" }),
        ).toBeDisabled();
        const saved = searchbox(page, "Saved search");
        await expect(saved).toHaveAttribute("readonly", "");
        await expect(
            page.getByRole("button", { name: "Clear saved search" }),
        ).toBeDisabled();
        await saved.focus();
        await page.keyboard.press("Escape");
        await expect(saved).toHaveValue("tables");
        await expectOutput(page, "value", "none");
    });
});

test.describe("search-field / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/search-field/field");
    });

    test("labelled, described, validated, submitted and reset", async ({
        page,
    }) => {
        const input = searchbox(page, "City");
        await expect(input).toHaveAccessibleDescription("Where to look.");
        await expect(input).toHaveAttribute("required", "");
        await expect(input).not.toHaveAttribute("aria-invalid");
        await expectNoAxeViolations(page);

        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByText("Enter a city.")).toBeVisible();
        await expectNoAxeViolations(page);

        await input.fill("Lima");
        await expect(page.getByText("Enter a city.")).toBeHidden();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "city=Lima");

        await page.getByRole("button", { name: "Reset" }).click();
        await expect(input).toHaveValue("");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(input).toBeFocused();
        await expect(input).toHaveAttribute("aria-invalid", "true");
    });
});
