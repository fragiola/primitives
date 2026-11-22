import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/separator.md: the part, semantic or decorative
test("separator / basic: the part, its role, orientation and data-orientation", async ({
    page,
}) => {
    await openScenario(page, "/separator/basic");
    const roots = part(page, "separator", "root");
    await expect(roots).toHaveCount(3);
    const horizontal = roots.nth(0);
    const vertical = roots.nth(1);
    const decorative = roots.nth(2);
    await expect(horizontal).toHaveAttribute("role", "separator");
    await expect(horizontal).toHaveAttribute("aria-orientation", "horizontal");
    await expect(horizontal).toHaveAttribute("data-orientation", "horizontal");
    await expect(vertical).toHaveAttribute("role", "separator");
    await expect(vertical).toHaveAttribute("aria-orientation", "vertical");
    await expect(vertical).toHaveAttribute("data-orientation", "vertical");
    await expect(decorative).toHaveAttribute("role", "none");
    await expect(decorative).not.toHaveAttribute("aria-orientation");
    await expect(decorative).toHaveAttribute("data-orientation", "horizontal");
    for (const root of await roots.all()) {
        expect(await root.evaluate((element) => element.localName)).toBe("div");
        await expect(root).not.toHaveAttribute("tabindex");
    }
    await expectNoFalseStates(parts(page, "separator"));
});
