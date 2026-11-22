import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/alert-dialog.md: Dialog's parts, named alert-dialog-*
test("alert-dialog / basic: parts and states", async ({ page }) => {
    await openScenario(page, "/alert-dialog/basic");
    await expect(part(page, "alert-dialog", "trigger")).toHaveCount(1);
    await expect(part(page, "dialog", "trigger")).toHaveCount(0);
    await part(page, "alert-dialog", "trigger").click();
    const popup = part(page, "alert-dialog", "popup");
    await expect(popup).toHaveAttribute("role", "alertdialog");
    await expect(popup).toHaveAttribute("aria-modal", "true");
    await expect(popup).toHaveAttribute("tabindex", "-1");
    await expect(popup).not.toHaveAttribute("data-nested");
    await expectOpenState(popup, true);
    await expectOpenState(part(page, "alert-dialog", "backdrop"), true);
    await expect(part(page, "alert-dialog", "trigger")).toHaveAttribute(
        "data-popup-open",
        "",
    );
    await expect(part(page, "alert-dialog", "title")).toHaveAttribute(
        "id",
        /.+/,
    );
    await expect(part(page, "alert-dialog", "description")).toHaveCount(1);
    await expect(part(page, "alert-dialog", "close")).toHaveCount(1);
    await expect(part(page, "dialog", "popup")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "alert-dialog"));
});

test("alert-dialog / detached: only the active trigger says it is open", async ({
    page,
}) => {
    await openScenario(page, "/alert-dialog/detached");
    await page.getByRole("button", { name: "Delete Grace" }).click();
    const triggers = part(page, "alert-dialog", "trigger");
    await expect(triggers).toHaveCount(2);
    await expect(triggers.nth(0)).not.toHaveAttribute("data-popup-open");
    await expect(triggers.nth(1)).toHaveAttribute("data-popup-open", "");
    const viewport = part(page, "alert-dialog", "viewport");
    await expect(viewport).toHaveAttribute("role", "presentation");
    await expectOpenState(viewport, true);
    await expectNoFalseStates(parts(page, "alert-dialog"));
});
