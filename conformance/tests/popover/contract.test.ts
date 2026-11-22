import { expect, type Page, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations, slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/popover.md: anatomy, state attributes, positioning attributes
test("popover / basic: parts, side and align, anchor variables", async ({
    page,
}) => {
    await openScenario(page, "/popover/basic");
    const trigger = part(page, "popover", "trigger");
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    await trigger.click();
    // a trigger says its popup is open (D4 §3 "Naming"); `data-open` is the popup's own
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).not.toHaveAttribute("data-open");
    const positioner = part(page, "popover", "positioner");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "center");
    await expect(positioner).toHaveAttribute("data-open", "");
    const anchorWidth = await positioner.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--anchor-width"),
    );
    expect(anchorWidth.trim()).toMatch(/px$/);
    const popup = part(page, "popover", "popup");
    await expect(popup).toHaveAttribute("data-side", "bottom");
    await expect(popup).toHaveAttribute("data-open", "");
    await expect(popup).not.toHaveAttribute("aria-modal");
    await expect(part(page, "popover", "title")).toHaveCount(1);
    await expect(part(page, "popover", "description")).toHaveCount(1);
    await expect(part(page, "popover", "close")).toHaveCount(1);
    await expectNoFalseStates(parts(page, "popover"));
});

async function sideOf(page: Page, label: string) {
    await page.getByRole("button", { name: label, exact: true }).click();
    return part(page, "popover", "popup");
}

test.describe("popover / placement: the side it ended up on, named as asked", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/popover/placement");
    });

    test("a flipped bottom is top", async ({ page }) => {
        await expect(await sideOf(page, "Flip")).toHaveAttribute(
            "data-side",
            "top",
        );
    });

    test("a logical side stays logical", async ({ page }) => {
        await expect(await sideOf(page, "Inline end")).toHaveAttribute(
            "data-side",
            "inline-end",
        );
    });

    test("a physical side stays physical", async ({ page }) => {
        await expect(await sideOf(page, "Left")).toHaveAttribute(
            "data-side",
            "left",
        );
    });
});

test("popover / rtl: the sides keep their names", async ({ page }) => {
    await openScenario(page, "/popover/rtl", { dir: "rtl" });
    await expect(await sideOf(page, "Inline end")).toHaveAttribute(
        "data-side",
        "inline-end",
    );
    await page.keyboard.press("Escape");
    await expect(part(page, "popover", "popup")).toHaveCount(0);
    await expect(await sideOf(page, "Left")).toHaveAttribute(
        "data-side",
        "left",
    );
});

test("popover / arrow: hidden and sided", async ({ page }) => {
    await openScenario(page, "/popover/arrow");
    await page.getByRole("button", { name: "With arrow" }).click();
    const arrow = part(page, "popover", "arrow");
    await expect(arrow).toHaveAttribute("aria-hidden", "true");
    await expect(arrow).toHaveAttribute("data-side", "bottom");
    await expect(arrow).toHaveAttribute("data-align", "center");
});

// spec/README.md, "State attributes": exactly one of data-open and data-closed, data-closed while
// the exit runs; the trigger keeps data-popup-open only
test("popover / arrow: data-open, then data-closed while the exit runs", async ({
    page,
}) => {
    await openScenario(page, "/popover/arrow");
    await slowMotion(page, 600);
    await page.getByRole("button", { name: "With arrow" }).click();
    await expectOpenState(part(page, "popover", "positioner"), true);
    await expectOpenState(part(page, "popover", "popup"), true);
    await expectOpenState(part(page, "popover", "arrow"), true);
    await settleAnimations(page);
    await page.keyboard.press("Escape");
    await expect(part(page, "popover", "popup")).toHaveAttribute(
        "data-ending-style",
        "",
    );
    await expectOpenState(part(page, "popover", "positioner"), false);
    await expectOpenState(part(page, "popover", "popup"), false);
    await expectOpenState(part(page, "popover", "arrow"), false);
    await expect(part(page, "popover", "trigger").first()).not.toHaveAttribute(
        "data-closed",
    );
    await expect(part(page, "popover", "popup")).toHaveCount(0);
});

// spec/README.md, "Detached triggers": only the active trigger says its popup is open
test("popover / detached: data-popup-open on the active trigger only", async ({
    page,
}) => {
    await openScenario(page, "/popover/detached");
    await page.getByRole("button", { name: "Info for Ada" }).click();
    await page.getByRole("button", { name: "Info for Grace" }).click();
    await expect(
        page.getByRole("dialog", { name: "About Grace" }),
    ).toBeVisible();
    await expect(part(page, "popover", "trigger")).toHaveCount(2);
    await expect(page.locator("#info-grace")).toHaveAttribute(
        "data-popup-open",
        "",
    );
    await expect(page.locator("#info-ada")).not.toHaveAttribute(
        "data-popup-open",
    );
    await expectOpenState(part(page, "popover", "popup"), true);
    await expectNoFalseStates(parts(page, "popover"));
});
