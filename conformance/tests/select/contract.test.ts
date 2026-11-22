import { expect, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { settleAnimations, slowMotion } from "../../src/presence.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/select.md: anatomy, state attributes, the hidden input
test("select / basic: parts, placeholder, hidden input, open states", async ({
    page,
}) => {
    await openScenario(page, "/select/basic");
    const trigger = part(page, "select", "trigger");
    await expect(trigger).toHaveAttribute("role", "combobox");
    await expect(trigger).toHaveAttribute("type", "button");
    await expect(trigger).toHaveAttribute("data-placeholder", "");
    await expect(trigger).toHaveAttribute("aria-required", "true");
    await expect(part(trigger, "select", "value")).toHaveAttribute(
        "data-placeholder",
        "",
    );
    const input = part(page, "select", "input");
    await expect(input).toHaveCount(1);
    await expect(input).toHaveAttribute("name", "fruit");
    await expect(input).toHaveValue("");
    await expect(input).toHaveAttribute("required", "");
    await expect(input).toHaveAttribute("aria-hidden", "true");
    await expect(input).toHaveAttribute("tabindex", "-1");
    await expect(input).not.toHaveAttribute("type", "hidden");

    await expect(trigger).not.toHaveAttribute("data-popup-open");
    await trigger.click();
    // a trigger says its popup is open (D4 §3 "Naming"); `data-open` is the popup's own
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).not.toHaveAttribute("data-open");
    const positioner = part(page, "select", "positioner");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "start");
    await expect(part(page, "select", "popup")).toHaveAttribute(
        "data-open",
        "",
    );
    const list = part(page, "select", "list");
    await expect(list).toHaveAttribute("role", "listbox");
    await expect(trigger).toHaveAttribute(
        "aria-controls",
        (await list.getAttribute("id")) as string,
    );
    const items = part(page, "select", "item");
    await expect(items).toHaveCount(7);
    await expect(items.first()).toHaveAttribute("data-highlighted", "");
    await expect(items.first()).toHaveAttribute("aria-selected", "false");
    await expect(items.last()).toHaveAttribute("data-disabled", "");
    await expect(part(page, "select", "item-indicator")).toHaveCount(0);

    await page.getByRole("option", { name: "Banana" }).click();
    await expect(input).toHaveValue("banana");
    await expect(trigger).not.toHaveAttribute("data-placeholder");
    await trigger.click();
    const banana = page.getByRole("option", { name: "Banana" });
    await expect(banana).toHaveAttribute("data-selected", "");
    await expect(banana).toHaveAttribute("data-highlighted", "");
    await expect(part(banana, "select", "item-indicator")).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    await expect(part(page, "select", "item-indicator")).toHaveCount(1);
    await expectNoFalseStates(parts(page, "select"));
});

// spec/README.md, "State attributes": exactly one of data-open and data-closed, data-closed while
// the exit runs; the trigger keeps data-popup-open only
test("select / basic: data-open, then data-closed while the exit runs", async ({
    page,
}) => {
    await openScenario(page, "/select/basic");
    await slowMotion(page, 600);
    await page.getByRole("combobox", { name: "Fruit" }).click();
    await expectOpenState(part(page, "select", "positioner"), true);
    await expectOpenState(part(page, "select", "popup"), true);
    await settleAnimations(page);
    await page.keyboard.press("Escape");
    await expect(part(page, "select", "popup")).toHaveAttribute(
        "data-ending-style",
        "",
    );
    await expectOpenState(part(page, "select", "positioner"), false);
    await expectOpenState(part(page, "select", "popup"), false);
    await expect(part(page, "select", "trigger").first()).not.toHaveAttribute(
        "data-closed",
    );
    await expect(part(page, "select", "popup")).toHaveCount(0);
});

test("select / groups: groups, labels, the separator and item texts", async ({
    page,
}) => {
    await openScenario(page, "/select/groups");
    await page.getByRole("combobox", { name: "Food" }).click();
    const groups = part(page, "select", "group");
    await expect(groups).toHaveCount(2);
    await expect(groups.nth(0)).toHaveAttribute("role", "group");
    const labels = part(page, "select", "group-label");
    await expect(labels).toHaveCount(2);
    const labelId = await labels.nth(0).getAttribute("id");
    expect(labelId).toBeTruthy();
    await expect(groups.nth(0)).toHaveAttribute(
        "aria-labelledby",
        labelId as string,
    );
    const separator = part(page, "select", "separator");
    await expect(separator).toHaveCount(1);
    await expect(separator).toHaveAttribute("role", "presentation");
    await expect(separator).toHaveAttribute("data-orientation", "horizontal");
    await expect(part(page, "select", "item-text")).toHaveCount(5);
    await expect(
        part(page, "select", "item")
            .nth(2)
            .locator(part(page, "select", "item-text")),
    ).toHaveText("Carrot");
    await expectNoFalseStates(parts(page, "select"));
});
