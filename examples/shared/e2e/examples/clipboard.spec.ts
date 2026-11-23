import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// clipboard: a copy code block (spec/clipboard.md). A Clipboard Root drawn as a code block, holding
// `pnpm add @fragiola/primitives-react` in a `<pre><code>` and a Trigger "Copy command" whose
// Indicator shows a copy icon, a check while copied (two seconds) and a cross after a failure; its
// announcement "Copied".
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

test("a press copies the command, shows the check and announces it", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "clipboard" });
    const trigger = frame.getByRole("button", { name: "Copy command" });
    await trigger.click();
    await expect(trigger).toHaveAttribute("data-copied", "");
    await expect(frame.locator(part("clipboard-announcer"))).toHaveText(
        "Copied",
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        "pnpm add @fragiola/primitives-react",
    );
    await expect(trigger).toBeFocused();
    // the check lasts two seconds
    await expect(trigger).not.toHaveAttribute("data-copied", { timeout: 5000 });
    await expect(frame.locator(part("clipboard-announcer"))).toHaveText("");
    expect(errors).toEqual([]);
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("clipboard");
    await page.goto(`${EMBED_BASE}?id=clipboard`);
    await expect(
        page.getByRole("button", { name: "Copy command" }),
    ).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
