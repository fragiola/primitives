import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    requireExamples,
} from "../helpers.ts";

// switch: quick settings (spec/switch.md). Switches "Wi-Fi" (on), "Bluetooth" (off) and
// "Airplane mode" (disabled), each named by a `<label for>`.

test("a click, Space and Enter toggle a switch; the disabled one ignores them", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "switch" });
    const toggle = (name: string) => frame.getByRole("switch", { name });
    await expect(toggle("Wi-Fi")).toHaveAttribute(
        "data-primitives-part",
        "switch-root",
    );
    await expect(toggle("Wi-Fi")).toHaveAttribute("aria-checked", "true");
    await expect(toggle("Bluetooth")).toHaveAttribute("aria-checked", "false");

    await toggle("Bluetooth").click();
    await expect(toggle("Bluetooth")).toHaveAttribute("aria-checked", "true");
    await toggle("Wi-Fi").focus();
    await page.keyboard.press("Space");
    await expect(toggle("Wi-Fi")).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Enter");
    await expect(toggle("Wi-Fi")).toHaveAttribute("aria-checked", "true");
    await frame.getByText("Bluetooth").click();
    await expect(toggle("Bluetooth")).toHaveAttribute("aria-checked", "false");

    await expect(toggle("Airplane mode")).toBeDisabled();
    await frame.getByText("Airplane mode").click({ force: true });
    await expect(toggle("Airplane mode")).toHaveAttribute(
        "aria-checked",
        "false",
    );
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("switch");
    await page.goto(`${EMBED_BASE}?id=switch`);
    await expect(page.getByRole("switch")).toHaveCount(3);
    expect(await axeViolations(page)).toEqual([]);
});
