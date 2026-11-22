import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { centreOf, cssVariable, mouseDrag } from "../../src/swipe.ts";

// spec/drawer.md: Dialog's parts named drawer-*, the swipe's attributes and variables
test("drawer / basic: parts and states", async ({ page }) => {
    await openScenario(page, "/drawer/basic");
    await expect(part(page, "drawer", "trigger")).toHaveCount(1);
    await expect(part(page, "dialog", "trigger")).toHaveCount(0);
    await part(page, "drawer", "trigger").click();
    const popup = part(page, "drawer", "popup");
    await expect(popup).toHaveAttribute("role", "dialog");
    await expect(popup).toHaveAttribute("aria-modal", "true");
    await expect(popup).toHaveAttribute("tabindex", "-1");
    await expect(popup).toHaveAttribute("data-swipe-direction", "down");
    await expect(popup).toHaveAttribute("data-expanded", "");
    await expect(popup).not.toHaveAttribute("data-swiping");
    await expect(popup).not.toHaveAttribute("data-nested");
    await expectOpenState(popup, true);
    await expectOpenState(part(page, "drawer", "backdrop"), true);
    await expectOpenState(part(page, "drawer", "viewport"), true);
    await expect(part(page, "drawer", "viewport")).toHaveAttribute(
        "role",
        "presentation",
    );
    await expect(part(page, "drawer", "content")).toHaveCount(1);
    await expect(part(page, "drawer", "title")).toHaveAttribute("id", /.+/);
    await expect(part(page, "drawer", "description")).toHaveCount(1);
    await expect(part(page, "drawer", "close")).toHaveCount(1);
    await expect(part(page, "dialog", "popup")).toHaveCount(0);
    for (const [name, value] of [
        ["--drawer-swipe-movement-x", "0px"],
        ["--drawer-swipe-movement-y", "0px"],
        ["--drawer-snap-point-offset", "0px"],
        ["--drawer-swipe-progress", "0"],
        ["--nested-drawers", "0"],
    ] as const) {
        expect(await cssVariable(popup, name)).toBe(value);
    }
    await expectNoFalseStates(parts(page, "drawer"));
});

test("drawer / basic: data-swiping and the progress while a swipe runs, data-swipe-dismiss after", async ({
    page,
}) => {
    await openScenario(page, "/drawer/basic");
    await part(page, "drawer", "trigger").click();
    await settleAnimations(page);
    const popup = part(page, "drawer", "popup");
    const height = (await popup.boundingBox())?.height ?? 0;
    const start = await centreOf(page.getByTestId("drawer-handle"));
    const release = await mouseDrag(
        page,
        page.getByTestId("drawer-handle"),
        0,
        Math.round(height / 2),
        { hold: true },
    );
    for (const name of ["popup", "backdrop", "viewport"]) {
        await expect(part(page, "drawer", name)).toHaveAttribute(
            "data-swiping",
            "",
        );
    }
    const progress = Number(
        await cssVariable(
            part(page, "drawer", "backdrop"),
            "--drawer-swipe-progress",
        ),
    );
    expect(Math.abs(progress - 0.5)).toBeLessThan(0.02);
    await expectNoFalseStates(parts(page, "drawer"));
    await page.addStyleTag({
        content: ":root { --pr-motion: 600ms !important; }",
    });
    // past half: it dismisses, and exits with data-swipe-dismiss
    await page.mouse.move(start.x, start.y + Math.round(height * 0.7));
    await release();
    await expect(popup).toHaveAttribute("data-swipe-dismiss", "");
    await expectOpenState(popup, false);
    await expect(popup).not.toHaveAttribute("data-swiping");
});

test("drawer / side: data-swipe-direction", async ({ page }) => {
    await openScenario(page, "/drawer/side");
    await part(page, "drawer", "trigger").click();
    await expect(part(page, "drawer", "popup")).toHaveAttribute(
        "data-swipe-direction",
        "right",
    );
});

test("drawer / snap-points: the offset of the active snap point and data-expanded", async ({
    page,
}) => {
    await openScenario(page, "/drawer/snap-points");
    await part(page, "drawer", "trigger").click();
    const popup = part(page, "drawer", "popup");
    await expect(popup).toHaveAttribute("data-open", "");
    expect(await cssVariable(popup, "--drawer-snap-point-offset")).toBe(
        "360px",
    );
    await expect(popup).not.toHaveAttribute("data-expanded");
});

test("drawer / nested: data-nested, data-nested-drawer-open and --nested-drawers", async ({
    page,
}) => {
    await openScenario(page, "/drawer/nested");
    await page.getByRole("button", { name: "Open order" }).click();
    await page.getByRole("button", { name: "Edit address" }).click();
    const popups = part(page, "drawer", "popup");
    await expect(popups).toHaveCount(2);
    const [outer, inner] = [popups.nth(0), popups.nth(1)];
    await expect(outer).toHaveAttribute("data-nested-drawer-open", "");
    await expect(outer).not.toHaveAttribute("data-nested-dialog-open");
    await expect(outer).not.toHaveAttribute("data-nested");
    expect(await cssVariable(outer, "--nested-drawers")).toBe("1");
    await expect(inner).toHaveAttribute("data-nested", "");
    // a nested drawer's Backdrop renders nothing without forceRender
    await expect(part(page, "drawer", "backdrop")).toHaveCount(1);
    await expectNoFalseStates(parts(page, "drawer"));
    await page.keyboard.press("Escape");
    await expect(popups).toHaveCount(1);
    await expect(outer).not.toHaveAttribute("data-nested-drawer-open");
    expect(await cssVariable(outer, "--nested-drawers")).toBe("0");
});
