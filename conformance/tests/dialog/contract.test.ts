import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations, slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/dialog.md: anatomy, state attributes
test("dialog / basic: parts and their open state", async ({ page }) => {
    await openScenario(page, "/dialog/basic");
    const trigger = part(page, "dialog", "trigger");
    await expect(trigger).toHaveCount(1);
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    await trigger.click();
    // a trigger says its popup is open (D4 §3 "Naming"); `data-open` is the popup's own
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).not.toHaveAttribute("data-open");
    await expect(part(page, "dialog", "backdrop")).toHaveAttribute(
        "data-open",
        "",
    );
    await expect(part(page, "dialog", "backdrop")).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    const popup = part(page, "dialog", "popup");
    await expect(popup).toHaveAttribute("data-open", "");
    await expect(popup).toHaveAttribute("tabindex", "-1");
    const title = part(page, "dialog", "title");
    const description = part(page, "dialog", "description");
    await expect(popup).toHaveAttribute(
        "aria-labelledby",
        (await title.getAttribute("id")) ?? "",
    );
    await expect(popup).toHaveAttribute(
        "aria-describedby",
        (await description.getAttribute("id")) ?? "",
    );
    await expect(part(page, "dialog", "close")).toHaveCount(2);
    await expectNoFalseStates(parts(page, "dialog"));
});

// spec/README.md, "State attributes": exactly one of data-open and data-closed on the parts that
// carry them, data-closed while the exit runs; the trigger keeps data-popup-open only
test("dialog / basic: data-open, then data-closed while the exit runs", async ({
    page,
}) => {
    await openScenario(page, "/dialog/basic");
    await slowMotion(page, 600);
    const trigger = part(page, "dialog", "trigger");
    await trigger.click();
    const popup = part(page, "dialog", "popup");
    const backdrop = part(page, "dialog", "backdrop");
    await expectOpenState(popup, true);
    await expectOpenState(backdrop, true);
    await settleAnimations(page);
    await page.keyboard.press("Escape");
    await expect(popup).toHaveAttribute("data-ending-style", "");
    await expectOpenState(popup, false);
    await expectOpenState(backdrop, false);
    await expect(trigger).not.toHaveAttribute("data-closed");
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    await expect(popup).toHaveCount(0);
});

// spec/dialog.md, "Nested dialogs"
test("dialog / nested-dialogs: data-nested, data-nested-dialog-open and --nested-dialogs", async ({
    page,
}) => {
    await openScenario(page, "/dialog/nested-dialogs");
    for (const opener of ["Open first", "Open second", "Open third"]) {
        await page.getByRole("button", { name: opener }).click();
    }
    const popups = part(page, "dialog", "popup");
    const viewports = part(page, "dialog", "viewport");
    await expect(popups).toHaveCount(3);
    await expect(viewports).toHaveCount(3);
    const nestedDialogs = (index: number) =>
        popups
            .nth(index)
            .evaluate((element) =>
                getComputedStyle(element)
                    .getPropertyValue("--nested-dialogs")
                    .trim(),
            );
    const expected = [
        { nested: false, open: true, count: "2" },
        { nested: true, open: true, count: "1" },
        { nested: true, open: false, count: "0" },
    ];
    for (const [index, state] of expected.entries()) {
        for (const element of [popups.nth(index), viewports.nth(index)]) {
            if (state.nested) {
                await expect(element).toHaveAttribute("data-nested", "");
            } else {
                await expect(element).not.toHaveAttribute("data-nested");
            }
            if (state.open) {
                await expect(element).toHaveAttribute(
                    "data-nested-dialog-open",
                    "",
                );
            } else {
                await expect(element).not.toHaveAttribute(
                    "data-nested-dialog-open",
                );
            }
            await expectOpenState(element, true);
        }
        await expect.poll(() => nestedDialogs(index)).toBe(state.count);
    }
    await expect(viewports.first()).toHaveAttribute("role", "presentation");
    // the nested backdrops rendered nothing
    await expect(part(page, "dialog", "backdrop")).toHaveCount(1);
    await expect(part(page, "dialog", "backdrop")).toHaveAttribute(
        "data-nested-dialog-open",
        "",
    );
    // closing the third: the first counts one, the second none
    await page.mouse.click(5, 5);
    await expect(popups).toHaveCount(2);
    await expect.poll(() => nestedDialogs(0)).toBe("1");
    await expect(popups.nth(1)).not.toHaveAttribute("data-nested-dialog-open");
    await expect.poll(() => nestedDialogs(1)).toBe("0");
    await expectNoFalseStates(parts(page, "dialog"));
});

// spec/dialog.md, "Detached triggers": only the active trigger says its popup is open
test("dialog / detached: data-popup-open on the active trigger only", async ({
    page,
}) => {
    await openScenario(page, "/dialog/detached");
    await page.getByRole("button", { name: "Edit Grace" }).click();
    const triggers = part(page, "dialog", "trigger");
    await expect(triggers).toHaveCount(3);
    await expect(page.locator("#edit-grace")).toHaveAttribute(
        "data-popup-open",
        "",
    );
    await expect(page.locator("#edit-ada")).not.toHaveAttribute(
        "data-popup-open",
    );
    await expect(page.locator("#edit-alan")).not.toHaveAttribute(
        "data-popup-open",
    );
    await expectNoFalseStates(parts(page, "dialog"));
});
