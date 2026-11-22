import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import {
    findInPage,
    recordPanelMoments,
    sizeVariable,
} from "../../src/panel.ts";
import { slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/accordion.md
const trigger = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const region = (page: Page, name: string) =>
    page.getByRole("region", { name, exact: true });
const panel = (page: Page, text: string) =>
    page
        .locator('[data-primitives-part="accordion-panel"]')
        .filter({ hasText: text });
const HEIGHT = "--accordion-panel-height";

test.describe("accordion / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/accordion/basic");
    });

    test("headings of level 3 holding collapsed buttons, no panel in the DOM", async ({
        page,
    }) => {
        await expect(page.getByRole("heading", { level: 3 })).toHaveCount(4);
        for (const name of ["Shipping", "Returns", "Warranty", "Support"]) {
            const heading = page.getByRole("heading", { name, level: 3 });
            await expect(heading.getByRole("button")).toHaveAttribute(
                "aria-expanded",
                "false",
            );
        }
        await expect(trigger(page, "Warranty")).toBeDisabled();
        await expect(
            page.locator('[data-primitives-part="accordion-panel"]'),
        ).toHaveCount(0);
    });

    test("a click expands an item into its named region", async ({ page }) => {
        await trigger(page, "Shipping").click();
        await expect(trigger(page, "Shipping")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        const shipping = region(page, "Shipping");
        await expect(shipping).toBeVisible();
        await expect(shipping).toContainText("Shipping details");
        await expect(trigger(page, "Shipping")).toHaveAttribute(
            "aria-controls",
            (await shipping.getAttribute("id")) as string,
        );
        await expectOutput(page, "value", "shipping");
        await expectOutput(page, "reason", "trigger-press");
    });

    test("one item open at a time, and an open item collapses", async ({
        page,
    }) => {
        await trigger(page, "Shipping").click();
        await expectOutput(page, "value", "shipping");
        await trigger(page, "Returns").click();
        await expect(trigger(page, "Returns")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await expect(trigger(page, "Shipping")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        await expectOutput(page, "value", "returns");
        await expect(page.getByText("Shipping details")).toHaveCount(0);
        await trigger(page, "Returns").click();
        await expect(trigger(page, "Returns")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        await expectOutput(page, "value", "");
    });

    test("arrows move between the enabled triggers and wrap; Home and End", async ({
        page,
    }) => {
        await trigger(page, "Shipping").focus();
        await page.keyboard.press("ArrowDown");
        await expect(trigger(page, "Returns")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(trigger(page, "Support")).toBeFocused();
        await page.keyboard.press("ArrowDown");
        await expect(trigger(page, "Shipping")).toBeFocused();
        await page.keyboard.press("ArrowUp");
        await expect(trigger(page, "Support")).toBeFocused();
        await page.keyboard.press("Home");
        await expect(trigger(page, "Shipping")).toBeFocused();
        await page.keyboard.press("End");
        await expect(trigger(page, "Support")).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(trigger(page, "Support")).toBeFocused();
        await expectOutput(page, "value", "none");
    });

    test("Enter expands the focused item, Space collapses it", async ({
        page,
    }) => {
        await trigger(page, "Support").focus();
        await page.keyboard.press("Enter");
        await expect(region(page, "Support")).toBeVisible();
        await expectOutput(page, "value", "support");
        await page.keyboard.press("Space");
        await expect(trigger(page, "Support")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        await expectOutput(page, "value", "");
    });

    test("has no axe violation, collapsed and expanded", async ({ page }) => {
        await expectNoAxeViolations(page);
        await trigger(page, "Returns").click();
        await expect(region(page, "Returns")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test.describe("accordion / multiple", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/accordion/multiple");
    });

    test("the controlled open item renders at once; the others are hidden until found", async ({
        page,
    }) => {
        await expect(trigger(page, "Shipping")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        const shipping = panel(page, "Shipping details");
        await expect(shipping).toBeVisible();
        await expect(shipping).not.toHaveAttribute("data-starting-style");
        expect(await sizeVariable(shipping, HEIGHT)).toBe("auto");
        for (const text of ["Returns details", "Support details"]) {
            await expect(panel(page, text)).toHaveAttribute(
                "hidden",
                "until-found",
            );
        }
    });

    test("several items stay open", async ({ page }) => {
        await trigger(page, "Returns").click();
        await expect(region(page, "Returns")).toBeVisible();
        await expect(region(page, "Shipping")).toBeVisible();
        await expectOutput(page, "value", "shipping,returns");
        await trigger(page, "Shipping").click();
        await expect(trigger(page, "Shipping")).toHaveAttribute(
            "aria-expanded",
            "false",
        );
        await expect(region(page, "Returns")).toBeVisible();
        await expectOutput(page, "value", "returns");
    });

    test("finding a closed panel's text expands its item", async ({ page }) => {
        await trigger(page, "Returns").click();
        await expectOutput(page, "value", "shipping,returns");
        await trigger(page, "Shipping").click();
        await expectOutput(page, "value", "returns");
        await findInPage(page, "Support details");
        await expect(trigger(page, "Support")).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await expect(region(page, "Support")).toBeVisible();
        await expectOutput(page, "value", "returns,support");
        await expectOutput(page, "reason", "none");
    });

    test("the size variable is a length when the transitions start, then auto", async ({
        page,
    }) => {
        await slowMotion(page, 600);
        const moments = await recordPanelMoments(
            page,
            "accordion-panel",
            HEIGHT,
        );
        await trigger(page, "Returns").click();
        const returns = panel(page, "Returns details");
        await expect(returns).toBeVisible();
        await expect.poll(() => sizeVariable(returns, HEIGHT)).toBe("auto");
        await trigger(page, "Returns").click();
        await expect(returns).toHaveAttribute("hidden", "until-found");
        const [opening, closing] = await moments();
        expect(opening?.moment).toBe("start");
        expect(opening?.size).toMatch(/^[1-9][\d.]*px$/);
        expect(closing?.moment).toBe("end");
        expect(closing?.size).toMatch(/^[1-9][\d.]*px$/);
        expect(closing?.height).toBeGreaterThan(0);
        expect(closing?.running).toBeGreaterThan(0);
    });
});

test("accordion / horizontal: the horizontal arrows, no loop", async ({
    page,
}) => {
    await openScenario(page, "/accordion/horizontal");
    await trigger(page, "Shipping").focus();
    await page.keyboard.press("ArrowRight");
    await expect(trigger(page, "Returns")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(trigger(page, "Support")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(trigger(page, "Support")).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(trigger(page, "Returns")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(trigger(page, "Returns")).toBeFocused();
});

test("accordion / horizontal in RTL: ArrowLeft is next, ArrowRight is previous", async ({
    page,
}) => {
    await openScenario(page, "/accordion/horizontal", { dir: "rtl" });
    await trigger(page, "Shipping").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(trigger(page, "Returns")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(trigger(page, "Shipping")).toBeFocused();
});
