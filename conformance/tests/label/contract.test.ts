import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/label.md: one part, a native label, its `for` and `id` forwarded
test("label / controls: a native label carrying its part", async ({ page }) => {
    await openScenario(page, "/label/controls");
    const labels = part(page, "label", "root");
    await expect(labels).toHaveCount(5);
    for (const label of await labels.all()) {
        expect(await label.evaluate((element) => element.localName)).toBe(
            "label",
        );
    }
    await expect(labels.nth(0)).toHaveAttribute("for", "email");
    await expect(labels.nth(1)).not.toHaveAttribute("for");
    await expect(labels.nth(4)).toHaveAttribute("id", "volume-label");
    await expect(labels.nth(4)).toHaveAttribute("for", "volume");
    await expectNoFalseStates(parts(page, "label"));
});
