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

// spec/collapsible.md
const trigger = (page: Page, name: string) =>
    page.getByRole("button", { name, exact: true });
const panels = (page: Page) =>
    page.locator('[data-primitives-part="collapsible-panel"]');
const HEIGHT = "--collapsible-panel-height";

test.describe("collapsible / basic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/collapsible/basic");
    });

    test("a closed disclosure button, with no panel in the DOM", async ({
        page,
    }) => {
        const recovery = trigger(page, "Recovery keys");
        await expect(recovery).toHaveAttribute("aria-expanded", "false");
        await expect(recovery).not.toHaveAttribute("aria-controls");
        await expect(page.getByText("alpha-1234")).toHaveCount(0);
        await expectOutput(page, "open", "none");
    });

    test("a click opens it, a second click closes it", async ({ page }) => {
        const recovery = trigger(page, "Recovery keys");
        await recovery.click();
        await expect(recovery).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByText("alpha-1234")).toBeVisible();
        const controls = await recovery.getAttribute("aria-controls");
        expect(controls).toBeTruthy();
        await expect(page.locator(`[id="${controls}"]`)).toContainText(
            "beta-5678",
        );
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "trigger-press");
        await recovery.click();
        await expect(recovery).toHaveAttribute("aria-expanded", "false");
        await expect(page.getByText("alpha-1234")).toHaveCount(0);
        await expectOutput(page, "open", "false");
    });

    test("Enter opens it and Space closes it", async ({ page }) => {
        const recovery = trigger(page, "Recovery keys");
        await recovery.focus();
        await page.keyboard.press("Enter");
        await expect(recovery).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByText("alpha-1234")).toBeVisible();
        await page.keyboard.press("Space");
        await expect(recovery).toHaveAttribute("aria-expanded", "false");
        await expectOutput(page, "open", "false");
    });

    test("Tab moves on past the disabled trigger", async ({ page }) => {
        await trigger(page, "Recovery keys").click();
        await expect(page.getByText("alpha-1234")).toBeVisible();
        await page.keyboard.press("Tab");
        await expect(trigger(page, "After collapsible")).toBeFocused();
    });

    test("a disabled collapsible open from the start shows its panel at once, and ignores clicks", async ({
        page,
    }) => {
        const archived = trigger(page, "Archived keys");
        await expect(archived).toBeDisabled();
        await expect(archived).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByText("gamma-9012")).toBeVisible();
        const panel = panels(page).filter({ hasText: "gamma-9012" });
        await expect(panel).not.toHaveAttribute("data-starting-style");
        expect(await sizeVariable(panel, HEIGHT)).toBe("auto");
        await archived.click({ force: true });
        await expect(archived).toHaveAttribute("aria-expanded", "true");
        await expectOutput(page, "open", "none");
    });

    test("the size variable is a length when the transitions start, then auto", async ({
        page,
    }) => {
        await slowMotion(page, 600);
        const moments = await recordPanelMoments(
            page,
            "collapsible-panel",
            HEIGHT,
        );
        const recovery = trigger(page, "Recovery keys");
        await recovery.click();
        const panel = panels(page).filter({ hasText: "alpha-1234" });
        await expect(panel).toBeVisible();
        await expect.poll(() => sizeVariable(panel, HEIGHT)).toBe("auto");
        const [opening] = await moments();
        expect(opening?.moment).toBe("start");
        expect(opening?.size).toMatch(/^[1-9][\d.]*px$/);

        await recovery.click();
        await expect(panel).toHaveAttribute("data-ending-style");
        await expect(panel).toHaveCount(0);
        const closing = (await moments())[1];
        expect(closing?.moment).toBe("end");
        expect(closing?.size).toMatch(/^[1-9][\d.]*px$/);
        // it transitions from its height: not from auto, which would jump to 0 at once
        expect(closing?.height).toBeGreaterThan(0);
        expect(closing?.running).toBeGreaterThan(0);
    });

    test("has no axe violation, closed and open", async ({ page }) => {
        await expectNoAxeViolations(page);
        await trigger(page, "Recovery keys").click();
        await expect(page.getByText("alpha-1234")).toBeVisible();
        await expectNoAxeViolations(page);
    });
});

test.describe("collapsible / hidden-until-found", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/collapsible/hidden-until-found");
    });

    test("closed panels stay in the DOM, hidden until found or hidden", async ({
        page,
    }) => {
        await expect(
            panels(page).filter({ hasText: "two business days" }),
        ).toHaveAttribute("hidden", "until-found");
        await expect(
            panels(page).filter({ hasText: "thirty days" }),
        ).toHaveAttribute("hidden", "");
    });

    test("finding its text in the page opens it, with no transition", async ({
        page,
    }) => {
        const moments = await recordPanelMoments(
            page,
            "collapsible-panel",
            HEIGHT,
        );
        await findInPage(page, "two business days");
        const shipping = trigger(page, "Shipping details");
        await expect(shipping).toHaveAttribute("aria-expanded", "true");
        await expect(
            page.getByText("Ships within two business days"),
        ).toBeVisible();
        await expectOutput(page, "open", "true");
        await expectOutput(page, "reason", "none");
        const panel = panels(page).filter({ hasText: "two business days" });
        await expect(panel).not.toHaveAttribute("hidden");
        await expect(panel).not.toHaveAttribute("data-starting-style");
        expect(await moments()).toEqual([]);
    });

    test("a kept-mounted panel is shown and hidden again, the same element", async ({
        page,
    }) => {
        const policy = trigger(page, "Return policy");
        const panel = panels(page).filter({ hasText: "thirty days" });
        await panel.evaluate((element) => {
            (window as unknown as { __panel: Element }).__panel = element;
        });
        await policy.click();
        await expect(
            page.getByText("Returns are free for thirty days"),
        ).toBeVisible();
        await expect(panel).not.toHaveAttribute("hidden");
        await policy.click();
        await expect(panel).toHaveAttribute("hidden", "");
        expect(
            await panel.evaluate(
                (element) =>
                    (window as unknown as { __panel: Element }).__panel ===
                    element,
            ),
        ).toBe(true);
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});
