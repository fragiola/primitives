import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tabs.md: anatomy, state attributes, indicator variables
test("tabs / automatic: parts, orientation, activation, selection", async ({
    page,
}) => {
    await openScenario(page, "/tabs/automatic");
    const root = part(page, "tabs", "root");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-activation", "automatic");
    await expect(part(page, "tabs", "list")).toHaveAttribute(
        "data-orientation",
        "horizontal",
    );
    const tabs = part(page, "tabs", "tab");
    await expect(tabs).toHaveCount(4);
    await expect(tabs.nth(0)).toHaveAttribute("data-selected", "");
    await expect(tabs.nth(1)).not.toHaveAttribute("data-selected");
    await expect(tabs.nth(2)).toHaveAttribute("data-disabled", "");
    await expect(part(page, "tabs", "panel")).toHaveAttribute(
        "data-selected",
        "",
    );
    const indicator = part(page, "tabs", "indicator");
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    const width = await indicator.evaluate((element) =>
        getComputedStyle(element).getPropertyValue(
            "--tabs-indicator-inline-size",
        ),
    );
    expect(width.trim()).toMatch(/px$/);
    await expectNoFalseStates(parts(page, "tabs"));
});

test("tabs / manual and vertical: the root reports them", async ({ page }) => {
    await openScenario(page, "/tabs/manual");
    await expect(part(page, "tabs", "root")).toHaveAttribute(
        "data-activation",
        "manual",
    );
    await openScenario(page, "/tabs/vertical");
    await expect(part(page, "tabs", "root")).toHaveAttribute(
        "data-orientation",
        "vertical",
    );
    await expect(part(page, "tabs", "tab").first()).toHaveAttribute(
        "data-orientation",
        "vertical",
    );
});

test("tabs / none-selected: no tab selected, no panel and no indicator rendered", async ({
    page,
}) => {
    await openScenario(page, "/tabs/none-selected");
    const tabs = part(page, "tabs", "tab");
    await expect(tabs).toHaveCount(2);
    for (const tab of await tabs.all()) {
        await expect(tab).toHaveAttribute("data-disabled", "");
        await expect(tab).not.toHaveAttribute("data-selected");
        await expect(tab).toHaveAttribute("aria-selected", "false");
    }
    await expect(part(page, "tabs", "panel")).toHaveCount(0);
    await expect(part(page, "tabs", "indicator")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "tabs"));
});

// spec/tabs.md, the Indicator's physical variables and `data-activation-direction` (Epic #32)
const variables = (indicator: Locator, names: readonly string[]) =>
    indicator.evaluate(
        (element, names) =>
            Object.fromEntries(
                names.map((name) => [
                    name,
                    getComputedStyle(element).getPropertyValue(name).trim(),
                ]),
            ),
        names,
    );

test("tabs / animated: the Indicator's physical variables match the logical ones", async ({
    page,
}) => {
    await openScenario(page, "/tabs/animated");
    const indicator = part(page, "tabs", "indicator");
    await expect(indicator).toHaveCount(1);
    const box = await variables(indicator, [
        "--active-tab-left",
        "--active-tab-right",
        "--active-tab-top",
        "--active-tab-bottom",
        "--active-tab-width",
        "--active-tab-height",
        "--tabs-indicator-inset-inline-start",
        "--tabs-indicator-inline-size",
    ]);
    for (const value of Object.values(box)) {
        expect(value).toMatch(/px$/);
    }
    expect(box["--active-tab-left"]).toBe(
        box["--tabs-indicator-inset-inline-start"],
    );
    expect(box["--active-tab-width"]).toBe(box["--tabs-indicator-inline-size"]);
    for (const name of ["root", "list", "tab", "indicator", "panel"]) {
        await expect(part(page, "tabs", name).first()).toHaveAttribute(
            "data-activation-direction",
            "none",
        );
    }
});

test("tabs / animated in RTL: the right offset is the inline start", async ({
    page,
}) => {
    await openScenario(page, "/tabs/animated", { dir: "rtl" });
    const indicator = part(page, "tabs", "indicator");
    await expect(indicator).toHaveCount(1);
    const box = await variables(indicator, [
        "--active-tab-right",
        "--tabs-indicator-inset-inline-start",
    ]);
    expect(box["--active-tab-right"]).toBe(
        box["--tabs-indicator-inset-inline-start"],
    );
});

test("tabs / vertical: the top offset is the block start", async ({ page }) => {
    await openScenario(page, "/tabs/vertical");
    const indicator = part(page, "tabs", "indicator");
    await expect(indicator).toHaveCount(1);
    const box = await variables(indicator, [
        "--active-tab-top",
        "--tabs-indicator-inset-block-start",
        "--active-tab-height",
        "--tabs-indicator-block-size",
    ]);
    expect(box["--active-tab-top"]).toBe(
        box["--tabs-indicator-inset-block-start"],
    );
    expect(box["--active-tab-height"]).toBe(box["--tabs-indicator-block-size"]);
});
