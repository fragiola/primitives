import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations, slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/cascade-select.md: anatomy, state attributes, the levels, the hidden input
test("cascade-select / basic: parts, levels, item states, hidden input", async ({
    page,
}) => {
    await openScenario(page, "/cascade-select/basic");
    const trigger = part(page, "cascade-select", "trigger");
    await expect(trigger).toHaveAttribute("role", "combobox");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    await expect(trigger).toHaveAttribute("data-placeholder", "");
    await expect(trigger).toHaveAttribute("aria-required", "true");
    await expect(part(trigger, "cascade-select", "value")).toHaveAttribute(
        "data-placeholder",
        "",
    );
    const input = part(page, "cascade-select", "input");
    await expect(input).toHaveCount(1);
    await expect(input).toHaveAttribute("name", "location");
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute("required", "");
    await expect(input).toHaveAttribute("aria-hidden", "true");
    await expect(input).toHaveAttribute("tabindex", "-1");
    await expect(input).not.toHaveAttribute("type", "hidden");

    await trigger.click();
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    const positioner = part(page, "cascade-select", "positioner");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "start");
    await expect(part(page, "cascade-select", "popup")).toHaveAttribute(
        "data-open",
        "",
    );
    const level = part(page, "cascade-select", "level");
    await expect(level).toHaveCount(3);
    await expect(level.nth(0)).toHaveAttribute("role", "listbox");
    await expect(level.nth(0)).toHaveAttribute("data-depth", "0");
    await expect(level.nth(1)).toHaveAttribute("data-depth", "1");
    await expect(level.nth(1)).toHaveAttribute("hidden", "");
    await expect(level.nth(2)).toHaveAttribute("hidden", "");
    await expect(trigger).toHaveAttribute(
        "aria-controls",
        (await level.nth(0).getAttribute("id")) as string,
    );
    const items = part(page, "cascade-select", "item");
    await expect(items).toHaveCount(5);
    await expect(items.first()).toHaveAttribute("data-highlighted", "");
    await expect(items.first()).toHaveAttribute("aria-selected", "false");
    await expect(items.first()).toHaveAttribute("data-has-children", "");
    await expect(items.nth(2)).not.toHaveAttribute("data-has-children");
    await expect(items.last()).toHaveAttribute("data-disabled", "");
    await expect(items.last()).toHaveAttribute("aria-disabled", "true");
    await expect(part(page, "cascade-select", "item-indicator")).toHaveCount(0);

    // Europe, then France: two parents with their levels open
    await page.getByRole("option", { name: "Europe" }).click();
    await page.getByRole("option", { name: "France" }).click();
    const europe = page.getByRole("option", { name: "Europe" });
    await expect(europe).toHaveAttribute("data-expanded", "");
    await expect(europe).toHaveAttribute(
        "aria-controls",
        (await level.nth(1).getAttribute("id")) as string,
    );
    await expect(level.nth(1)).toHaveAttribute(
        "aria-labelledby",
        (await europe.getAttribute("id")) as string,
    );
    await expect(level.nth(2)).not.toHaveAttribute("hidden");
    const ids = await Promise.all(
        [0, 1, 2].map((at) => level.nth(at).getAttribute("id")),
    );
    await expect(trigger).toHaveAttribute("aria-controls", ids.join(" "));
    await page.getByRole("option", { name: "Paris" }).click();
    await expect(input).toHaveValue("europe/france/paris");
    await expect(trigger).not.toHaveAttribute("data-placeholder");

    await trigger.click();
    const paris = page.getByRole("option", { name: "Paris" });
    await expect(paris).toHaveAttribute("data-selected", "");
    await expect(paris).toHaveAttribute("data-highlighted", "");
    await expect(paris).not.toHaveAttribute("aria-controls");
    await expect(
        part(paris, "cascade-select", "item-indicator"),
    ).toHaveAttribute("aria-hidden", "true");
    await expect(part(page, "cascade-select", "item-indicator")).toHaveCount(3);
    await expectNoFalseStates(parts(page, "cascade-select"));
});

test("cascade-select / basic: data-open, then data-closed while the exit runs", async ({
    page,
}) => {
    await openScenario(page, "/cascade-select/basic");
    await slowMotion(page, 600);
    await page.getByRole("combobox", { name: "Location" }).click();
    await expectOpenState(part(page, "cascade-select", "positioner"), true);
    await expectOpenState(part(page, "cascade-select", "popup"), true);
    await settleAnimations(page);
    await page.keyboard.press("Escape");
    await expect(part(page, "cascade-select", "popup")).toHaveAttribute(
        "data-ending-style",
        "",
    );
    await expectOpenState(part(page, "cascade-select", "popup"), false);
    await expect(part(page, "cascade-select", "popup")).toHaveCount(0);
});

test("cascade-select / field: the field's attributes on the trigger", async ({
    page,
}) => {
    await openScenario(page, "/cascade-select/field");
    const trigger = part(page, "cascade-select", "trigger");
    await expect(trigger).toHaveAttribute("data-filled", "");
    await expect(part(page, "cascade-select", "input")).toHaveAttribute(
        "name",
        "place",
    );
    await expect(part(page, "cascade-select", "input")).toHaveValue(
        "europe/france/lyon",
    );
    const label = page.locator('[data-primitives-part="field-label"]');
    await expect(label).toHaveAttribute(
        "for",
        (await trigger.getAttribute("id")) as string,
    );
});
