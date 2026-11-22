import { expect, type Locator, type Page, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { expectOutput } from "../../src/output.ts";
import { settleAnimations } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";
import { cssVariable } from "../../src/swipe.ts";

// spec/navigation-menu.md: parts, state attributes, the size variables and the activation direction
const openContent = (page: Page) =>
    page.locator('[data-primitives-part="navigation-menu-content"][data-open]');

async function sizeOf(locator: Locator) {
    return locator.evaluate((element) => ({
        width: (element as HTMLElement).offsetWidth,
        height: (element as HTMLElement).offsetHeight,
    }));
}

async function expectSizeVariables(page: Page) {
    await settleAnimations(page);
    const { width, height } = await sizeOf(openContent(page));
    expect(width).toBeGreaterThan(0);
    const popup = part(page, "navigation-menu", "popup");
    const positioner = part(page, "navigation-menu", "positioner");
    expect(await cssVariable(popup, "--popup-width")).toBe(`${width}px`);
    expect(await cssVariable(popup, "--popup-height")).toBe(`${height}px`);
    expect(await cssVariable(positioner, "--positioner-width")).toBe(
        `${width}px`,
    );
    expect(await cssVariable(positioner, "--positioner-height")).toBe(
        `${height}px`,
    );
    return { width, height };
}

test("navigation-menu / basic: parts and states, closed", async ({ page }) => {
    await openScenario(page, "/navigation-menu/basic");
    const root = part(page, "navigation-menu", "root");
    await expect(root).toHaveCount(1);
    await expect(root).toHaveJSProperty("tagName", "NAV");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(part(page, "navigation-menu", "list")).toHaveJSProperty(
        "tagName",
        "UL",
    );
    await expect(part(page, "navigation-menu", "item")).toHaveCount(3);
    await expect(part(page, "navigation-menu", "trigger")).toHaveCount(2);
    await expect(
        part(page, "navigation-menu", "trigger").first(),
    ).toHaveAttribute("type", "button");
    await expect(part(page, "navigation-menu", "icon").first()).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    await expect(part(page, "navigation-menu", "link")).toHaveCount(1);
    // the Portal renders nothing while closed
    await expect(part(page, "navigation-menu", "popup")).toHaveCount(0);
    await expect(part(page, "navigation-menu", "content")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "navigation-menu"));
});

test("navigation-menu / basic: parts and states, open", async ({ page }) => {
    await openScenario(page, "/navigation-menu/basic");
    await page.getByRole("button", { name: "Products" }).click();
    await expectOutput(page, "value", "products");
    const trigger = part(page, "navigation-menu", "trigger").first();
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(part(page, "navigation-menu", "icon").first()).toHaveAttribute(
        "data-popup-open",
        "",
    );
    const positioner = part(page, "navigation-menu", "positioner");
    await expect(positioner).toHaveAttribute("role", "presentation");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "center");
    await expectOpenState(positioner, true);
    const popup = part(page, "navigation-menu", "popup");
    await expectOpenState(popup, true);
    await expect(popup).toHaveAttribute("data-side", "bottom");
    await expect(part(page, "navigation-menu", "arrow")).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    await expect(part(page, "navigation-menu", "viewport")).toHaveCount(1);
    const content = part(page, "navigation-menu", "content");
    await expect(content).toHaveCount(1);
    await expectOpenState(content, true);
    await expect(content).toHaveAttribute("data-activation-direction", "none");
    await expect(page.getByRole("link", { name: "Analytics" })).toHaveAttribute(
        "data-active",
        "",
    );
    await expect(
        page.getByRole("link", { name: "Automation" }),
    ).not.toHaveAttribute("data-active");
    await expectNoFalseStates(parts(page, "navigation-menu"));
});

test("navigation-menu / basic: the size variables follow the open Content", async ({
    page,
}) => {
    await openScenario(page, "/navigation-menu/basic");
    await page.getByRole("button", { name: "Products" }).click();
    await expectOutput(page, "value", "products");
    const products = await expectSizeVariables(page);
    await page.getByRole("button", { name: "Learn" }).click();
    await expectOutput(page, "value", "learn");
    const learn = await expectSizeVariables(page);
    expect(learn.width).toBeGreaterThan(products.width);
    expect(learn.height).toBeLessThan(products.height);
});

test("navigation-menu / basic: data-activation-direction on both Contents of a switch", async ({
    page,
}) => {
    await openScenario(page, "/navigation-menu/basic");
    await page.addStyleTag({
        content: ":root { --pr-motion: 600ms !important; }",
    });
    await page.getByRole("button", { name: "Products" }).click();
    await expectOutput(page, "value", "products");
    await page.getByRole("button", { name: "Learn" }).click();
    const contents = part(page, "navigation-menu", "content");
    // the entering Content and the exiting one, both with the direction
    await expect(contents).toHaveCount(2);
    for (const index of [0, 1]) {
        await expect(contents.nth(index)).toHaveAttribute(
            "data-activation-direction",
            "right",
        );
    }
    await expect(
        page.locator(
            '[data-primitives-part="navigation-menu-content"][data-closed]',
        ),
    ).toHaveAttribute("data-ending-style", "");
    await expectNoFalseStates(parts(page, "navigation-menu"));
});

test("navigation-menu / nested: a nested Root is a div with its own vertical List", async ({
    page,
}) => {
    await openScenario(page, "/navigation-menu/nested");
    await page.getByRole("button", { name: "Products" }).click();
    const roots = part(page, "navigation-menu", "root");
    await expect(roots).toHaveCount(2);
    await expect(roots.nth(1)).toHaveJSProperty("tagName", "DIV");
    await expect(roots.nth(1)).toHaveAttribute("data-orientation", "vertical");
    await page.getByRole("button", { name: "Developers" }).click();
    await expect(part(page, "navigation-menu", "popup")).toHaveCount(2);
    await expect(
        part(page, "navigation-menu", "positioner").nth(1),
    ).toHaveAttribute("data-side", "inline-end");
    await expectNoFalseStates(parts(page, "navigation-menu"));
});
