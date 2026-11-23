import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/otp-field.md: anatomy, the slots' attributes and ids, the hidden input, the state
test("otp-field / basic: parts, slots, ids and the hidden input", async ({
    page,
}) => {
    await openScenario(page, "/otp-field/basic");
    const roots = part(page, "otp-field", "root");
    await expect(roots).toHaveCount(3);
    const code = roots.nth(0);
    await expect(code).toHaveAttribute("role", "group");
    const slots = part(code, "otp-field", "input");
    await expect(slots).toHaveCount(6);
    for (let index = 0; index < 6; index += 1) {
        const slot = slots.nth(index);
        await expect(slot).toHaveAttribute(
            "id",
            index === 0 ? "code" : `code-${index + 1}`,
        );
        await expect(slot).toHaveAttribute("type", "text");
        await expect(slot).toHaveAttribute("inputmode", "numeric");
        await expect(slot).toHaveAttribute("autocorrect", "off");
        await expect(slot).toHaveAttribute("spellcheck", "false");
        await expect(slot).toHaveAttribute("data-index", String(index));
        await expect(slot).toHaveAttribute(
            "enterkeyhint",
            index === 5 ? "done" : "next",
        );
        await expect(slot).not.toHaveAttribute("data-filled");
    }
    const hidden = part(page, "otp-field", "hidden-input").first();
    await expect(hidden).toHaveAttribute("type", "text");
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("tabindex", "-1");
    await expect(hidden).toHaveAttribute("name", "code");
    await expect(hidden).toHaveAttribute("autocomplete", "one-time-code");
    await expect(hidden).toHaveAttribute("maxlength", "6");
    await expect(hidden).toHaveAttribute("pattern", "\\d{6}");
    expect(
        await hidden.evaluate(
            (element) =>
                element.previousElementSibling?.getAttribute(
                    "data-primitives-part",
                ) ?? null,
        ),
    ).toBe("otp-field-root");

    await slots.nth(0).focus();
    await page.keyboard.type("12");
    await expect(slots.nth(0)).toHaveAttribute("data-filled", "");
    await expect(slots.nth(1)).toHaveAttribute("data-filled", "");
    await expect(hidden).toHaveValue("12");
    await expect(code).not.toHaveAttribute("data-complete");
    await page.keyboard.type("3456");
    for (const element of [code, slots.nth(0), slots.nth(5)]) {
        await expect(element).toHaveAttribute("data-complete", "");
    }

    const backup = roots.nth(1);
    for (const element of [backup, part(backup, "otp-field", "input").nth(0)]) {
        await expect(element).toHaveAttribute("data-readonly", "");
    }
    await expect(part(backup, "otp-field", "input").nth(0)).toHaveAttribute(
        "readonly",
        "",
    );
    const old = roots.nth(2);
    for (const element of [old, part(old, "otp-field", "input").nth(0)]) {
        await expect(element).toHaveAttribute("data-disabled", "");
    }
    await expectNoFalseStates(parts(page, "otp-field"));
});

test("otp-field / field: the field's ARIA on the group and the slots", async ({
    page,
}) => {
    await openScenario(page, "/otp-field/field");
    const root = part(page, "otp-field", "root");
    const label = page.locator('[data-primitives-part="field-label"]');
    const labelId = await label.getAttribute("id");
    await expect(root).toHaveAttribute("aria-labelledby", labelId as string);
    const first = part(page, "otp-field", "input").first();
    await expect(label).toHaveAttribute(
        "for",
        (await first.getAttribute("id")) as string,
    );
    await expect(first).toHaveAttribute("inputmode", "text");
    await expect(part(page, "otp-field", "hidden-input")).toHaveAttribute(
        "pattern",
        "[a-zA-Z0-9]{4}",
    );
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(root).toHaveAttribute("data-invalid", "");
    await expectNoFalseStates(parts(page, "otp-field"));
});
