import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { mouseDrag, touchDrag } from "../../src/swipe.ts";

// spec/toast.md. The timers run on Playwright's clock, installed before the page loads and moved
// with `fastForward`; a toast's exit then runs on the real frames.

const button = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const region = (page: Page) =>
    page.getByRole("region", { name: "Notifications" });
const toast = (page: Page, name: string) =>
    region(page).getByRole("dialog", { name });

async function open(page: Page, path: string) {
    await page.clock.install();
    await openScenario(page, path);
    await expect(region(page)).toBeAttached();
}

test.describe("toast / basic", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/toast/basic");
    });

    test("a toast shows in the region, with its title and description", async ({
        page,
    }) => {
        await button(page, "Show toast").click();
        const saved = toast(page, "Saved");
        await expect(saved).toBeVisible();
        await expect(saved).toHaveAccessibleDescription(
            "Your draft was saved.",
        );
        await expectOutput(page, "toasts", "1");
    });

    test("it closes by itself after its timeout", async ({ page }) => {
        await button(page, "Show toast").click();
        const saved = toast(page, "Saved");
        await expect(saved).toBeVisible();
        await page.mouse.move(0, 0);
        await page.clock.fastForward(2900);
        await expect(saved).toBeVisible();
        await expectOutput(page, "toasts", "1");
        await page.clock.fastForward(200);
        await expectOutput(page, "toasts", "0");
        await expectOutput(page, "closed", "Saved");
        await expect(saved).toHaveCount(0);
    });

    test("the pointer over it pauses it; once it left, it closes later", async ({
        page,
    }) => {
        await button(page, "Show toast").click();
        const saved = toast(page, "Saved");
        await saved.hover();
        await page.clock.fastForward(10_000);
        await expect(saved).toBeVisible();
        await page.mouse.move(0, 0);
        await page.clock.fastForward(2900);
        await expect(saved).toBeVisible();
        await page.clock.fastForward(200);
        await expect(saved).toHaveCount(0);
    });

    test("Dismiss closes it; Undo runs the action and closes it", async ({
        page,
    }) => {
        await button(page, "Show toast").click();
        await toast(page, "Saved")
            .getByRole("button", { name: "Dismiss" })
            .click();
        await expect(toast(page, "Saved")).toHaveCount(0);
        await expectOutput(page, "closed", "Saved");
        await button(page, "Show toast").click();
        await toast(page, "Saved")
            .getByRole("button", { name: "Undo" })
            .click();
        await expectOutput(page, "action", "Saved");
        await expect(toast(page, "Saved")).toHaveCount(0);
    });

    test("a high priority toast is an alertdialog, announced assertively", async ({
        page,
    }) => {
        await button(page, "Show alert").click();
        await expect(
            region(page).getByRole("alertdialog", { name: "Connection lost" }),
        ).toBeVisible();
        const assertive = region(page).locator('[aria-live="assertive"]');
        await expect(assertive).toHaveText(
            "Connection lost Retrying in 5 seconds.",
        );
        await expect(region(page).locator('[aria-live="polite"]')).toHaveText(
            "",
        );
    });

    test("F6 reaches the region; Escape closes a toast and focus returns", async ({
        page,
    }) => {
        await button(page, "Show toast").click();
        await expect(toast(page, "Saved")).toBeVisible();
        await button(page, "Before").focus();
        await page.keyboard.press("F6");
        await expect(region(page)).toBeFocused();
        // the keyboard in the region pauses it
        await page.clock.fastForward(10_000);
        await expect(toast(page, "Saved")).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(toast(page, "Saved")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(toast(page, "Saved")).toHaveCount(0);
        await expect(button(page, "Before")).toBeFocused();
    });

    test("Escape on the first of two toasts focuses the next one; F6 goes back", async ({
        page,
    }) => {
        await button(page, "Show toast").click();
        await button(page, "Show alert").click();
        // both rendered before the keyboard reaches them
        await expect(region(page).getByRole("dialog")).toHaveCount(1);
        await expect(region(page).getByRole("alertdialog")).toHaveCount(1);
        await button(page, "Before").focus();
        await page.keyboard.press("F6");
        await expect(region(page)).toBeFocused();
        await page.keyboard.press("Tab");
        const alert = region(page).getByRole("alertdialog", {
            name: "Connection lost",
        });
        await expect(alert).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(toast(page, "Saved")).toBeFocused();
        await page.keyboard.press("F6");
        await expect(button(page, "Before")).toBeFocused();
    });

    test("a hidden page pauses it", async ({ page }) => {
        await button(page, "Show toast").click();
        await page.mouse.move(0, 0);
        const visibility = (state: "hidden" | "visible") =>
            page.evaluate((value) => {
                Object.defineProperty(document, "visibilityState", {
                    configurable: true,
                    get: () => value,
                });
                document.dispatchEvent(new Event("visibilitychange"));
            }, state);
        await visibility("hidden");
        await page.clock.fastForward(10_000);
        await expect(toast(page, "Saved")).toBeVisible();
        await visibility("visible");
        await page.clock.fastForward(2900);
        await expect(toast(page, "Saved")).toBeVisible();
        await page.clock.fastForward(200);
        await expect(toast(page, "Saved")).toHaveCount(0);
    });

    test("Close all closes every toast; axe finds no violation", async ({
        page,
    }) => {
        await button(page, "Show toast").click();
        await button(page, "Show alert").click();
        await expectOutput(page, "toasts", "2");
        await expectNoAxeViolations(page);
        await button(page, "Close all").click();
        await expectOutput(page, "toasts", "0");
        await expect(region(page).getByRole("dialog")).toHaveCount(0);
        await expect(region(page).getByRole("alertdialog")).toHaveCount(0);
    });
});

test.describe("toast / limit", () => {
    test("past the limit, the oldest is queued until a newer one closes", async ({
        page,
    }) => {
        await open(page, "/toast/limit");
        for (let index = 0; index < 3; index += 1) {
            await button(page, "Notify").click();
        }
        await expect(toast(page, "Notification 3")).toBeVisible();
        await expect(toast(page, "Notification 2")).toBeAttached();
        // queued: inert, it takes no focus
        const queued = toast(page, "Notification 1");
        await expect(queued).toHaveAttribute("inert", "");
        await queued.focus();
        await expect(queued).not.toBeFocused();
        await toast(page, "Notification 3")
            .getByRole("button", { name: "Dismiss" })
            .click();
        await expect(queued).not.toHaveAttribute("inert");
        await queued.focus();
        await expect(queued).toBeFocused();
    });
});

test.describe("toast / promise", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/toast/promise");
    });

    test("loading, then the success; it closes after its timeout", async ({
        page,
    }) => {
        await button(page, "Save file").click();
        await expect(toast(page, "Saving file")).toBeVisible();
        await page.mouse.move(0, 0);
        await page.clock.fastForward(900);
        await expect(toast(page, "Saving file")).toBeVisible();
        await page.clock.fastForward(200);
        await expect(toast(page, "File saved")).toBeVisible();
        await page.clock.fastForward(1900);
        await expect(toast(page, "File saved")).toBeVisible();
        await page.clock.fastForward(200);
        await expect(toast(page, "File saved")).toHaveCount(0);
    });

    test("a rejected promise shows the error", async ({ page }) => {
        await button(page, "Save offline").click();
        await expect(toast(page, "Saving file")).toBeVisible();
        await page.clock.fastForward(1100);
        await expect(toast(page, "Could not save: offline")).toBeVisible();
    });
});

test.describe("toast / swipe", () => {
    test.beforeEach(async ({ page }) => {
        await open(page, "/toast/swipe");
        await button(page, "Notify").click();
        await expect(toast(page, "Swipe me")).toBeVisible();
        // the drag starts on the toast once its enter transition has placed it
        await settleAnimations(page);
    });

    test("a short drag settles back; a long one dismisses", async ({
        page,
    }) => {
        const text = toast(page, "Swipe me").getByText("Drag to dismiss");
        await mouseDrag(page, text, 20, 0);
        await expectOutput(page, "toasts", "1");
        await expect(toast(page, "Swipe me")).toBeVisible();
        await mouseDrag(page, text, 260, 0);
        await expectOutput(page, "toasts", "0");
        await expect(toast(page, "Swipe me")).toHaveCount(0);
    });

    test("a drag the other way does not dismiss", async ({ page }) => {
        const text = toast(page, "Swipe me").getByText("Drag to dismiss");
        await mouseDrag(page, text, -200, 0);
        await expectOutput(page, "toasts", "1");
    });
});

test.describe("toast / swipe (touch)", () => {
    test.use({ hasTouch: true });

    test("a touch swipe to the right dismisses it", async ({ page }) => {
        await open(page, "/toast/swipe");
        await button(page, "Notify").click();
        const text = toast(page, "Swipe me").getByText("Drag to dismiss");
        await expect(text).toBeVisible();
        await settleAnimations(page);
        await touchDrag(page, text, 260, 0);
        await expectOutput(page, "toasts", "0");
    });
});
