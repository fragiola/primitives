import { expect, type Page, test } from "@playwright/test";
import { expectNoAxeViolations } from "../../src/axe.ts";
import { expectOutput } from "../../src/output.ts";
import { slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tabs.md
const tab = (page: Page, name: string) => page.getByRole("tab", { name });

test.describe("tabs / automatic", () => {
    test.beforeEach(async ({ page }) => {
        await openScenario(page, "/tabs/automatic");
    });

    test("a tablist whose selected tab holds the roving tabindex", async ({
        page,
    }) => {
        await expect(page.getByRole("tablist")).toBeVisible();
        await expect(page.getByRole("tab")).toHaveCount(4);
        await expect(tab(page, "Account")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expect(tab(page, "Account")).toHaveAttribute("tabindex", "0");
        for (const name of ["Password", "Billing", "Team"]) {
            await expect(tab(page, name)).toHaveAttribute(
                "aria-selected",
                "false",
            );
            await expect(tab(page, name)).toHaveAttribute("tabindex", "-1");
        }
    });

    test("the visible panel is named by its tab", async ({ page }) => {
        const panel = page.getByRole("tabpanel", { name: "Account" });
        await expect(panel).toBeVisible();
        await expect(panel).toContainText("Account settings");
    });

    test("arrows move and select, focus disabled tabs without selecting them, and wrap; Home and End", async ({
        page,
    }) => {
        await tab(page, "Account").focus();
        await page.keyboard.press("ArrowRight");
        await expect(tab(page, "Password")).toBeFocused();
        await expect(tab(page, "Password")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expectOutput(page, "value", "password");
        await expect(
            page.getByRole("tabpanel", { name: "Password" }),
        ).toBeVisible();
        await page.keyboard.press("ArrowRight");
        await expect(tab(page, "Billing")).toBeFocused();
        await expect(tab(page, "Billing")).toHaveAttribute(
            "aria-disabled",
            "true",
        );
        await expect(tab(page, "Password")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await page.keyboard.press("ArrowRight");
        await expect(tab(page, "Team")).toBeFocused();
        await expectOutput(page, "value", "team");
        await page.keyboard.press("ArrowRight");
        await expect(tab(page, "Account")).toBeFocused();
        await page.keyboard.press("End");
        await expect(tab(page, "Team")).toBeFocused();
        await page.keyboard.press("Home");
        await expect(tab(page, "Account")).toBeFocused();
    });

    test("Tab moves from the tab list to the panel, then on", async ({
        page,
    }) => {
        await tab(page, "Account").focus();
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("tabpanel", { name: "Account" }),
        ).toBeFocused();
        await page.keyboard.press("Tab");
        await expect(
            page.getByRole("button", { name: "After tabs" }),
        ).toBeFocused();
    });

    test("clicking a tab selects it", async ({ page }) => {
        await tab(page, "Team").click();
        await expect(tab(page, "Team")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expectOutput(page, "value", "team");
    });

    test("has no axe violation", async ({ page }) => {
        await expectNoAxeViolations(page);
    });
});

test("tabs / manual: arrows move focus only; Enter and Space select", async ({
    page,
}) => {
    await openScenario(page, "/tabs/manual");
    await tab(page, "Account").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Password")).toBeFocused();
    await expect(tab(page, "Account")).toHaveAttribute("aria-selected", "true");
    await expectOutput(page, "value", "account");
    await page.keyboard.press("Enter");
    await expect(tab(page, "Password")).toHaveAttribute(
        "aria-selected",
        "true",
    );
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Billing")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Team")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(tab(page, "Team")).toHaveAttribute("aria-selected", "true");
    await expectOutput(page, "value", "team");
});

test("tabs / vertical: up and down arrows; right does nothing", async ({
    page,
}) => {
    await openScenario(page, "/tabs/vertical");
    await expect(page.getByRole("tablist")).toHaveAttribute(
        "aria-orientation",
        "vertical",
    );
    await tab(page, "Account").focus();
    await page.keyboard.press("ArrowDown");
    await expect(tab(page, "Password")).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(tab(page, "Account")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Account")).toBeFocused();
});

test("tabs / automatic in RTL: ArrowLeft is next, ArrowRight is previous", async ({
    page,
}) => {
    await openScenario(page, "/tabs/automatic", { dir: "rtl" });
    await tab(page, "Account").focus();
    await page.keyboard.press("ArrowLeft");
    await expect(tab(page, "Password")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Account")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "Team")).toBeFocused();
});

// spec/tabs.md, "Animation" and `data-activation-direction` (Epic #32)
test.describe("tabs / animated", () => {
    const panel = (page: Page, text: string) =>
        page
            .locator('[data-primitives-part="tabs-panel"]')
            .filter({ hasText: text });
    const directions = (page: Page) =>
        page
            .locator('[data-primitives-part^="tabs-"]')
            .evaluateAll((elements) => [
                ...new Set(
                    elements.map((element) =>
                        element.getAttribute("data-activation-direction"),
                    ),
                ),
            ]);

    test("the activation direction follows the newly selected tab", async ({
        page,
    }) => {
        await openScenario(page, "/tabs/animated");
        await expect(panel(page, "Overview content")).toBeVisible();
        expect(await directions(page)).toEqual(["none"]);
        await expect(panel(page, "Overview content")).not.toHaveAttribute(
            "data-starting-style",
        );
        await tab(page, "Settings").click();
        await expectOutput(page, "value", "settings");
        await expect.poll(() => directions(page)).toEqual(["right"]);
        await tab(page, "Overview").click();
        await expect.poll(() => directions(page)).toEqual(["left"]);
    });

    test("the new panel enters and the old one exits, then is hidden", async ({
        page,
    }) => {
        await openScenario(page, "/tabs/animated");
        await slowMotion(page, 600);
        await expect(panel(page, "Overview content")).toBeVisible();
        const overview = panel(page, "Overview content");
        await overview.evaluate((element) => {
            const seen = { starting: false };
            (window as unknown as { __seen: typeof seen }).__seen = seen;
            new MutationObserver((records) => {
                for (const record of records) {
                    const target = record.target as Element;
                    if (
                        target.textContent?.includes("Settings content") &&
                        target.hasAttribute("data-starting-style")
                    ) {
                        seen.starting = true;
                    }
                }
            }).observe(element.parentElement as Element, {
                subtree: true,
                attributes: true,
                attributeFilter: ["data-starting-style", "hidden"],
            });
            (window as unknown as { __overview: Element }).__overview = element;
        });
        await tab(page, "Settings").click();
        await expect(overview).toHaveAttribute("data-ending-style");
        await expect(overview).toHaveAttribute("inert");
        await expect(overview).not.toHaveAttribute("hidden");
        await expect(overview).toHaveAttribute("hidden", "");
        await expect(overview).not.toHaveAttribute("data-ending-style");
        expect(
            await overview.evaluate(
                (element) =>
                    (window as unknown as { __overview: Element })
                        .__overview === element,
            ),
        ).toBe(true);
        await expect(panel(page, "Settings content")).toBeVisible();
        expect(
            await page.evaluate(
                () =>
                    (window as unknown as { __seen: { starting: boolean } })
                        .__seen.starting,
            ),
        ).toBe(true);
    });

    test("in RTL, the next tab sits on the left", async ({ page }) => {
        await openScenario(page, "/tabs/animated", { dir: "rtl" });
        await expect(panel(page, "Overview content")).toBeVisible();
        await tab(page, "Projects").click();
        await expect.poll(() => directions(page)).toEqual(["left"]);
        await tab(page, "Overview").click();
        await expect.poll(() => directions(page)).toEqual(["right"]);
    });

    // Epic #49 (#46): two keys before a render that comes after the task (a microtask between
    // them lets a framework that renders after each event's microtasks render in between)
    test("two keys in one task give the last step's direction", async ({
        page,
    }) => {
        await openScenario(page, "/tabs/animated");
        await expect(panel(page, "Overview content")).toBeVisible();
        await tab(page, "Overview").focus();
        await page.evaluate(async () => {
            for (const key of ["ArrowRight", "ArrowLeft"]) {
                document.activeElement?.dispatchEvent(
                    new KeyboardEvent("keydown", {
                        key,
                        bubbles: true,
                        cancelable: true,
                    }),
                );
                await Promise.resolve();
            }
        });
        await expect(tab(page, "Overview")).toBeFocused();
        await expect(tab(page, "Overview")).toHaveAttribute(
            "aria-selected",
            "true",
        );
        await expect.poll(() => directions(page)).toEqual(["left"]);
    });

    test("has no axe violation", async ({ page }) => {
        await openScenario(page, "/tabs/animated");
        await tab(page, "Projects").click();
        await expectNoAxeViolations(page);
    });
});

// Epic #49 (#46): with neither value nor defaultValue, the first tab is selected after the first
// render, so its panel enters (spec/tabs.md, "Animation")
test("tabs / animated-default: the first panel enters with data-starting-style", async ({
    page,
}) => {
    await page.addInitScript(() => {
        const seen = { starting: false };
        (window as unknown as { __seen: typeof seen }).__seen = seen;
        new MutationObserver(() => {
            if (
                document.querySelector(
                    '[data-primitives-part="tabs-panel"][data-starting-style]',
                ) !== null
            ) {
                seen.starting = true;
            }
        }).observe(document, {
            subtree: true,
            childList: true,
            attributes: true,
        });
    });
    await openScenario(page, "/tabs/animated-default");
    await expectOutput(page, "value", "overview");
    await expectOutput(page, "reason", "none");
    await expect(tab(page, "Overview")).toHaveAttribute(
        "aria-selected",
        "true",
    );
    await expect(
        page.getByRole("tabpanel", { name: "Overview" }),
    ).toContainText("Overview content");
    expect(
        await page.evaluate(
            () =>
                (window as unknown as { __seen: { starting: boolean } }).__seen
                    .starting,
        ),
    ).toBe(true);
});

test("tabs / vertical: the activation direction is up or down", async ({
    page,
}) => {
    await openScenario(page, "/tabs/vertical");
    const root = page.locator('[data-primitives-part="tabs-root"]');
    await tab(page, "Account").focus();
    await page.keyboard.press("ArrowDown");
    await expect(root).toHaveAttribute("data-activation-direction", "down");
    await page.keyboard.press("ArrowUp");
    await expect(root).toHaveAttribute("data-activation-direction", "up");
});
