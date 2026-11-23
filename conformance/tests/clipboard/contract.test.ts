import { expect, type Page, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/clipboard.md: anatomy, state attributes and the announcer
test.use({ permissions: ["clipboard-read", "clipboard-write"] });

const all = (page: Page) =>
    ["root", "trigger", "indicator", "input"].map((name) =>
        part(page, "clipboard", name),
    );

test("clipboard / basic: parts, states and the announcer", async ({ page }) => {
    await openScenario(page, "/clipboard/basic");
    const root = part(page, "clipboard", "root");
    await expect(root).toHaveCount(1);
    await expect(part(page, "clipboard", "trigger")).toHaveAttribute(
        "type",
        "button",
    );
    await expect(part(page, "clipboard", "indicator")).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    await expect(part(page, "clipboard", "input")).toHaveAttribute(
        "readonly",
        "",
    );
    const announcer = part(page, "clipboard", "announcer");
    await expect(announcer).toHaveAttribute("aria-live", "polite");
    await expect(announcer).toHaveAttribute("aria-atomic", "true");
    await expect(root.locator(":scope > :last-child")).toHaveAttribute(
        "data-primitives-part",
        "clipboard-announcer",
    );
    for (const element of all(page)) {
        await expect(element).not.toHaveAttribute("data-copied");
        await expect(element).not.toHaveAttribute("data-failed");
    }
    await expectNoFalseStates(parts(page, "clipboard"));

    // every copy writes a new text node into the announcer
    await announcer.evaluate((element) => {
        const added: string[] = [];
        (window as unknown as { added: string[] }).added = added;
        new MutationObserver((records) => {
            for (const record of records) {
                for (const node of record.addedNodes) {
                    added.push(node.textContent ?? "");
                }
            }
        }).observe(element, { childList: true });
    });
    const trigger = part(page, "clipboard", "trigger");
    await trigger.click();
    await expectOutput(page, "status", "copied");
    for (const element of all(page)) {
        await expect(element).toHaveAttribute("data-copied", "");
        await expect(element).not.toHaveAttribute("data-failed");
    }
    await expectNoFalseStates(parts(page, "clipboard"));
    await trigger.click();
    await expect
        .poll(() =>
            page.evaluate(
                () => (window as unknown as { added: string[] }).added,
            ),
        )
        .toEqual(["Copied to clipboard", "Copied to clipboard"]);
    await expectOutput(page, "status", "idle");
    for (const element of all(page)) {
        await expect(element).not.toHaveAttribute("data-copied");
    }
});
