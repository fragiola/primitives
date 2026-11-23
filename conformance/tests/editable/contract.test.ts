import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/editable.md: anatomy, state attributes and ARIA
test("editable / basic: parts and states, at rest and editing", async ({
    page,
}) => {
    await openScenario(page, "/editable/basic");
    const root = part(page, "editable", "root");
    const area = part(page, "editable", "area");
    const previewPart = part(page, "editable", "preview");
    const input = part(page, "editable", "input");
    const edit = part(page, "editable", "edit-trigger");
    const submit = part(page, "editable", "submit-trigger");
    const cancel = part(page, "editable", "cancel-trigger");
    await expect(root).toHaveCount(1);
    await expect(previewPart).not.toHaveAttribute("hidden");
    await expect(previewPart).toHaveAttribute("tabindex", "0");
    await expect(previewPart).not.toHaveAttribute("data-placeholder");
    await expect(input).toHaveAttribute("hidden", "");
    await expect(input).toHaveAttribute("name", "title");
    await expect(input).toHaveAttribute("value", "Quarterly report");
    await expect(input).toHaveAttribute("placeholder", "Untitled");
    await expect(edit).not.toHaveAttribute("hidden");
    await expect(edit).toHaveAttribute("type", "button");
    await expect(edit).toHaveAttribute(
        "aria-controls",
        (await input.getAttribute("id")) ?? "",
    );
    for (const trigger of [submit, cancel]) {
        await expect(trigger).toHaveAttribute("hidden", "");
        await expect(trigger).toHaveAttribute("type", "button");
    }
    for (const element of [root, area, previewPart, input]) {
        await expect(element).not.toHaveAttribute("data-editing");
        await expect(element).not.toHaveAttribute("data-empty");
    }
    await expectNoFalseStates(parts(page, "editable"));

    await edit.click();
    await expect(previewPart).toHaveAttribute("hidden", "");
    await expect(input).not.toHaveAttribute("hidden");
    await expect(edit).toHaveAttribute("hidden", "");
    for (const element of [root, area, input, submit, cancel]) {
        await expect(element).toHaveAttribute("data-editing", "");
    }
    for (const trigger of [submit, cancel]) {
        await expect(trigger).not.toHaveAttribute("hidden");
    }
    await expectNoFalseStates(parts(page, "editable"));
});

test("editable / states: the placeholder, disabled and read-only", async ({
    page,
}) => {
    await openScenario(page, "/editable/states");
    const roots = part(page, "editable", "root");
    const subtitle = roots.nth(0);
    const subtitlePreview = part(subtitle, "editable", "preview");
    await expect(subtitlePreview).toHaveAttribute("data-placeholder", "");
    await expect(subtitlePreview).toHaveText("Add a subtitle");
    for (const element of [
        subtitle,
        part(subtitle, "editable", "area"),
        subtitlePreview,
    ]) {
        await expect(element).toHaveAttribute("data-empty", "");
    }
    await expect(part(subtitle, "editable", "input")).toHaveAttribute(
        "maxlength",
        "12",
    );

    const owner = roots.nth(1);
    for (const name of ["area", "preview", "input", "edit-trigger"]) {
        await expect(part(owner, "editable", name)).toHaveAttribute(
            "data-disabled",
            "",
        );
    }
    await expect(owner).toHaveAttribute("data-disabled", "");
    await expect(part(owner, "editable", "preview")).not.toHaveAttribute(
        "tabindex",
    );
    await expect(part(owner, "editable", "input")).toHaveAttribute(
        "disabled",
        "",
    );
    await expect(part(owner, "editable", "edit-trigger")).toHaveAttribute(
        "disabled",
        "",
    );

    const created = roots.nth(2);
    for (const name of ["area", "preview", "edit-trigger"]) {
        await expect(part(created, "editable", name)).toHaveAttribute(
            "data-readonly",
            "",
        );
    }
    await expect(created).toHaveAttribute("data-readonly", "");
    await expect(part(created, "editable", "preview")).not.toHaveAttribute(
        "tabindex",
    );
    await expect(part(created, "editable", "edit-trigger")).toHaveAttribute(
        "disabled",
        "",
    );
    await expectNoFalseStates(parts(page, "editable"));
});

test("editable / field: the field's attributes on the Input", async ({
    page,
}) => {
    await openScenario(page, "/editable/field");
    const input = part(page, "editable", "input");
    await expect(input).toHaveAttribute("aria-labelledby", /.+/);
    await expect(input).toHaveAttribute("aria-describedby", /.+/);
    await expect(input).toHaveAttribute("required", "");
    await expect(input).toHaveAttribute("data-required", "");
    await expectNoFalseStates(parts(page, "editable"));
});
