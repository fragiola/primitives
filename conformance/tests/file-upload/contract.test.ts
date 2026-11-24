import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { dispatchFileDrag, dropFiles } from "../../src/files.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/file-upload.md: anatomy, state attributes and the announcer

const PARTS = [
    "root",
    "label",
    "dropzone",
    "trigger",
    "hidden-input",
    "item-group",
    "clear-trigger",
    "announcer",
];

test("file-upload / basic: parts, elements and states", async ({ page }) => {
    await openScenario(page, "/file-upload/basic");
    for (const name of PARTS) {
        await expect(part(page, "file-upload", name).first()).toBeAttached();
    }
    const root = part(page, "file-upload", "root");
    await expect(root).toHaveAttribute("role", "group");
    await expect(root.evaluate((element) => element.tagName)).resolves.toBe(
        "DIV",
    );
    const label = part(page, "file-upload", "label");
    await expect(root).toHaveAttribute(
        "aria-labelledby",
        (await label.getAttribute("id")) ?? "",
    );
    await expect(label).toHaveAttribute(
        "for",
        (await part(page, "file-upload", "hidden-input").getAttribute("id")) ??
            "",
    );
    const dropzone = part(page, "file-upload", "dropzone");
    await expect(dropzone).toHaveAttribute("role", "button");
    await expect(dropzone).toHaveAttribute("tabindex", "0");
    for (const name of ["trigger", "clear-trigger"]) {
        await expect(part(page, "file-upload", name)).toHaveAttribute(
            "type",
            "button",
        );
    }
    await expect(part(page, "file-upload", "clear-trigger")).toHaveAttribute(
        "hidden",
        "",
    );
    await expect(root.locator(":scope > :last-child")).toHaveAttribute(
        "data-primitives-part",
        "file-upload-announcer",
    );
    await expect(part(page, "file-upload", "announcer")).toHaveAttribute(
        "aria-atomic",
        "true",
    );
    for (const name of ["root", "dropzone", "trigger", "label"]) {
        await expect(part(page, "file-upload", name).first()).toHaveAttribute(
            "data-empty",
            "",
        );
    }
    await expectNoFalseStates(parts(page, "file-upload"));

    await dispatchFileDrag(dropzone, ["dragenter"], [{ name: "a.png" }]);
    await expect(dropzone).toHaveAttribute("data-drop-target", "");
    await expect(root).toHaveAttribute("data-drop-target", "");
    await dispatchFileDrag(dropzone, ["dragleave"], [{ name: "a.png" }]);
    await expect(root).not.toHaveAttribute("data-drop-target");

    await dropFiles(dropzone, [
        { name: "photo.png", size: 1500 },
        { name: "notes.txt", size: 10 },
    ]);
    await expectOutput(page, "value", "photo.png");
    await expect(root).not.toHaveAttribute("data-empty");
    const items = part(page, "file-upload", "item");
    await expect(items).toHaveCount(2);
    await expect(items.first()).toHaveJSProperty("tagName", "LI");
    await expect(items.first()).not.toHaveAttribute("data-rejected");
    await expect(items.nth(1)).toHaveAttribute("data-rejected", "");
    await expect(
        items.nth(1).locator('[data-primitives-part="file-upload-item-name"]'),
    ).toHaveAttribute("data-rejected", "");
    await expect(
        part(page, "file-upload", "item-group").first(),
    ).toHaveJSProperty("tagName", "UL");
    await expect(part(page, "file-upload", "item-name").first()).toHaveText(
        "photo.png",
    );
    await expect(part(page, "file-upload", "item-size-text")).toHaveText(
        "1.5 kB",
    );
    // a preview only for an image: the accepted PNG has one, the rejected text file none
    await expect(part(page, "file-upload", "item-preview")).toHaveCount(1);
    await expect(
        part(page, "file-upload", "item-preview-image"),
    ).toHaveJSProperty("tagName", "IMG");
    await expect(
        part(page, "file-upload", "item-preview-image"),
    ).toHaveAttribute("alt", "");
    for (const trigger of await part(
        page,
        "file-upload",
        "item-delete-trigger",
    ).all()) {
        await expect(trigger).toHaveAttribute("type", "button");
    }
    await expect(
        part(page, "file-upload", "clear-trigger"),
    ).not.toHaveAttribute("hidden");
    await expectNoFalseStates(parts(page, "file-upload"));
});

test("file-upload / disabled: every part disabled", async ({ page }) => {
    await openScenario(page, "/file-upload/disabled");
    for (const name of ["root", "dropzone", "trigger", "label"]) {
        await expect(part(page, "file-upload", name)).toHaveAttribute(
            "data-disabled",
            "",
        );
    }
    await expect(part(page, "file-upload", "trigger")).toHaveAttribute(
        "disabled",
        "",
    );
    await expect(part(page, "file-upload", "hidden-input")).toHaveAttribute(
        "disabled",
        "",
    );
    await expectNoFalseStates(parts(page, "file-upload"));
});
