import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations, slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tooltip.md: anatomy, the description relation, instant opening
test("tooltip / basic: parts, aria-describedby, instant on focus", async ({
    page,
}) => {
    await openScenario(page, "/tooltip/basic");
    const trigger = part(page, "tooltip", "trigger");
    await expect(trigger).not.toHaveAttribute("aria-describedby");
    await page.getByRole("button", { name: "Before" }).focus();
    await page.keyboard.press("Tab");
    const popup = part(page, "tooltip", "popup");
    await expect(popup).toHaveAttribute("role", "tooltip");
    await expect(popup).toHaveAttribute("data-open", "");
    await expect(popup).toHaveAttribute("data-instant", "");
    // a trigger says its popup is open (D4 §3 "Naming"); `data-open` is the popup's own
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).not.toHaveAttribute("data-open");
    await expect(trigger).toHaveAttribute(
        "aria-describedby",
        (await popup.getAttribute("id")) as string,
    );
    const positioner = part(page, "tooltip", "positioner");
    await expect(positioner).toHaveAttribute("data-side", /^(top|bottom)$/);
    await expect(positioner).toHaveAttribute("data-align", "center");
    await expect(part(page, "tooltip", "arrow")).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    await expectNoFalseStates(parts(page, "tooltip"));
});

test("tooltip / group: a hand-off opens instantly", async ({ page }) => {
    await openScenario(page, "/tooltip/group");
    await page.getByRole("button", { name: "Bold" }).hover();
    await expect(
        page.getByRole("tooltip", { name: "Bold (Ctrl+B)" }),
    ).toBeVisible();
    await expect(part(page, "tooltip", "popup")).not.toHaveAttribute(
        "data-instant",
    );
    await page.getByRole("button", { name: "Italic" }).hover();
    const italic = page.getByRole("tooltip", { name: "Italic (Ctrl+I)" });
    await expect(italic).toBeVisible();
    await expect(italic).toHaveAttribute("data-instant", "");
});

// spec/README.md, "State attributes": exactly one of data-open and data-closed, data-closed while
// the exit runs; the trigger keeps data-popup-open only
test("tooltip / basic: data-open, then data-closed while the exit runs", async ({
    page,
}) => {
    await openScenario(page, "/tooltip/basic");
    await slowMotion(page, 600);
    // a hover (a focus opens it at once, `data-instant`, which the recipe does not animate)
    await page.mouse.move(0, 0);
    await page.getByRole("button", { name: "Save" }).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await expectOpenState(part(page, "tooltip", "positioner"), true);
    await expectOpenState(part(page, "tooltip", "popup"), true);
    await expectOpenState(part(page, "tooltip", "arrow"), true);
    await settleAnimations(page);
    await page.keyboard.press("Escape");
    await expect(part(page, "tooltip", "popup")).toHaveAttribute(
        "data-ending-style",
        "",
    );
    await expectOpenState(part(page, "tooltip", "positioner"), false);
    await expectOpenState(part(page, "tooltip", "popup"), false);
    await expectOpenState(part(page, "tooltip", "arrow"), false);
    await expect(part(page, "tooltip", "trigger").first()).not.toHaveAttribute(
        "data-closed",
    );
    await expect(part(page, "tooltip", "popup")).toHaveCount(0);
});

// spec/README.md, "Detached triggers": only the active trigger says its popup is open
test("tooltip / detached: data-popup-open on the active trigger only", async ({
    page,
}) => {
    await openScenario(page, "/tooltip/detached");
    await page.getByRole("button", { name: "Call Grace" }).hover();
    await expect(page.getByRole("tooltip")).toHaveText(
        "Opens a call with Grace",
    );
    await expect(part(page, "tooltip", "trigger")).toHaveCount(2);
    await expect(page.locator("#call-grace")).toHaveAttribute(
        "data-popup-open",
        "",
    );
    await expect(page.locator("#call-ada")).not.toHaveAttribute(
        "data-popup-open",
    );
    await expectOpenState(part(page, "tooltip", "popup"), true);
    await expectNoFalseStates(parts(page, "tooltip"));
});
