import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { isInertOrHidden } from "../../src/focus.ts";
import { LIFECYCLE_OVERLAYS } from "../../src/lifecycle.ts";
import { expectOutput } from "../../src/output.ts";
import {
    isSameElement,
    markElement,
    settleAnimations,
    slowMotion,
} from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/README.md, "The lifecycle scenarios": keepMounted, onOpenChangeComplete, a canceled close
// and the actions, in every overlay

const part = (page: Page, name: string) =>
    page.locator(`[data-primitives-part="${name}"]`);

for (const [name, overlay] of Object.entries(LIFECYCLE_OVERLAYS)) {
    test.describe(`lifecycle / ${name}`, () => {
        const popup = (page: Page) => page.getByRole(overlay.role);

        test("is kept mounted, hidden, before the first opening", async ({
            page,
        }) => {
            await openScenario(page, overlay.path, { today: overlay.today });
            await expect(part(page, overlay.kept)).toHaveCount(1);
            await expect(part(page, overlay.kept)).toHaveAttribute(
                "hidden",
                "",
            );
            await expect(part(page, overlay.popup)).toHaveAttribute(
                "data-closed",
                "",
            );
            await expect(part(page, overlay.popup)).not.toHaveAttribute(
                "data-open",
            );
            await expect(popup(page)).toHaveCount(0);
            await expectOutput(page, "complete", "none");
        });

        test("opens the same element, and reports complete once entered", async ({
            page,
        }) => {
            await openScenario(page, overlay.path, { today: overlay.today });
            await slowMotion(page, 600);
            await markElement(page, overlay.popup);
            await overlay.open(page);
            await expect(popup(page)).toBeVisible();
            await expectOutput(page, "open", "true");
            // the enter transition lasts 600ms
            await expectOutput(page, "complete", "none");
            await expectOutput(page, "complete", "true");
            expect(await isSameElement(page, overlay.popup)).toBe(true);
            await expect(part(page, overlay.kept)).not.toHaveAttribute(
                "hidden",
            );
        });

        test("a close reports complete false only once its exit ended; the element stays", async ({
            page,
        }) => {
            await openScenario(page, overlay.path, { today: overlay.today });
            await slowMotion(page, 600);
            await markElement(page, overlay.popup);
            await overlay.open(page);
            await expectOutput(page, "complete", "true");
            await settleAnimations(page);
            await page.keyboard.press("Escape");
            await expectOutput(page, "open", "false");
            await expectOutput(page, "reason", "escape-key");
            await expect(part(page, overlay.popup)).toHaveAttribute(
                "data-ending-style",
                "",
            );
            // the exit runs: not complete yet
            await expectOutput(page, "complete", "true");
            await expectOutput(page, "complete", "false");
            await expect(part(page, overlay.kept)).toHaveAttribute(
                "hidden",
                "",
            );
            await expect(part(page, overlay.popup)).toHaveAttribute(
                "data-closed",
                "",
            );
            await expect(popup(page)).toHaveCount(0);
            expect(await isSameElement(page, overlay.popup)).toBe(true);
        });

        test("reopened, it is the same element, open again", async ({
            page,
        }) => {
            await openScenario(page, overlay.path, { today: overlay.today });
            await markElement(page, overlay.popup);
            await overlay.open(page);
            await expect(popup(page)).toBeVisible();
            await page.keyboard.press("Escape");
            await expectOutput(page, "complete", "false");
            await overlay.open(page);
            await expect(popup(page)).toBeVisible();
            await expectOutput(page, "complete", "true");
            expect(await isSameElement(page, overlay.popup)).toBe(true);
        });

        test("?cancel keeps it open and working after Escape", async ({
            page,
        }) => {
            await openScenario(page, overlay.path, {
                today: overlay.today,
                cancel: true,
            });
            await overlay.open(page);
            await expect(popup(page)).toBeVisible();
            await page.keyboard.press("Escape");
            await expectOutput(page, "canceled", "escape-key");
            await expectOutput(page, "open", "true");
            await expect(popup(page)).toBeVisible();
            if (overlay.outsidePress === true) {
                await page.mouse.click(5, 5);
                await expectOutput(page, "canceled", "outside-press");
                await expect(popup(page)).toBeVisible();
            } else if (overlay.outsidePress === "never") {
                // an alert dialog: the press reports nothing (spec/alert-dialog.md)
                await page.mouse.click(5, 5);
                await page.waitForTimeout(200);
                await expectOutput(page, "canceled", "escape-key");
                await expectOutput(page, "open", "true");
                await expect(popup(page)).toBeVisible();
            } else {
                // a tooltip: the pointer leaving
                await page.mouse.move(600, 500);
                await expectOutput(page, "canceled", "trigger-hover");
                await expect(popup(page)).toBeVisible();
            }
            // still working: the next Escape is canceled again
            await page.keyboard.press("Escape");
            await expectOutput(page, "canceled", "escape-key");
            await expectOutput(page, "open", "true");
            await expect(popup(page)).toBeVisible();
        });

        if (overlay.actions) {
            test("the actions' close closes it with imperative-action", async ({
                page,
            }) => {
                await openScenario(page, overlay.path);
                await overlay.open(page);
                await expect(popup(page)).toBeVisible();
                await page
                    .getByRole("button", { name: "Close with actions" })
                    .click();
                await expectOutput(page, "open", "false");
                await expectOutput(page, "reason", "imperative-action");
                await expect(popup(page)).toHaveCount(0);
                await expect(overlay.trigger(page)).toBeFocused();
            });
        }

        test("has no axe violation, kept mounted and open", async ({
            page,
        }) => {
            await openScenario(page, overlay.path, { today: overlay.today });
            await expectNoAxeViolations(page);
            await overlay.open(page);
            await expect(popup(page)).toBeVisible();
            await expectNoAxeViolations(page);
        });
    });
}

test("lifecycle / dialog ?cancel: Close is canceled too, and the outside stays inert", async ({
    page,
}) => {
    await openScenario(page, "/dialog/lifecycle", { cancel: true });
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog", { name: "Lifecycle" });
    await expect(dialog).toBeVisible();
    await page.getByRole("button", { name: "Close", exact: true }).click();
    await expectOutput(page, "canceled", "close-press");
    await expect(dialog).toBeVisible();
    expect(
        await isInertOrHidden(
            page.getByRole("button", {
                name: "Open dialog",
                includeHidden: true,
            }),
        ),
    ).toBe(true);
});

test("lifecycle / date-picker: reopened, the kept calendar focuses today", async ({
    page,
}) => {
    await openScenario(page, "/date-picker/lifecycle", { today: true });
    const trigger = page.getByRole("button", { name: "Choose date: none" });
    await trigger.click();
    const today = page.getByRole("gridcell", {
        name: "Friday, November 20, 2026",
    });
    await expect(today).toBeFocused();
    await page.keyboard.press("Escape");
    await expectOutput(page, "complete", "false");
    await trigger.click();
    await expect(today).toBeFocused();
});
