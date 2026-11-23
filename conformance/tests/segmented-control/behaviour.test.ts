import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectSubmitted } from "../../src/form.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/segmented-control.md
const item = (page: Page, name: string) =>
    page.getByRole("radio", { name, exact: true });

/** The Item is the only checked one, and has the focus. */
async function expectChecked(page: Page, name: string): Promise<void> {
    await expect(item(page, name)).toBeFocused();
    await expect(item(page, name)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByRole("radio", { checked: true })).toHaveCount(1);
}

test.describe("segmented-control / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/segmented-control/basic");
    });

    test("a named horizontal radiogroup of four radios, the default checked", async ({
        page,
    }) => {
        const root = page.getByRole("radiogroup", { name: "View" });
        await expect(root).toHaveAttribute("aria-orientation", "horizontal");
        // the hidden input is not in the tree
        await expect(page.getByRole("radio")).toHaveCount(4);
        await expect(item(page, "List")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(1);
        await expect(item(page, "Board")).toBeDisabled();
    });

    test("one tab stop, at the checked radio", async ({ page }) => {
        await page.keyboard.press("Tab");
        await expect(item(page, "List")).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("button", { name: "Submit" }),
        ).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(item(page, "List")).toBeFocused();
    });

    test("the arrows move the focus and the check, skip the disabled radio and wrap", async ({
        page,
    }) => {
        await item(page, "List").focus();
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "Grid");
        await expectOutput(page, "value", "grid");
        await expectOutput(page, "reason", "keyboard");
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "Timeline");
        await page.keyboard.press("ArrowRight");
        await expectChecked(page, "List");
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "Timeline");
        await page.keyboard.press("ArrowDown");
        await expectChecked(page, "List");
        await page.keyboard.press("ArrowUp");
        await expectChecked(page, "Timeline");
        await expectOutput(page, "value", "timeline");
    });

    test("Space and Enter on the checked radio change nothing and submit nothing", async ({
        page,
    }) => {
        await item(page, "List").focus();
        await page.keyboard.press("ArrowLeft");
        await expectChecked(page, "Timeline");
        await page.keyboard.press("Space");
        await page.keyboard.press("Enter");
        await expectChecked(page, "Timeline");
        await expectOutput(page, "value", "timeline");
        await expectOutput(page, "reason", "keyboard");
        await expectSubmitted(page, "none");
    });

    test("a click checks and focuses a radio; a disabled one ignores it", async ({
        page,
    }) => {
        await item(page, "Grid").click();
        await expectChecked(page, "Grid");
        await expectOutput(page, "value", "grid");
        await expectOutput(page, "reason", "item-press");
        // forced: the press must reach the disabled radio, which then does nothing
        await item(page, "Board").click({ force: true });
        await expect(item(page, "Board")).toHaveAttribute(
            "aria-checked",
            "false",
        );
        await expectOutput(page, "value", "grid");
    });

    test("the form submits the checked value", async ({ page }) => {
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "view=list");
        await item(page, "Grid").click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "view=grid");
    });

    test("a form reset returns it to its default", async ({ page }) => {
        await item(page, "Timeline").click();
        await expectOutput(page, "value", "timeline");
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(item(page, "List")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(1);
        await expectOutput(page, "value", "list");
        await expectOutput(page, "reason", "none");
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "view=list");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test("segmented-control / basic?dir=rtl: ArrowLeft is the next radio, ArrowDown still the next", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/basic", { dir: "rtl" });
    await item(page, "List").focus();
    await page.keyboard.press("ArrowLeft");
    await expectChecked(page, "Grid");
    await page.keyboard.press("ArrowLeft");
    await expectChecked(page, "Timeline");
    await page.keyboard.press("ArrowRight");
    await expectChecked(page, "Grid");
    await page.keyboard.press("ArrowDown");
    await expectChecked(page, "Timeline");
});

test("segmented-control / vertical: every arrow works, and stops at the ends", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/vertical");
    await expect(
        page.getByRole("radiogroup", { name: "Period" }),
    ).toHaveAttribute("aria-orientation", "vertical");
    await item(page, "Day").focus();
    await page.keyboard.press("ArrowDown");
    await expectChecked(page, "Week");
    await expectOutput(page, "value", "week");
    await page.keyboard.press("ArrowRight");
    await expectChecked(page, "Month");
    // `loopFocus` false: the end stays
    await page.keyboard.press("ArrowDown");
    await expectChecked(page, "Month");
    await expectOutput(page, "value", "month");
    await page.keyboard.press("ArrowUp");
    await expectChecked(page, "Week");
});

test.describe("segmented-control / disabled", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/segmented-control/disabled");
    });

    test("every radio is disabled and out of the tab order", async ({
        page,
    }) => {
        await expect(
            page.getByRole("radiogroup", { name: "View" }),
        ).toHaveAttribute("aria-disabled", "true");
        for (const radio of await page.getByRole("radio").all()) {
            await expect(radio).toBeDisabled();
        }
        await expect(item(page, "Grid")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "After" })).toBeFocused();
    });

    test("a click changes nothing", async ({ page }) => {
        await item(page, "List").click({ force: true });
        await expect(item(page, "Grid")).toHaveAttribute(
            "aria-checked",
            "true",
        );
        await expectOutput(page, "value", "none");
    });
});

test.describe("segmented-control / field", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/segmented-control/field");
    });

    test("labelled and described by the Field, required, none checked", async ({
        page,
    }) => {
        const root = page.getByRole("radiogroup", { name: "Density" });
        await expect(root).toHaveAccessibleDescription("Spacing of the rows.");
        await expect(root).toHaveAttribute("aria-required", "true");
        await expect(root).not.toHaveAttribute("aria-invalid");
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await expectNoAxeViolations(page);
    });

    test("required blocks the submission, focuses the first radio and shows the error", async ({
        page,
    }) => {
        const root = page.getByRole("radiogroup", { name: "Density" });
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
        await expect(item(page, "Compact")).toBeFocused();
        await expect(root).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByText("Choose a density.")).toBeVisible();
        await expectNoAxeViolations(page);

        await item(page, "Comfortable").click();
        await expect(page.getByText("Choose a density.")).toBeHidden();
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "density=comfortable");
    });

    test("a form reset returns it to none checked", async ({ page }) => {
        await item(page, "Spacious").click();
        await page.getByRole("button", { name: "Reset" }).click();
        await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);
        await page.getByRole("button", { name: "Submit" }).click();
        await expectSubmitted(page, "none");
    });
});
