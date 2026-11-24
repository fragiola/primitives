import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { dispatchFileDrag, dropFiles } from "../../src/files.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/drop-zone.md: anatomy, state attributes and the announcer

test("drop-zone / basic: the Root, its states and the announcer", async ({
    page,
}) => {
    await openScenario(page, "/drop-zone/basic");
    const root = part(page, "drop-zone", "root");
    await expect(root).toHaveCount(1);
    await expect(root).toHaveAttribute("role", "button");
    await expect(root).toHaveAttribute("tabindex", "0");
    await expect(root).not.toHaveAttribute("aria-label");
    await expect(root).not.toHaveAttribute("data-drop-target");
    await expect(root).not.toHaveAttribute("data-disabled");
    await expect(root).not.toHaveAttribute("aria-disabled");
    const announcer = part(page, "drop-zone", "announcer");
    await expect(announcer).toHaveAttribute("aria-live", "polite");
    await expect(announcer).toHaveAttribute("aria-atomic", "true");
    await expect(root.locator(":scope > :last-child")).toHaveAttribute(
        "data-primitives-part",
        "drop-zone-announcer",
    );
    await expectNoFalseStates(parts(page, "drop-zone"));

    await dispatchFileDrag(root, ["dragenter"], [{ name: "a.png" }]);
    await expect(root).toHaveAttribute("data-drop-target", "");
    await expectNoFalseStates(parts(page, "drop-zone"));
    await dispatchFileDrag(root, ["dragleave"], [{ name: "a.png" }]);

    // every drop writes a new text node into the announcer
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
    await dropFiles(root, [{ name: "a.png" }]);
    await expectOutput(page, "accepted", "a.png");
    await dropFiles(root, [{ name: "b.png" }]);
    await expectOutput(page, "accepted", "b.png");
    await expect
        .poll(() =>
            page.evaluate(
                () => (window as unknown as { added: string[] }).added,
            ),
        )
        .toEqual(["1 accepted, 0 rejected", "1 accepted, 0 rejected"]);
});

test("drop-zone / disabled: aria-disabled and no tab stop", async ({
    page,
}) => {
    await openScenario(page, "/drop-zone/disabled");
    const root = part(page, "drop-zone", "root");
    await expect(root).toHaveAttribute("aria-disabled", "true");
    await expect(root).toHaveAttribute("data-disabled", "");
    await expect(root).not.toHaveAttribute("tabindex");
    await expectNoFalseStates(parts(page, "drop-zone"));
});
