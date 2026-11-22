import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { isInertOrHidden } from "../../src/focus.ts";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { cssVariable, mouseDrag, touchDrag } from "../../src/swipe.ts";

// spec/drawer.md
const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true, includeHidden: true });
const popupPart = (page: Page) =>
    page.locator('[data-primitives-part="drawer-popup"]');

async function popupSize(
    page: Page,
): Promise<{ width: number; height: number }> {
    const box = await popupPart(page).first().boundingBox();
    if (box === null) {
        throw new Error("no popup");
    }
    return box;
}

async function openDrawer(page: Page, trigger: string) {
    await button(page, trigger).click();
    await expect(popupPart(page)).toHaveAttribute("data-open", "");
    await settleAnimations(page);
}

test.describe("drawer / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/drawer/basic");
    });

    const drawer = (page: Page) =>
        page.getByRole("dialog", { name: "Notifications" });
    const handle = (page: Page) => page.getByTestId("drawer-handle");

    test("opens a named, described, modal dialog with focus on its first tabbable element", async ({
        page,
    }) => {
        await openDrawer(page, "Open drawer");
        await expect(drawer(page)).toBeVisible();
        await expect(drawer(page)).toHaveAttribute("aria-modal", "true");
        await expect(drawer(page)).toHaveAccessibleDescription(
            "You are all caught up.",
        );
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expect(page.getByRole("list", { name: "Recent" })).toBeFocused();
        expect(await isInertOrHidden(button(page, "Outside button"))).toBe(
            true,
        );
    });

    test("closes on Escape and on a press on the backdrop, focus back on the trigger", async ({
        page,
    }) => {
        await openDrawer(page, "Open drawer");
        await page.keyboard.press("Escape");
        await expectOutput(page, "reason", "escape-key");
        await expect(button(page, "Open drawer")).toBeFocused();
        await openDrawer(page, "Open drawer");
        await page.mouse.click(10, 10);
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "outside-press");
    });

    test("a slow drag down by 70 % swipes it away: data-swiping and the movement while it runs", async ({
        page,
    }) => {
        await openDrawer(page, "Open drawer");
        const { height } = await popupSize(page);
        const distance = Math.round(height * 0.7);
        const release = await mouseDrag(page, handle(page), 0, distance, {
            hold: true,
        });
        await expect(popupPart(page)).toHaveAttribute("data-swiping", "");
        const movement = Number.parseFloat(
            await cssVariable(popupPart(page), "--drawer-swipe-movement-y"),
        );
        expect(Math.abs(movement - distance)).toBeLessThanOrEqual(2);
        await release();
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "swipe");
        await expect(button(page, "Open drawer")).toBeFocused();
    });

    test("a slow drag down by 25 % settles back", async ({ page }) => {
        await openDrawer(page, "Open drawer");
        const { height } = await popupSize(page);
        await mouseDrag(page, handle(page), 0, Math.round(height * 0.25));
        await expectOutput(page, "open", "true");
        await expect(popupPart(page)).not.toHaveAttribute("data-swiping");
        expect(
            await cssVariable(popupPart(page), "--drawer-swipe-movement-y"),
        ).toBe("0px");
    });

    test("a flick of 60 px down swipes it away", async ({ page }) => {
        await openDrawer(page, "Open drawer");
        await mouseDrag(page, handle(page), 0, 60, { speed: "flick" });
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "swipe");
    });

    test("a drag up never closes it, and is damped", async ({ page }) => {
        await openDrawer(page, "Open drawer");
        const release = await mouseDrag(page, handle(page), 0, -100, {
            hold: true,
        });
        const movement = Number.parseFloat(
            await cssVariable(popupPart(page), "--drawer-swipe-movement-y"),
        );
        expect(movement).toBeLessThan(0);
        expect(movement).toBeGreaterThan(-20);
        await release();
        await expectOutput(page, "open", "true");
    });

    test("a mouse drag in the Content selects text instead of swiping", async ({
        page,
    }) => {
        await openDrawer(page, "Open drawer");
        const { height } = await popupSize(page);
        await mouseDrag(
            page,
            page.getByRole("heading", { name: "Notifications" }),
            0,
            Math.round(height * 0.7),
        );
        await expectOutput(page, "open", "true");
    });

    test("axe finds no violation while open", async ({ page }) => {
        await openDrawer(page, "Open drawer");
        await expectNoAxeViolations(page);
    });
});

test.describe("drawer / basic, touch", () => {
    test.use({ hasTouch: true });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/drawer/basic");
    });

    test("a slow touch drag down by 70 % from the Title swipes it away; one by 25 % settles back", async ({
        page,
    }) => {
        await openDrawer(page, "Open drawer");
        const { height } = await popupSize(page);
        const title = page.getByRole("heading", { name: "Notifications" });
        await touchDrag(page, title, 0, Math.round(height * 0.25));
        await settleAnimations(page);
        await expectOutput(page, "open", "true");
        await touchDrag(page, title, 0, Math.round(height * 0.7));
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "swipe");
    });

    test("a scrolled list takes a touch drag down: it scrolls, the drawer stays", async ({
        page,
    }) => {
        await openDrawer(page, "Open drawer");
        const list = page.getByRole("list", { name: "Recent" });
        await list.evaluate((element) => {
            element.scrollTop = 100;
        });
        await touchDrag(page, page.getByText("Notification 6"), 0, 60);
        await settleAnimations(page);
        await expectOutput(page, "open", "true");
        await expect(popupPart(page)).not.toHaveAttribute("data-swiping");
        expect(
            await list.evaluate((element) => element.scrollTop),
        ).toBeLessThan(100);
    });
});

test.describe("drawer / side", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/drawer/side");
        await openDrawer(page, "Open settings");
    });

    const description = (page: Page) => page.getByText("Choose what you see.");

    test("a slow drag right by 70 % of its width swipes it away", async ({
        page,
    }) => {
        const { width } = await popupSize(page);
        await mouseDrag(page, description(page), Math.round(width * 0.7), 0);
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "swipe");
        await expect(button(page, "Open settings")).toBeFocused();
    });

    test("a drag down (the other axis) does nothing", async ({ page }) => {
        const release = await mouseDrag(page, description(page), 0, 150, {
            hold: true,
        });
        await expect(popupPart(page)).not.toHaveAttribute("data-swiping");
        await release();
        await expectOutput(page, "open", "true");
    });

    test("a drag left is damped and never closes it", async ({ page }) => {
        const release = await mouseDrag(page, description(page), -100, 0, {
            hold: true,
        });
        const movement = Number.parseFloat(
            await cssVariable(popupPart(page), "--drawer-swipe-movement-x"),
        );
        expect(movement).toBeLessThan(0);
        expect(movement).toBeGreaterThan(-20);
        await release();
        await expectOutput(page, "open", "true");
    });

    test("axe finds no violation while open", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("drawer / snap-points", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/drawer/snap-points");
        await openDrawer(page, "Open map");
    });

    const title = (page: Page) => page.getByRole("heading", { name: "Map" });
    const viewportHeight = (page: Page) =>
        page.evaluate(() => document.documentElement.clientHeight);

    async function popupTop(page: Page): Promise<number> {
        await settleAnimations(page);
        const box = await popupPart(page).boundingBox();
        return box?.y ?? Number.NaN;
    }

    test("opens on its first snap point, 200 px shown", async ({ page }) => {
        await expectOutput(page, "snap", "200px");
        expect(
            await cssVariable(popupPart(page), "--drawer-snap-point-offset"),
        ).toBe("360px");
        await expect(popupPart(page)).not.toHaveAttribute("data-expanded");
        expect(
            Math.abs(
                (await popupTop(page)) - ((await viewportHeight(page)) - 200),
            ),
        ).toBeLessThanOrEqual(1);
    });

    test("a drag up settles on the full height, then a drag down on 200 px again", async ({
        page,
    }) => {
        await mouseDrag(page, title(page), 0, -300);
        await expectOutput(page, "snap", "1");
        await expect(popupPart(page)).toHaveAttribute("data-expanded", "");
        expect(
            await cssVariable(popupPart(page), "--drawer-snap-point-offset"),
        ).toBe("0px");
        expect(
            Math.abs(
                (await popupTop(page)) - ((await viewportHeight(page)) - 560),
            ),
        ).toBeLessThanOrEqual(1);
        await mouseDrag(page, title(page), 0, 250);
        await expectOutput(page, "snap", "200px");
        await expectOutput(page, "reason", "trigger-press");
        await expectOutput(page, "open", "true");
    });

    test("from 200 px, a drag down by 150 px closes it; it reopens on 200 px", async ({
        page,
    }) => {
        await mouseDrag(page, title(page), 0, 150);
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "swipe");
        await settleAnimations(page);
        await openDrawer(page, "Open map");
        await expectOutput(page, "snap", "200px");
    });

    test("axe finds no violation while open", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test.describe("drawer / nested", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/drawer/nested");
        await openDrawer(page, "Open order");
        await button(page, "Edit address").click();
        await expectOutput(page, "nested", "true");
        await settleAnimations(page);
    });

    const outer = (page: Page) => page.getByRole("dialog", { name: "Order" });
    const inner = (page: Page) => page.getByRole("dialog", { name: "Address" });

    test("Escape closes only the nested drawer, focus on its trigger", async ({
        page,
    }) => {
        await page.keyboard.press("Escape");
        await expectOutput(page, "nested", "false");
        await expectOutput(page, "open", "true");
        await expect(outer(page)).toBeVisible();
        await expect(button(page, "Edit address")).toBeFocused();
    });

    test("a swipe on the nested drawer closes it alone", async ({ page }) => {
        const { height } = (await inner(page).boundingBox()) ?? { height: 0 };
        await mouseDrag(
            page,
            inner(page).getByRole("heading", { name: "Address" }),
            0,
            Math.round(height * 0.8),
        );
        await expectOutput(page, "nested", "false");
        await expectOutput(page, "open", "true");
    });

    test("axe finds no violation with both open", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
