import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/hover-card.md. Delays run on the real clock: a test asserts the card is hidden right after
// the hover or the focus, then measures how long it took (a lower bound, never a sleep).
const link = (page: Page, name: string) =>
    page.getByRole("link", { name, exact: true });
const card = (page: Page, text: string) =>
    page.locator('[data-primitives-part="hover-card-popup"]', {
        hasText: text,
    });

async function hover(page: Page, target: Locator) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    const { x, y, width, height } = box as NonNullable<typeof box>;
    await page.mouse.move(
        Math.round(x + width / 2),
        Math.round(y + height / 2),
        { steps: 2 },
    );
}

/** Runs `act`, checks nothing shows at once, and returns the ms until `shown` is visible. */
async function msUntilShown(act: () => Promise<void>, shown: Locator) {
    const start = Date.now();
    await act();
    await expect(shown).toBeHidden();
    await expect(shown).toBeVisible({ timeout: 5000 });
    return Date.now() - start;
}

test.describe("hover-card / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/hover-card/basic");
    });

    test("hover opens it after the delay", async ({ page }) => {
        const elapsed = await msUntilShown(
            () => hover(page, link(page, "@ada")),
            card(page, "Ada Lovelace"),
        );
        expect(elapsed).toBeGreaterThanOrEqual(450);
        await expectOutput(page, "reason", "trigger-hover");
    });

    test("the card is hoverable across the safe area; leaving both closes it after closeDelay", async ({
        page,
    }) => {
        const popup = card(page, "Ada Lovelace");
        await msUntilShown(() => hover(page, link(page, "@ada")), popup);
        // straight down, across the gap, onto the card
        const box = await popup.boundingBox();
        const trigger = await link(page, "@ada").boundingBox();
        expect(box).not.toBeNull();
        expect(trigger).not.toBeNull();
        const x = Math.round(
            (trigger as NonNullable<typeof trigger>).x +
                (trigger as NonNullable<typeof trigger>).width / 2,
        );
        await page.mouse.move(
            x,
            Math.round((box as NonNullable<typeof box>).y + 20),
            { steps: 6 },
        );
        await page.waitForTimeout(400);
        await expect(popup).toBeVisible();
        const start = Date.now();
        await page.mouse.move(600, 500, { steps: 2 });
        await expect(popup).toBeHidden();
        expect(Date.now() - start).toBeGreaterThanOrEqual(150);
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "trigger-hover");
    });

    test("keyboard focus opens it after the delay, keeping focus; Escape closes it", async ({
        page,
    }) => {
        await page.getByRole("button", { name: "Before" }).focus();
        const popup = card(page, "Ada Lovelace");
        const elapsed = await msUntilShown(
            () => page.keyboard.press("Tab"),
            popup,
        );
        expect(elapsed).toBeGreaterThanOrEqual(450);
        await expect(link(page, "@ada")).toBeFocused();
        await expectOutput(page, "reason", "trigger-focus");
        await page.keyboard.press("Escape");
        await expect(popup).toBeHidden();
        await expectOutput(page, "reason", "escape-key");
        await expect(link(page, "@ada")).toBeFocused();
    });

    test("a blur closes it at once", async ({ page }) => {
        await page.getByRole("button", { name: "Before" }).focus();
        const popup = card(page, "Ada Lovelace");
        await msUntilShown(() => page.keyboard.press("Tab"), popup);
        await page.keyboard.press("Shift+Tab");
        await expect(
            page.getByRole("button", { name: "Before" }),
        ).toBeFocused();
        await expect(popup).toBeHidden();
        await expectOutput(page, "open", "false");
        await expectOutput(page, "reason", "trigger-focus");
    });

    test("an outside press closes it; a press on the card keeps it", async ({
        page,
    }) => {
        const popup = card(page, "Ada Lovelace");
        await msUntilShown(() => hover(page, link(page, "@ada")), popup);
        await popup.getByText("Mathematician and writer").click();
        await expect(popup).toBeVisible();
        await expectOutput(page, "open", "true");
        await page.mouse.click(600, 400);
        await expect(popup).toBeHidden();
        await expectOutput(page, "reason", "outside-press");
    });

    test("a link in the card works", async ({ page }) => {
        const popup = card(page, "Ada Lovelace");
        await msUntilShown(() => hover(page, link(page, "@ada")), popup);
        await popup.getByRole("link", { name: "View profile" }).click();
        await expect(page).toHaveURL(/#ada-profile$/);
    });

    test("has no axe violation while open", async ({ page }) => {
        await msUntilShown(
            () => hover(page, link(page, "@ada")),
            card(page, "Ada Lovelace"),
        );
        await expectNoAxeViolations(page);
    });
});

test.describe("hover-card / basic (touch)", () => {
    test.use({ hasTouch: true });

    test("a tap opens no card", async ({ page }) => {
        await openScenario(page, "/hover-card/basic");
        await link(page, "@ada").tap();
        await page.waitForTimeout(800);
        await expect(card(page, "Ada Lovelace")).toHaveCount(0);
        await expectOutput(page, "open", "false");
    });
});

test.describe("hover-card / detached", () => {
    test("one card moves between its triggers at once", async ({ page }) => {
        await openScenario(page, "/hover-card/detached");
        const popup = page.locator('[data-primitives-part="hover-card-popup"]');
        await msUntilShown(() => hover(page, link(page, "@ada")), popup);
        await expect(popup).toHaveText("Profile of Ada");
        await expectOutput(page, "trigger", "ada");
        await expectOutput(page, "reason", "trigger-hover");
        const start = Date.now();
        await hover(page, link(page, "@grace"));
        await expect(popup).toHaveText("Profile of Grace");
        expect(Date.now() - start).toBeLessThan(250);
        await expect(popup).toHaveCount(1);
        await expectOutput(page, "trigger", "grace");
        await expectOutput(page, "open", "true");
        const grace = await link(page, "@grace").boundingBox();
        const placed = await popup.boundingBox();
        expect((placed as NonNullable<typeof placed>).y).toBeGreaterThanOrEqual(
            (grace as NonNullable<typeof grace>).y +
                (grace as NonNullable<typeof grace>).height,
        );
        await page.mouse.move(600, 500, { steps: 2 });
        await expectOutput(page, "open", "false");
    });
});

test.describe("hover-card / in-dialog", () => {
    test("Escape closes the card only, then the dialog", async ({ page }) => {
        await openScenario(page, "/hover-card/in-dialog");
        await page.getByRole("button", { name: "Open dialog" }).click();
        const dialog = page.getByRole("dialog", { name: "Credits" });
        await expect(dialog).toBeVisible();
        await page.getByRole("button", { name: "Close" }).focus();
        await page.keyboard.press("Shift+Tab");
        await expect(link(page, "@ada")).toBeFocused();
        const popup = card(page, "Ada Lovelace");
        await expect(popup).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(popup).toBeHidden();
        await expect(dialog).toBeVisible();
        await expect(link(page, "@ada")).toBeFocused();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
    });
});
