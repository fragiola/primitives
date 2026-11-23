import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { pointAlong } from "../../src/pointer.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/rating.md: anatomy, state attributes, the tab stop and the HiddenInput
test("rating / basic: parts, states, the tab stop and the HiddenInput", async ({
    page,
}) => {
    await openScenario(page, "/rating/basic");
    const root = part(page, "rating", "root");
    await expect(root).toHaveAttribute("role", "radiogroup");
    for (const name of [
        "aria-readonly",
        "aria-disabled",
        "aria-required",
        "data-readonly",
        "data-disabled",
        "data-required",
    ]) {
        await expect(root).not.toHaveAttribute(name);
    }
    const items = part(page, "rating", "item");
    await expect(items).toHaveCount(5);
    for (const [index, item] of (await items.all()).entries()) {
        await expect(item).toHaveAttribute("type", "button");
        await expect(item).toHaveAttribute("aria-checked", "false");
        await expect(item).toHaveAttribute("data-unchecked", "");
        await expect(item).not.toHaveAttribute("data-checked");
        await expect(item).not.toHaveAttribute("data-highlighted");
        await expect(item).not.toHaveAttribute("data-half");
        // no value: the first star holds the tab stop
        await expect(item).toHaveAttribute(
            "tabindex",
            index === 0 ? "0" : "-1",
        );
    }
    const input = part(page, "rating", "hidden-input");
    await expect(input).toHaveCount(1);
    await expect(input).toHaveValue("");
    await expect(input).not.toHaveAttribute("name");
    await expect(input).toHaveAttribute("aria-hidden", "true");
    await expect(input).toHaveAttribute("tabindex", "-1");

    await items.nth(3).click();
    await expect(items.nth(3)).toHaveAttribute("data-checked", "");
    await expect(items.nth(3)).not.toHaveAttribute("data-unchecked");
    await expect(items.nth(3)).toHaveAttribute("tabindex", "0");
    await expect(items.nth(0)).toHaveAttribute("tabindex", "-1");
    for (const index of [0, 1, 2, 3]) {
        await expect(items.nth(index)).toHaveAttribute("data-highlighted", "");
    }
    await expect(items.nth(4)).not.toHaveAttribute("data-highlighted");
    await expect(input).toHaveAttribute("name", "rating");
    await expect(input).toHaveValue("4");
    await expectNoFalseStates(parts(page, "rating"));
});

test("rating / half: data-half on the star of a half value, the value as text", async ({
    page,
}) => {
    await openScenario(page, "/rating/half");
    const items = part(page, "rating", "item");
    await expect(items.nth(2)).toHaveAttribute("data-checked", "");
    await expect(items.nth(2)).toHaveAttribute("data-half", "");
    await expect(items.nth(2)).toHaveAttribute("data-highlighted", "");
    await expect(items.nth(1)).not.toHaveAttribute("data-half");
    // the preview over the start half of star 5
    const point = await pointAlong(items.nth(4), 0.25);
    await page.mouse.move(point.x, point.y);
    await expect(items.nth(4)).toHaveAttribute("data-half", "");
    await expect(items.nth(4)).toHaveAttribute("data-highlighted", "");
    await expect(items.nth(2)).not.toHaveAttribute("data-half");
    // the check stays on the value
    await expect(items.nth(2)).toHaveAttribute("data-checked", "");
    await expectNoFalseStates(parts(page, "rating"));
});

test("rating / read-only: data-readonly and data-disabled on every part", async ({
    page,
}) => {
    await openScenario(page, "/rating/read-only");
    const [quality, service] = await part(page, "rating", "root").all();
    if (quality === undefined || service === undefined) {
        throw new Error("two Roots");
    }
    await expect(quality).toHaveAttribute("aria-readonly", "true");
    await expect(quality).toHaveAttribute("data-readonly", "");
    await expect(quality).not.toHaveAttribute("data-disabled");
    await expect(service).toHaveAttribute("aria-disabled", "true");
    await expect(service).toHaveAttribute("data-disabled", "");
    for (const [index, item] of (
        await part(quality, "rating", "item").all()
    ).entries()) {
        await expect(item).toHaveAttribute("data-readonly", "");
        await expect(item).not.toHaveAttribute("disabled");
        await expect(item).toHaveAttribute(
            "tabindex",
            index === 2 ? "0" : "-1",
        );
    }
    for (const item of await part(service, "rating", "item").all()) {
        await expect(item).toHaveAttribute("data-disabled", "");
        await expect(item).toHaveAttribute("disabled", "");
        await expect(item).toHaveAttribute("tabindex", "-1");
    }
    await expectNoFalseStates(parts(page, "rating"));
});

test("rating / field: required on the Root and the HiddenInput", async ({
    page,
}) => {
    await openScenario(page, "/rating/field");
    const root = part(page, "rating", "root");
    await expect(root).toHaveAttribute("aria-required", "true");
    await expect(root).toHaveAttribute("data-required", "");
    const input = part(page, "rating", "hidden-input");
    await expect(input).toHaveAttribute("required", "");
    await expectNoFalseStates(parts(page, "rating"));
});
