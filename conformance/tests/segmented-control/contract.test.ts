import { expect, type Locator, type Page, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/segmented-control.md: anatomy, state attributes, the hidden input, the Indicator's variables

const NAMES = [
    "inset-inline-start",
    "inset-block-start",
    "inline-size",
    "block-size",
    "left",
    "right",
    "top",
    "bottom",
    "width",
    "height",
] as const;

type Box = Record<(typeof NAMES)[number], number>;

/** The Indicator's ten variables, in pixels. */
function variables(indicator: Locator): Promise<Box> {
    return indicator.evaluate((element, names) => {
        const style = getComputedStyle(element);
        return Object.fromEntries(
            names.map((name) => {
                const value = style
                    .getPropertyValue(`--segment-indicator-${name}`)
                    .trim();
                return [
                    name,
                    value.endsWith("px")
                        ? Number.parseFloat(value)
                        : Number.NaN,
                ];
            }),
        ) as Box;
    }, NAMES);
}

/** The checked Item's box from the Root's padding box, measured in the page. */
function measured(page: Page, name: string): Promise<Box> {
    return page.getByRole("radio", { name, exact: true }).evaluate((item) => {
        const root = item.closest(
            '[data-primitives-part="segmented-control-root"]',
        ) as HTMLElement;
        const rootRect = root.getBoundingClientRect();
        const rect = item.getBoundingClientRect();
        // the padding box: the border box less the borders
        const style = getComputedStyle(root);
        const left =
            rect.left -
            rootRect.left -
            Number.parseFloat(style.borderLeftWidth);
        const right =
            rootRect.right -
            Number.parseFloat(style.borderRightWidth) -
            rect.right;
        const top =
            rect.top - rootRect.top - Number.parseFloat(style.borderTopWidth);
        const bottom =
            rootRect.bottom -
            Number.parseFloat(style.borderBottomWidth) -
            rect.bottom;
        const rtl = style.direction === "rtl";
        return {
            "inset-inline-start": rtl ? right : left,
            "inset-block-start": top,
            "inline-size": rect.width,
            "block-size": rect.height,
            left,
            right,
            top,
            bottom,
            width: rect.width,
            height: rect.height,
        };
    });
}

/** The Indicator's variables are the Item's box (within a pixel: the Root's client sizes round). */
async function expectIndicatorOn(page: Page, name: string): Promise<Box> {
    const indicator = part(page, "segmented-control", "indicator");
    await expect(indicator).toHaveCount(1);
    await expect
        .poll(async () => {
            const [box, expected] = await Promise.all([
                variables(indicator),
                measured(page, name),
            ]);
            return NAMES.filter(
                (key) => !(Math.abs(box[key] - expected[key]) <= 1),
            );
        })
        .toEqual([]);
    return variables(indicator);
}

test("segmented-control / basic: parts, states, the tab stop and the hidden input", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/basic");
    const root = part(page, "segmented-control", "root");
    await expect(root).toHaveAttribute("role", "radiogroup");
    await expect(root).toHaveAttribute("aria-orientation", "horizontal");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).not.toHaveAttribute("aria-required");
    await expect(root).not.toHaveAttribute("data-required");
    await expect(root).not.toHaveAttribute("data-disabled");

    const items = part(page, "segmented-control", "item");
    await expect(items).toHaveCount(4);
    const checked = [true, false, false, false];
    for (const [index, element] of (await items.all()).entries()) {
        await expect(element).toHaveAttribute("type", "button");
        await expect(element).toHaveAttribute("data-orientation", "horizontal");
        if (checked[index]) {
            await expect(element).toHaveAttribute("aria-checked", "true");
            await expect(element).toHaveAttribute("data-checked", "");
            await expect(element).not.toHaveAttribute("data-unchecked");
            await expect(element).toHaveAttribute("tabindex", "0");
        } else {
            await expect(element).toHaveAttribute("aria-checked", "false");
            await expect(element).toHaveAttribute("data-unchecked", "");
            await expect(element).not.toHaveAttribute("data-checked");
            await expect(element).toHaveAttribute("tabindex", "-1");
        }
    }
    const board = page.getByRole("radio", { name: "Board" });
    await expect(board).toHaveAttribute("disabled", "");
    await expect(board).toHaveAttribute("data-disabled", "");
    const texts = part(page, "segmented-control", "item-text");
    await expect(texts).toHaveCount(4);
    await expect(texts.nth(0)).toHaveAttribute("data-checked", "");
    await expect(texts.nth(1)).toHaveAttribute("data-unchecked", "");
    await expect(texts.nth(2)).toHaveAttribute("data-disabled", "");

    const input = part(page, "segmented-control", "input");
    await expect(input).toHaveCount(1);
    await expect(input).toHaveAttribute("name", "view");
    await expect(input).toHaveValue("list");
    await expect(input).toHaveAttribute("aria-hidden", "true");
    await expect(input).toHaveAttribute("tabindex", "-1");
    await expect(input).not.toHaveAttribute("required");

    const indicator = part(page, "segmented-control", "indicator");
    await expect(indicator).toHaveAttribute("aria-hidden", "true");
    await expect(indicator).toHaveAttribute("data-orientation", "horizontal");
    await expect(indicator).not.toHaveAttribute("data-disabled");
    const box = await expectIndicatorOn(page, "List");
    expect(box["inset-inline-start"]).toBe(box.left);

    await page.getByRole("radio", { name: "List" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(input).toHaveValue("grid");
    const before = await expectIndicatorOn(page, "Grid");

    // a resize of the Root moves and grows the checked Item: the Indicator follows
    await root.evaluate((element) => {
        (element as HTMLElement).style.width = "480px";
    });
    const after = await expectIndicatorOn(page, "Grid");
    expect(after.width).toBeGreaterThan(before.width);
    await expectNoFalseStates(parts(page, "segmented-control"));
});

test("segmented-control / basic in RTL: the inline start is the right offset", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/basic", { dir: "rtl" });
    const box = await expectIndicatorOn(page, "List");
    expect(box["inset-inline-start"]).toBe(box.right);
    await page.getByRole("radio", { name: "List" }).focus();
    await page.keyboard.press("ArrowLeft");
    const grid = await expectIndicatorOn(page, "Grid");
    expect(grid["inset-inline-start"]).toBe(grid.right);
});

test("segmented-control / vertical: the orientation on every part, the block start", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/vertical");
    for (const name of ["root", "item", "indicator"]) {
        for (const element of await part(
            page,
            "segmented-control",
            name,
        ).all()) {
            await expect(element).toHaveAttribute(
                "data-orientation",
                "vertical",
            );
        }
    }
    await expect(part(page, "segmented-control", "root")).toHaveAttribute(
        "aria-orientation",
        "vertical",
    );
    const box = await expectIndicatorOn(page, "Day");
    expect(box.top).toBe(box["inset-block-start"]);
    await page.getByRole("radio", { name: "Day" }).focus();
    await page.keyboard.press("ArrowDown");
    const week = await expectIndicatorOn(page, "Week");
    expect(week.top).toBeGreaterThan(box.top);
    expect(week["block-size"]).toBe(week.height);
});

test("segmented-control / disabled: every part carries data-disabled", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/disabled");
    const root = part(page, "segmented-control", "root");
    await expect(root).toHaveAttribute("aria-disabled", "true");
    await expect(root).toHaveAttribute("data-disabled", "");
    for (const name of ["item", "item-text", "indicator"]) {
        for (const element of await part(
            page,
            "segmented-control",
            name,
        ).all()) {
            await expect(element).toHaveAttribute("data-disabled", "");
        }
    }
    for (const element of await part(page, "segmented-control", "item").all()) {
        await expect(element).toHaveAttribute("tabindex", "-1");
        await expect(element).toHaveAttribute("disabled", "");
    }
    await expect(part(page, "segmented-control", "input")).toHaveAttribute(
        "disabled",
        "",
    );
    await expectIndicatorOn(page, "Grid");
    await expectNoFalseStates(parts(page, "segmented-control"));
});

test("segmented-control / field: required, no Indicator while none is checked", async ({
    page,
}) => {
    await openScenario(page, "/segmented-control/field");
    const root = part(page, "segmented-control", "root");
    await expect(root).toHaveAttribute("aria-required", "true");
    await expect(root).toHaveAttribute("data-required", "");
    await expect(part(page, "segmented-control", "indicator")).toHaveCount(0);
    const input = part(page, "segmented-control", "input");
    await expect(input).toHaveAttribute("required", "");
    await expect(input).toHaveValue("");
    // no name while none is checked: nothing is submitted
    await expect(input).not.toHaveAttribute("name");
    await expect(
        part(page, "segmented-control", "item").first(),
    ).toHaveAttribute("tabindex", "0");
    await page.getByRole("radio", { name: "Spacious" }).click();
    await expect(input).toHaveAttribute("name", "density");
    await expect(input).toHaveValue("spacious");
    await expectIndicatorOn(page, "Spacious");
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(part(page, "segmented-control", "indicator")).toHaveCount(0);
    await expectNoFalseStates(parts(page, "segmented-control"));
});
