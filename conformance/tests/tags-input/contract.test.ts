import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/tags-input.md: anatomy, state attributes, the hidden inputs
test("tags-input / basic: parts and states", async ({ page }) => {
    await openScenario(page, "/tags-input/basic");
    const root = part(page, "tags-input", "root");
    await expect(root).toHaveCount(1);
    await expect(root).not.toHaveAttribute("data-empty");
    await expect(root).not.toHaveAttribute("data-disabled");
    const control = part(page, "tags-input", "control");
    await expect(control).not.toHaveAttribute("data-empty");
    const input = part(page, "tags-input", "input");
    await expect(input).toHaveAttribute("id", "tags");
    await expect(input).not.toHaveAttribute("name");
    await expect(input).not.toHaveAttribute("aria-required");

    const tags = part(page, "tags-input", "tag");
    await expect(tags).toHaveCount(2);
    for (const tag of await tags.all()) {
        await expect(tag).not.toHaveAttribute("role");
        await expect(tag).toHaveAttribute("tabindex", "-1");
        await expect(tag).not.toHaveAttribute("data-editing");
        await expect(part(tag, "tags-input", "tag-text")).not.toHaveAttribute(
            "hidden",
        );
        const remove = part(tag, "tags-input", "tag-remove");
        await expect(remove).toHaveAttribute("type", "button");
        await expect(remove).toHaveAttribute("tabindex", "-1");
        await expect(remove).not.toHaveAttribute("hidden");
        await expect(part(tag, "tags-input", "tag-input")).toHaveCount(0);
    }
    const clear = part(page, "tags-input", "clear-trigger");
    await expect(clear).toHaveAttribute("type", "button");
    await expect(clear).not.toHaveAttribute("hidden");

    // no name: the validation input only, the Root's last child
    const hidden = part(page, "tags-input", "hidden-input");
    await expect(hidden).toHaveCount(1);
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("tabindex", "-1");
    await expect(hidden).not.toHaveAttribute("name");
    await expect(hidden).not.toHaveAttribute("required");
    await expect(root.locator(":scope > :last-child")).toHaveAttribute(
        "data-primitives-part",
        "tags-input-hidden-input",
    );
    await expectNoFalseStates(parts(page, "tags-input"));

    await clear.click();
    await expect(root).toHaveAttribute("data-empty", "");
    await expect(control).toHaveAttribute("data-empty", "");
    await expect(clear).toHaveAttribute("hidden", "");
    await expectNoFalseStates(parts(page, "tags-input"));
});

test("tags-input / edit: the edited tag", async ({ page }) => {
    await openScenario(page, "/tags-input/edit");
    const tags = part(page, "tags-input", "tag");
    const editors = part(page, "tags-input", "tag-input");
    await expect(editors).toHaveCount(3);
    for (const editor of await editors.all()) {
        await expect(editor).toHaveAttribute("hidden", "");
        await expect(editor).toHaveAttribute("tabindex", "-1");
    }
    const two = tags.nth(1);
    await two.focus();
    await page.keyboard.press("Enter");
    await expect(two).toHaveAttribute("data-editing", "");
    await expect(part(two, "tags-input", "tag-input")).not.toHaveAttribute(
        "hidden",
    );
    await expect(part(two, "tags-input", "tag-text")).toHaveAttribute(
        "hidden",
        "",
    );
    await expect(part(two, "tags-input", "tag-remove")).toHaveAttribute(
        "hidden",
        "",
    );
    await expect(tags.nth(0)).not.toHaveAttribute("data-editing");
    await expectNoFalseStates(parts(page, "tags-input"));
});

test("tags-input / field: the hidden inputs and the field's ids", async ({
    page,
}) => {
    await openScenario(page, "/tags-input/field");
    const [tags, labels] = await part(page, "tags-input", "root").all();
    if (tags === undefined || labels === undefined) {
        throw new Error("two TagsInputs");
    }
    const input = part(tags, "tags-input", "input");
    const id = await input.getAttribute("id");
    expect(id).toBeTruthy();
    const label = page.locator('[data-primitives-part="field-label"]');
    await expect(label).toHaveAttribute("for", id as string);
    await expect(input).toHaveAttribute("aria-required", "true");
    await expect(input).toHaveAttribute("aria-describedby", /.+/);
    const validation = part(tags, "tags-input", "hidden-input");
    await expect(validation).toHaveCount(1);
    await expect(validation).toHaveAttribute("required", "");

    const entries = part(labels, "tags-input", "hidden-input");
    await expect(entries).toHaveCount(2);
    await expect(entries.nth(1)).toHaveAttribute("type", "hidden");
    await expect(entries.nth(1)).toHaveAttribute("name", "labels");
    await expect(entries.nth(1)).toHaveValue("bug");

    await input.click();
    await page.keyboard.type("alpha");
    await page.keyboard.press("Enter");
    await expect(validation.first()).not.toHaveAttribute("required");
    await expect(part(tags, "tags-input", "hidden-input")).toHaveCount(2);
    await expect(tags).toHaveAttribute("data-filled", "");
    await expectNoFalseStates(parts(page, "tags-input"));
});
