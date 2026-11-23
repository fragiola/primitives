import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/toggle.md: the part, the pressed and disabled states, native and not
test("toggle / basic: the part, aria-pressed, data-pressed and the disabled states", async ({
    page,
}) => {
    await openScenario(page, "/toggle/basic");
    const roots = part(page, "toggle", "root");
    await expect(roots).toHaveCount(4);
    const bold = page.getByRole("button", { name: "Bold" });
    await expect(bold).toHaveAttribute("type", "button");
    await expect(bold).toHaveAttribute("aria-pressed", "false");
    await expect(bold).not.toHaveAttribute("data-pressed");
    await expect(bold).not.toHaveAttribute("tabindex");
    const italic = page.getByRole("button", { name: "Italic" });
    await expect(italic).toHaveAttribute("aria-pressed", "true");
    await expect(italic).toHaveAttribute("data-pressed", "");
    const underline = page.getByRole("button", { name: "Underline" });
    await expect(underline).toHaveAttribute("disabled", "");
    await expect(underline).toHaveAttribute("data-disabled", "");
    await expect(underline).not.toHaveAttribute("aria-disabled");
    const strike = page.getByRole("button", { name: "Strike" });
    await expect(strike).toHaveJSProperty("tagName", "SPAN");
    await expect(strike).toHaveAttribute("role", "button");
    await expect(strike).toHaveAttribute("tabindex", "0");
    await expect(strike).toHaveAttribute("aria-pressed", "false");
    await expect(strike).not.toHaveAttribute("type");

    await bold.click();
    await expect(bold).toHaveAttribute("data-pressed", "");
    await strike.click();
    await expect(strike).toHaveAttribute("data-pressed", "");
    await expectNoFalseStates(parts(page, "toggle"));
});

test("toggle / controlled: the consumer's state on the part", async ({
    page,
}) => {
    await openScenario(page, "/toggle/controlled");
    const mute = part(page, "toggle", "root");
    await expect(mute).toHaveAttribute("aria-pressed", "true");
    await expect(mute).toHaveAttribute("data-pressed", "");
    await mute.click();
    await expect(mute).toHaveAttribute("aria-pressed", "false");
    await expect(mute).not.toHaveAttribute("data-pressed");
    await expectNoFalseStates(parts(page, "toggle"));
});
