import { expect, type Page, test } from "@playwright/test";
import { expectNoFalseStates, expectOpenState } from "../../src/contract.ts";
import { LIFECYCLE_OVERLAYS } from "../../src/lifecycle.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/README.md, "Lifecycle": a kept-mounted closed overlay carries `hidden` on its outermost
// portaled part and `data-closed` on every part that carries `data-open`

const part = (page: Page, name: string) =>
    page.locator(`[data-primitives-part="${name}"]`);

for (const [name, overlay] of Object.entries(LIFECYCLE_OVERLAYS)) {
    test(`lifecycle / ${name}: hidden and data-closed while kept mounted, data-open while open`, async ({
        page,
    }) => {
        await openScenario(page, overlay.path, { today: overlay.today });
        const component = overlay.popup.replace(/-popup$/, "");
        const states = page.locator(
            `[data-primitives-part^="${component}-"]:is([data-open], [data-closed])`,
        );
        await expect(part(page, overlay.kept)).toHaveAttribute("hidden", "");
        await expect(states.first()).toBeAttached();
        for (const element of await states.all()) {
            await expectOpenState(element, false);
        }
        await overlay.open(page);
        await expectOutput(page, "open", "true");
        await expect(part(page, overlay.kept)).not.toHaveAttribute("hidden");
        for (const element of await states.all()) {
            const isTrigger = await element.evaluate((node) =>
                (node.getAttribute("data-primitives-part") ?? "").endsWith(
                    "-trigger",
                ),
            );
            expect(isTrigger).toBe(false);
            await expectOpenState(element, true);
        }
        await page.keyboard.press("Escape");
        await expectOutput(page, "complete", "false");
        await expect(part(page, overlay.kept)).toHaveAttribute("hidden", "");
        for (const element of await states.all()) {
            await expectOpenState(element, false);
        }
        await expectNoFalseStates(
            page.locator(`[data-primitives-part^="${component}-"]`),
        );
    });
}
