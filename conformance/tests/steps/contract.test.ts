import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

const localName = (locator: Locator) =>
    locator.evaluate((element) => element.localName);

// spec/steps.md: the parts, their elements and their state attributes
test("steps / basic: parts, elements and state attributes", async ({
    page,
}) => {
    await openScenario(page, "/steps/basic");
    const root = part(page, "steps", "root");
    await expect(root).toHaveCount(1);
    expect(await localName(root)).toBe("div");
    await expect(root).toHaveAttribute("data-orientation", "horizontal");
    await expect(root).not.toHaveAttribute("data-completed");
    const list = part(root, "steps", "list");
    expect(await localName(list)).toBe("ol");
    const items = part(list, "steps", "item");
    await expect(items).toHaveCount(3);
    for (const item of await items.all()) {
        expect(await localName(item)).toBe("li");
    }
    await expect(items.nth(0)).toHaveAttribute("data-current", "");
    await expect(items.nth(1)).toHaveAttribute("data-incomplete", "");
    const triggers = part(list, "steps", "trigger");
    await expect(triggers).toHaveCount(3);
    const contents = part(root, "steps", "content");
    await expect(contents).toHaveCount(3);
    for (let index = 0; index < 3; index++) {
        const trigger = triggers.nth(index);
        expect(await localName(trigger)).toBe("button");
        await expect(trigger).toHaveAttribute("type", "button");
        const id = await contents.nth(index).getAttribute("id");
        expect(id).toBeTruthy();
        await expect(trigger).toHaveAttribute("aria-controls", id ?? "");
    }
    await expect(contents.nth(0)).toHaveAttribute("data-current", "");
    await expect(contents.nth(1)).toHaveAttribute("hidden", "");
    const indicators = part(list, "steps", "indicator");
    await expect(indicators).toHaveCount(3);
    expect(await localName(indicators.first())).toBe("span");
    await expect(indicators.first()).toHaveAttribute("aria-hidden", "true");
    const separators = part(list, "steps", "separator");
    await expect(separators).toHaveCount(2);
    await expect(separators.first()).toHaveAttribute("aria-hidden", "true");
    await expect(separators.first()).toHaveAttribute(
        "data-orientation",
        "horizontal",
    );
    const prev = part(root, "steps", "prev-trigger");
    await expect(prev).toHaveAttribute("data-disabled", "");
    await expect(prev).toHaveAttribute("type", "button");
    const next = part(root, "steps", "next-trigger");
    await expect(next).not.toHaveAttribute("data-disabled");
    const completed = part(root, "steps", "completed-content");
    await expect(completed).toHaveAttribute("hidden", "");

    await next.click();
    await expect(items.nth(0)).toHaveAttribute("data-completed", "");
    await expect(indicators.nth(0)).toHaveAttribute("data-completed", "");
    await expect(separators.nth(0)).toHaveAttribute("data-completed", "");
    await expect(items.nth(1)).toHaveAttribute("data-current", "");
    await next.click();
    await next.click();
    await expect(root).toHaveAttribute("data-completed", "");
    await expect(completed).not.toHaveAttribute("hidden");
    await expect(next).toHaveAttribute("data-disabled", "");
    await expectNoFalseStates(parts(page, "steps"));
});

test("steps / linear: an unreachable step's Item and Trigger are disabled", async ({
    page,
}) => {
    await openScenario(page, "/steps/linear");
    const items = part(page, "steps", "item");
    await expect(items.nth(0)).not.toHaveAttribute("data-disabled");
    await expect(items.nth(1)).toHaveAttribute("data-disabled", "");
    const triggers = part(page, "steps", "trigger");
    await expect(triggers.nth(2)).toHaveAttribute("data-disabled", "");
    await expect(triggers.nth(2)).toHaveAttribute("disabled", "");
    await expect(part(page, "steps", "next-trigger")).toHaveAttribute(
        "data-disabled",
        "",
    );
    await expectNoFalseStates(parts(page, "steps"));
});
