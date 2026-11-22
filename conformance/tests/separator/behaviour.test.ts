import { expect, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/separator.md
test.describe("separator / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/separator/basic");
    });

    test("two separators in the tree, along their orientations", async ({
        page,
    }) => {
        const separators = page.getByRole("separator");
        // the decorative one is not in the tree
        await expect(separators).toHaveCount(2);
        await expect(separators.nth(0)).toHaveAttribute(
            "aria-orientation",
            "horizontal",
        );
        await expect(separators.nth(1)).toHaveAttribute(
            "aria-orientation",
            "vertical",
        );
    });

    test("the decorative separator has role none and no orientation", async ({
        page,
    }) => {
        const decorative = page.locator('[role="none"]');
        await expect(decorative).toHaveCount(1);
        await expect(decorative).not.toHaveAttribute("aria-orientation");
    });

    test("each is drawn along its orientation", async ({ page }) => {
        const separators = page.getByRole("separator");
        const horizontal = await separators.nth(0).boundingBox();
        const vertical = await separators.nth(1).boundingBox();
        expect(horizontal).not.toBeNull();
        expect(vertical).not.toBeNull();
        expect(horizontal?.width ?? 0).toBeGreaterThan(horizontal?.height ?? 0);
        expect(vertical?.height ?? 0).toBeGreaterThan(vertical?.width ?? 0);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
