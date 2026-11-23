import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";

// spec/date-field.md: anatomy, the segments' attributes, the hidden input, the state on every part
test("date-field / basic: parts, segments and the hidden input", async ({
    page,
}) => {
    await openScenario(page, "/date-field/basic", { today: true });
    const root = part(page, "date-field", "root");
    await expect(root).toHaveCount(1);
    const input = part(root, "date-field", "input");
    await expect(input).toHaveAttribute("role", "group");
    const segments = part(input, "date-field", "segment");
    await expect(segments).toHaveCount(5);
    const editable = input.locator('[role="spinbutton"]');
    await expect(editable).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
        const segment = editable.nth(index);
        await expect(segment).toHaveAttribute("contenteditable", "true");
        await expect(segment).toHaveAttribute("inputmode", "numeric");
        await expect(segment).toHaveAttribute("spellcheck", "false");
        await expect(segment).toHaveAttribute("data-placeholder", "");
        await expect(segment).toHaveAttribute("aria-labelledby", /\S+ \S+/);
        // the structural bidi style: one left-to-right run (spec/date-field.md)
        expect(
            await segment.evaluate((element) => [
                (element as HTMLElement).style.unicodeBidi,
                (element as HTMLElement).style.direction,
            ]),
        ).toEqual(["embed", "ltr"]);
    }
    const literals = input.locator('[data-type="literal"]');
    await expect(literals).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
        await expect(literals.nth(index)).toHaveAttribute(
            "aria-hidden",
            "true",
        );
        await expect(literals.nth(index)).not.toHaveAttribute("role");
    }
    const hidden = part(root.locator(".."), "date-field", "hidden-input");
    await expect(hidden).toHaveCount(1);
    await expect(hidden).toHaveAttribute("type", "date");
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("tabindex", "-1");
    await expect(hidden).toHaveAttribute("step", "any");
    await expect(hidden).toHaveValue("");
    expect(
        await hidden.evaluate(
            (element) =>
                element.previousElementSibling?.getAttribute(
                    "data-primitives-part",
                ) ?? null,
        ),
    ).toBe("date-field-root");

    await editable.first().focus();
    await typeKeys(page, "11232026");
    await expect(hidden).toHaveValue("2026-11-23");
    for (let index = 0; index < 3; index += 1) {
        await expect(editable.nth(index)).not.toHaveAttribute(
            "data-placeholder",
        );
    }
    await expectNoFalseStates(parts(page, "date-field"));
});

test("date-field / min-max: the hidden input's bounds", async ({ page }) => {
    await openScenario(page, "/date-field/min-max", { today: true });
    const hidden = part(page, "date-field", "hidden-input");
    await expect(hidden).toHaveAttribute("min", "2026-11-10");
    await expect(hidden).toHaveAttribute("max", "2026-12-05");
});

test("date-field / form: the form states on every part", async ({ page }) => {
    await openScenario(page, "/date-field/form", { today: true });
    const roots = part(page, "date-field", "root");
    await expect(roots).toHaveCount(3);
    await expect(roots.nth(0)).toHaveAttribute("data-required", "");
    await expect(roots.nth(1)).toHaveAttribute("data-readonly", "");
    await expect(roots.nth(2)).toHaveAttribute("data-disabled", "");
    for (const name of ["input", "segment"]) {
        await expect(
            part(roots.nth(2), "date-field", name).first(),
        ).toHaveAttribute("data-disabled", "");
    }
    const hidden = part(page, "date-field", "hidden-input");
    await expect(hidden.nth(0)).toHaveAttribute("name", "birth");
    await expect(hidden.nth(0)).toHaveAttribute("required", "");
    await expect(hidden.nth(1)).toHaveValue("2026-11-20");
    await expect(hidden.nth(2)).toHaveAttribute("disabled", "");
    await expectNoFalseStates(parts(page, "date-field"));
});

test("date-field / date-time: the day period's segment and a date-time hidden input", async ({
    page,
}) => {
    await openScenario(page, "/date-field/date-time", { today: true });
    const dayPeriod = page.locator('[data-type="dayPeriod"]');
    await expect(dayPeriod).toHaveAttribute("inputmode", "text");
    expect(
        await dayPeriod.evaluate(
            (element) => (element as HTMLElement).style.direction,
        ),
    ).toBe("");
    await expect(part(page, "date-field", "hidden-input")).toHaveAttribute(
        "type",
        "datetime-local",
    );
});
