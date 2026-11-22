import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/switch.md: anatomy, state attributes, the hidden inputs
test("switch / basic: parts, states and hidden inputs", async ({ page }) => {
    await openScenario(page, "/switch/basic");
    const roots = part(page, "switch", "root");
    await expect(roots).toHaveCount(5);
    await expect(part(page, "switch", "thumb")).toHaveCount(5);
    const toggle = (name: string) =>
        page.getByRole("switch", { name, exact: true });

    const wifi = toggle("Wi-Fi");
    await expect(wifi).toHaveAttribute("data-primitives-part", "switch-root");
    await expect(wifi).toHaveAttribute("type", "button");
    await expect(wifi).toHaveAttribute("data-checked", "");
    await expect(wifi).not.toHaveAttribute("data-unchecked");
    const wifiThumb = part(wifi, "switch", "thumb");
    await expect(wifiThumb).toHaveAttribute("data-checked", "");
    await expect(wifiThumb).not.toHaveAttribute("data-unchecked");

    const terms = toggle("Accept terms");
    await expect(terms).toHaveAttribute("data-unchecked", "");
    await expect(terms).toHaveAttribute("data-required", "");
    await expect(terms).not.toHaveAttribute("aria-readonly");
    await expect(part(terms, "switch", "thumb")).toHaveAttribute(
        "data-required",
        "",
    );

    const location = toggle("Location");
    await expect(location).toHaveAttribute("data-readonly", "");
    await expect(part(location, "switch", "thumb")).toHaveAttribute(
        "data-readonly",
        "",
    );
    const airplane = toggle("Airplane mode");
    await expect(airplane).toHaveAttribute("disabled", "");
    await expect(airplane).toHaveAttribute("data-disabled", "");
    await expect(part(airplane, "switch", "thumb")).toHaveAttribute(
        "data-disabled",
        "",
    );

    const inputs = part(page, "switch", "input");
    await expect(inputs).toHaveCount(5);
    for (const input of await inputs.all()) {
        await expect(input).toHaveAttribute("type", "checkbox");
        await expect(input).toHaveAttribute("aria-hidden", "true");
        await expect(input).toHaveAttribute("tabindex", "-1");
    }
    await expect(inputs.nth(0)).toHaveAttribute("name", "wifi");
    await expect(inputs.nth(0)).toHaveAttribute("value", "on");
    await expect(inputs.nth(0)).toBeChecked();
    await expect(inputs.nth(1)).toHaveAttribute("value", "yes");
    await expect(inputs.nth(2)).toHaveAttribute("required", "");
    await expect(inputs.nth(4)).toHaveAttribute("disabled", "");

    // the unchecked input: only while off, and only with uncheckedValue
    const unchecked = part(page, "switch", "unchecked-input");
    await expect(unchecked).toHaveCount(1);
    await expect(unchecked).toHaveAttribute("type", "hidden");
    await expect(unchecked).toHaveAttribute("name", "bluetooth");
    await expect(unchecked).toHaveAttribute("value", "no");
    const bluetooth = toggle("Bluetooth");
    await bluetooth.click();
    await expect(bluetooth).toHaveAttribute("data-checked", "");
    await expect(unchecked).toHaveCount(0);
    await expect(inputs.nth(1)).toBeChecked();
    await expectNoFalseStates(parts(page, "switch"));
});
