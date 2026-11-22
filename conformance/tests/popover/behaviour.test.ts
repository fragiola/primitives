import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/popover.md
const trigger = (page: Page) =>
    page.getByRole("button", { name: "Open popover" });
const popover = (page: Page) =>
    page.getByRole("dialog", { name: "Notifications" });
const markAll = (page: Page) =>
    page.getByRole("button", { name: "Mark all as read" });
const after = (page: Page) =>
    page.getByRole("button", { name: "After trigger" });

async function open(page: Page) {
    await trigger(page).click();
    await expect(popover(page)).toBeVisible();
    await expect(markAll(page)).toBeFocused();
}

test.describe("popover / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/popover/basic");
    });

    test("the trigger announces a dialog and its state", async ({ page }) => {
        await expect(trigger(page)).toHaveAttribute("aria-haspopup", "dialog");
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
        await trigger(page).click();
        await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
        const id = await popover(page).getAttribute("id");
        await expect(trigger(page)).toHaveAttribute(
            "aria-controls",
            id as string,
        );
    });

    test("opens a non-modal dialog and focuses its first tabbable element", async ({
        page,
    }) => {
        await trigger(page).click();
        await expect(popover(page)).toBeVisible();
        await expect(popover(page)).not.toHaveAttribute("aria-modal", "true");
        await expect(popover(page)).toHaveAccessibleDescription(
            "You have 3 unread messages.",
        );
        await expect(markAll(page)).toBeFocused();
    });

    test("Tab walks the content, then leaves to the next element and closes", async ({
        page,
    }) => {
        await open(page);
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "Close" })).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(after(page)).toBeFocused();
        await expect(popover(page)).toBeHidden();
        await expectOutput(page, "reason", "focus-out");
    });

    test("Shift+Tab from the first element goes back to the trigger and closes", async ({
        page,
    }) => {
        await open(page);
        await page.keyboard.press("Shift+Tab");
        await expect(trigger(page)).toBeFocused();
        await expect(popover(page)).toBeHidden();
        await expectOutput(page, "reason", "focus-out");
    });

    test("Escape closes and focuses the trigger", async ({ page }) => {
        await open(page);
        await page.keyboard.press("Escape");
        await expect(popover(page)).toBeHidden();
        await expectOutput(page, "reason", "escape-key");
        await expect(trigger(page)).toBeFocused();
    });

    test("an outside press on nothing focusable closes and returns focus to the trigger", async ({
        page,
    }) => {
        await open(page);
        await page.getByTestId("output").click();
        await expect(popover(page)).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
        await expect(trigger(page)).toBeFocused();
    });

    test("an outside press on a focusable element closes and keeps the focus it gave", async ({
        page,
    }) => {
        await open(page);
        await after(page).click();
        await expect(popover(page)).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
        await expect(after(page)).toBeFocused();
        // the focus stays: nothing moves it back later
        await page.waitForTimeout(200);
        await expect(after(page)).toBeFocused();
    });

    test("pressing the trigger while open closes it for good", async ({
        page,
    }) => {
        await open(page);
        await trigger(page).click();
        await expect(popover(page)).toBeHidden();
        await expectOutput(page, "reason", "trigger-press");
        await page.waitForTimeout(300);
        await expect(popover(page)).toBeHidden();
    });

    test("has no axe violation while open", async ({ page }) => {
        await open(page);
        await expectNoAxeViolations(page);
    });
});

test("popover / initial-focus: initialFocus overrides the first tabbable element", async ({
    page,
}) => {
    await openScenario(page, "/popover/initial-focus");
    await page.getByRole("button", { name: "Share" }).click();
    await expect(
        page.getByRole("dialog", { name: "Share link" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Copy" })).toBeFocused();
    await expect(page.getByRole("textbox", { name: "Link" })).not.toBeFocused();
});

async function openPlaced(page: Page, label: string) {
    const button = page.getByRole("button", { name: label, exact: true });
    await button.click();
    const popup = page.getByRole("dialog", { name: "Placed" });
    await expect(popup).toBeVisible();
    const triggerBox = await button.boundingBox();
    const popupBox = await popup.boundingBox();
    if (triggerBox === null || popupBox === null) {
        throw new Error("missing boxes");
    }
    return { popup, triggerBox, popupBox };
}

test.describe("popover / placement", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/popover/placement");
    });

    test("bottom start: below the trigger, start edges aligned; no tabbable element focuses the popup", async ({
        page,
    }) => {
        const { popup, triggerBox, popupBox } = await openPlaced(
            page,
            "Bottom start",
        );
        expect(popupBox.y).toBeGreaterThanOrEqual(
            triggerBox.y + triggerBox.height - 1,
        );
        expect(Math.abs(popupBox.x - triggerBox.x)).toBeLessThanOrEqual(1);
        await expect(popup).toBeFocused();
    });

    test("inline end: to the right of the trigger in LTR", async ({ page }) => {
        const { triggerBox, popupBox } = await openPlaced(page, "Inline end");
        expect(popupBox.x).toBeGreaterThanOrEqual(
            triggerBox.x + triggerBox.width - 1,
        );
    });

    test("left: to the left of the trigger", async ({ page }) => {
        const { triggerBox, popupBox } = await openPlaced(page, "Left");
        expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(
            triggerBox.x + 1,
        );
    });

    test("flip: above the trigger when there is no room below", async ({
        page,
    }) => {
        const { triggerBox, popupBox } = await openPlaced(page, "Flip");
        expect(popupBox.y + popupBox.height).toBeLessThanOrEqual(
            triggerBox.y + 1,
        );
    });
});

test.describe("popover / rtl", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/popover/rtl", { dir: "rtl" });
    });

    test("inline end is to the left of the trigger", async ({ page }) => {
        const { triggerBox, popupBox } = await openPlaced(page, "Inline end");
        expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(
            triggerBox.x + 1,
        );
    });

    test("left stays on the left", async ({ page }) => {
        const { triggerBox, popupBox } = await openPlaced(page, "Left");
        expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(
            triggerBox.x + 1,
        );
    });
});

test("popover / arrow: points at the trigger", async ({ page }) => {
    await openScenario(page, "/popover/arrow");
    const button = page.getByRole("button", { name: "With arrow" });
    await button.click();
    await expect(page.getByRole("dialog", { name: "Arrow" })).toBeVisible();
    const triggerBox = await button.boundingBox();
    const arrowBox = await page.getByTestId("arrow").boundingBox();
    if (triggerBox === null || arrowBox === null) {
        throw new Error("missing boxes");
    }
    const centre = arrowBox.x + arrowBox.width / 2;
    expect(centre).toBeGreaterThanOrEqual(triggerBox.x - 2);
    expect(centre).toBeLessThanOrEqual(triggerBox.x + triggerBox.width + 2);
});

test.describe("popover / controlled", () => {
    const trigger = (page: Page) =>
        page.getByRole("button", { name: "Settings", exact: true });
    const popup = (page: Page) =>
        page.getByRole("dialog", { name: "Quick settings" });

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/popover/controlled");
    });

    test("closed through `open` with focus inside, focus returns to the trigger", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Show settings" }).click();
        await expect(popup(page)).toBeVisible();
        await expect(page.getByRole("button", { name: "Done" })).toBeFocused();
        await page.getByRole("button", { name: "Done" }).click();
        await expectOutput(page, "open", "false");
        await expect(popup(page)).toBeHidden();
        await expect(trigger(page)).toBeFocused();
    });

    test("a close through `open` uses its own reason, not the previous one", async ({
        page,
    }) => {
        // closed first by focus leaving it (focus-out: no focus return), then opened and closed by
        // the page: that close must not reuse focus-out's reason
        await trigger(page).click();
        await expect(page.getByRole("button", { name: "Done" })).toBeFocused();
        await page.keyboard.press("Shift+Tab");
        await expect(popup(page)).toBeHidden();
        await expect(trigger(page)).toBeFocused();
        await page.getByRole("button", { name: "Show settings" }).click();
        await expect(page.getByRole("button", { name: "Done" })).toBeFocused();
        await page.getByRole("button", { name: "Done" }).click();
        await expect(popup(page)).toBeHidden();
        await expect(trigger(page)).toBeFocused();
    });
});

// spec/popover.md, `/popover/detached`
test.describe("popover / detached", () => {
    const info = (page: Page, name: string) =>
        page.getByRole("button", { name: `Info for ${name}` });

    async function expectBelow(page: Page, name: string): Promise<void> {
        const trigger = await info(page, name).boundingBox();
        const popup = await page
            .getByRole("dialog", { name: `About ${name}` })
            .boundingBox();
        expect(trigger).not.toBeNull();
        expect(popup).not.toBeNull();
        if (trigger === null || popup === null) {
            return;
        }
        expect(popup.y).toBeGreaterThanOrEqual(trigger.y + trigger.height - 1);
        expect(popup.x).toBeLessThan(trigger.x + trigger.width);
        expect(popup.x + popup.width).toBeGreaterThan(trigger.x);
    }

    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/popover/detached");
    });

    test("a trigger opens it with its payload, anchored below it", async ({
        page,
    }) => {
        await info(page, "Ada").click();
        await expect(
            page.getByRole("dialog", { name: "About Ada" }),
        ).toBeVisible();
        await expectOutput(page, "trigger", "info-ada");
        await expectBelow(page, "Ada");
    });

    test("a press on another trigger while open moves it there", async ({
        page,
    }) => {
        await info(page, "Ada").click();
        await expect(
            page.getByRole("dialog", { name: "About Ada" }),
        ).toBeVisible();
        await info(page, "Grace").click();
        await expect(
            page.getByRole("dialog", { name: "About Grace" }),
        ).toBeVisible();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await expectOutput(page, "trigger", "info-grace");
        await expect(page.getByRole("dialog")).toHaveCount(1);
        await expectBelow(page, "Grace");
        await expect(info(page, "Grace")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await expect(info(page, "Ada")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
    });

    test("Escape returns focus to the active trigger", async ({ page }) => {
        await info(page, "Ada").click();
        await info(page, "Grace").click();
        await expect(
            page.getByRole("dialog", { name: "About Grace" }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expectOutput(page, "reason", "escape-key");
        await expect(info(page, "Grace")).toBeFocused();
    });

    test("has no axe violation while open", async ({ page }) => {
        await info(page, "Ada").click();
        await expect(
            page.getByRole("dialog", { name: "About Ada" }),
        ).toBeVisible();
        await expectNoAxeViolations(page);
    });
});
