import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

const localName = (locator: Locator) =>
    locator.evaluate((element) => element.localName);

// spec/carousel.md: the parts, their elements, their state attributes and structural styles
test("carousel / basic: parts, elements and state attributes", async ({
    page,
}) => {
    await openScenario(page, "/carousel/basic");
    const root = part(page, "carousel", "root");
    await expect(root).toHaveCount(1);
    expect(await localName(root)).toBe("div");
    await expect(root).toHaveAttribute("role", "region");
    await expect(root).toHaveAttribute("aria-roledescription", "carousel");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).not.toHaveAttribute("data-playing");
    expect(
        await root.evaluate((element) => [
            (element as HTMLElement).style.getPropertyValue(
                "--carousel-slides-per-page",
            ),
            (element as HTMLElement).style.getPropertyValue(
                "--carousel-spacing",
            ),
        ]),
    ).toEqual(["1", "0px"]);
    const group = part(root, "carousel", "item-group");
    expect(await localName(group)).toBe("div");
    await expect(group).toHaveAttribute("aria-live", "polite");
    await expect(group).toHaveAttribute("aria-atomic", "false");
    // its slides hold nothing Tab reaches: a tab stop of its own
    await expect(group).toHaveAttribute("tabindex", "0");
    await expect(group).toHaveAttribute("data-orientation", "horizontal");
    const style = await group.evaluate((element) => {
        const computed = getComputedStyle(element);
        return {
            display: computed.display,
            overflowX: computed.overflowX,
            snap: computed.scrollSnapType,
            scrollbar: computed.scrollbarWidth,
        };
    });
    expect(style).toEqual({
        display: "grid",
        overflowX: "auto",
        snap: "x mandatory",
        scrollbar: "none",
    });
    const groupId = await group.getAttribute("id");
    expect(groupId).toBeTruthy();
    const items = part(group, "carousel", "item");
    await expect(items).toHaveCount(4);
    for (let index = 0; index < 4; index++) {
        const item = items.nth(index);
        await expect(item).toHaveAttribute("data-index", String(index));
        await expect(item).toHaveAttribute("role", "group");
        await expect(item).toHaveAttribute("aria-roledescription", "slide");
        expect(
            await item.evaluate(
                (element) => getComputedStyle(element).scrollSnapAlign,
            ),
        ).toBe("start");
    }
    await expect(items.nth(0)).toHaveAttribute("data-inview", "");
    await expect(items.nth(0)).not.toHaveAttribute("inert");
    await expect(items.nth(1)).not.toHaveAttribute("data-inview");
    await expect(items.nth(1)).toHaveAttribute("inert", "");
    await expect(items.nth(1)).toHaveAttribute("aria-hidden", "true");
    for (const name of ["prev-trigger", "next-trigger"]) {
        const trigger = part(root, "carousel", name);
        expect(await localName(trigger)).toBe("button");
        await expect(trigger).toHaveAttribute("type", "button");
        await expect(trigger).toHaveAttribute("aria-controls", groupId ?? "");
    }
    await expect(part(root, "carousel", "prev-trigger")).toHaveAttribute(
        "data-disabled",
        "",
    );
    const indicators = part(root, "carousel", "indicator");
    await expect(indicators).toHaveCount(4);
    await expect(indicators.nth(0)).toHaveAttribute("data-current", "");
    await expect(indicators.nth(0)).toHaveAttribute("type", "button");
    await expect(indicators.nth(1)).not.toHaveAttribute("data-current");
    const indicatorGroup = part(root, "carousel", "indicator-group");
    await expect(indicatorGroup).toHaveAttribute("role", "group");
    await expect(indicatorGroup).not.toHaveAttribute("aria-orientation");
    await expectNoFalseStates(parts(page, "carousel"));
});

test("carousel / autoplay: the playing state", async ({ page }) => {
    await page.clock.install();
    await openScenario(page, "/carousel/autoplay");
    const root = part(page, "carousel", "root");
    await expect(root).toHaveAttribute("data-playing", "");
    const trigger = part(root, "carousel", "autoplay-trigger");
    expect(await localName(trigger)).toBe("button");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("data-playing", "");
    await expect(trigger).not.toHaveAttribute("aria-pressed");
    await expect(part(root, "carousel", "item-group")).toHaveAttribute(
        "aria-live",
        "off",
    );
    await trigger.click();
    await expect(trigger).not.toHaveAttribute("data-playing");
    await expect(root).not.toHaveAttribute("data-playing");
    await expectNoFalseStates(parts(page, "carousel"));
});

test("carousel / tabbed: tabs and tabpanels", async ({ page }) => {
    await openScenario(page, "/carousel/tabbed");
    const root = part(page, "carousel", "root");
    const list = part(root, "carousel", "indicator-group");
    await expect(list).toHaveAttribute("role", "tablist");
    await expect(list).toHaveAttribute("aria-orientation", "horizontal");
    const tabs = part(list, "carousel", "indicator");
    const items = part(root, "carousel", "item");
    for (let index = 0; index < 3; index++) {
        const tab = tabs.nth(index);
        const item = items.nth(index);
        await expect(tab).toHaveAttribute("role", "tab");
        await expect(item).toHaveAttribute("role", "tabpanel");
        await expect(item).not.toHaveAttribute("aria-roledescription");
        const itemId = await item.getAttribute("id");
        await expect(tab).toHaveAttribute("aria-controls", itemId ?? "");
        await expect(item).toHaveAttribute("aria-label", `${index + 1} of 3`);
        await expect(item).not.toHaveAttribute("aria-labelledby");
    }
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "false");
    await expect(tabs.nth(0)).not.toHaveAttribute("aria-disabled");
    await expectNoFalseStates(parts(page, "carousel"));
});

test("carousel / multiple: the spacing and the snapped page starts", async ({
    page,
}) => {
    await openScenario(page, "/carousel/multiple");
    const root = part(page, "carousel", "root");
    expect(
        await root.evaluate((element) => [
            (element as HTMLElement).style.getPropertyValue(
                "--carousel-slides-per-page",
            ),
            (element as HTMLElement).style.getPropertyValue(
                "--carousel-spacing",
            ),
        ]),
    ).toEqual(["2", "16px"]);
    const items = part(root, "carousel", "item");
    const snaps = await items.evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).scrollSnapAlign),
    );
    // the pages start at slides 0, 2 and 3
    expect(snaps).toEqual(["start", "none", "start", "start", "none"]);
    await expect(items.nth(0)).toHaveAttribute("data-inview", "");
    await expect(items.nth(1)).toHaveAttribute("data-inview", "");
    await expect(items.nth(2)).not.toHaveAttribute("data-inview");
    const gap = await part(root, "carousel", "item-group").evaluate(
        (element) => getComputedStyle(element).columnGap,
    );
    expect(gap).toBe("16px");
    await expectNoFalseStates(parts(page, "carousel"));
});

test("carousel / vertical: the vertical axis", async ({ page }) => {
    await openScenario(page, "/carousel/vertical");
    const root = part(page, "carousel", "root");
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    const group = part(root, "carousel", "item-group");
    await expect(group).toHaveAttribute("data-orientation", "vertical");
    const style = await group.evaluate((element) => {
        const computed = getComputedStyle(element);
        return { overflowY: computed.overflowY, snap: computed.scrollSnapType };
    });
    expect(style).toEqual({ overflowY: "auto", snap: "y mandatory" });
    await expect(part(root, "carousel", "prev-trigger")).not.toHaveAttribute(
        "data-disabled",
    );
    await expectNoFalseStates(parts(page, "carousel"));
});
