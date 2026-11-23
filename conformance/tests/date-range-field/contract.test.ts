import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";
import { typeKeys } from "../../src/segments.ts";

// spec/date-range-field.md: anatomy, the ends' groups, the two hidden inputs and their bounds
test("date-range-field / basic: parts, ends and hidden inputs", async ({
    page,
}) => {
    await openScenario(page, "/date-range-field/basic", { today: true });
    const root = part(page, "date-range-field", "root");
    await expect(root).toHaveCount(1);
    await expect(parts(page, "date-field")).toHaveCount(0);
    const inputs = part(root, "date-range-field", "input");
    await expect(inputs).toHaveCount(2);
    for (const [index, end] of ["start", "end"].entries()) {
        const input = inputs.nth(index);
        await expect(input).toHaveAttribute("role", "group");
        await expect(input).toHaveAttribute("data-range", end);
        await expect(input).toHaveAttribute("aria-labelledby", /\S+ \S+/);
        await expect(part(input, "date-range-field", "segment")).toHaveCount(5);
        const editable = input.locator('[role="spinbutton"]');
        await expect(editable).toHaveCount(3);
        for (let segment = 0; segment < 3; segment += 1) {
            await expect(editable.nth(segment)).toHaveAttribute(
                "aria-labelledby",
                /\S+ \S+ \S+/,
            );
            await expect(editable.nth(segment)).toHaveAttribute(
                "data-placeholder",
                "",
            );
        }
    }
    const hidden = part(root.locator(".."), "date-range-field", "hidden-input");
    await expect(hidden).toHaveCount(2);
    for (const [index, end] of ["start", "end"].entries()) {
        await expect(hidden.nth(index)).toHaveAttribute("type", "date");
        await expect(hidden.nth(index)).toHaveAttribute("data-range", end);
        await expect(hidden.nth(index)).toHaveAttribute("aria-hidden", "true");
        await expect(hidden.nth(index)).toHaveAttribute("tabindex", "-1");
        await expect(hidden.nth(index)).toHaveValue("");
    }
    expect(
        await hidden
            .first()
            .evaluate(
                (element) =>
                    element.previousElementSibling?.getAttribute(
                        "data-primitives-part",
                    ) ?? null,
            ),
    ).toBe("date-range-field-root");

    await inputs.first().locator('[role="spinbutton"]').first().focus();
    await typeKeys(page, "1123202611272026");
    await expect(hidden.nth(0)).toHaveValue("2026-11-23");
    await expect(hidden.nth(1)).toHaveValue("2026-11-27");
    await expectNoFalseStates(parts(page, "date-range-field"));
});

test("date-range-field / form: the bounds, crossed by the other end", async ({
    page,
}) => {
    await openScenario(page, "/date-range-field/form", { today: true });
    const roots = part(page, "date-range-field", "root");
    await expect(roots).toHaveCount(2);
    await expect(roots.nth(0)).toHaveAttribute("data-required", "");
    await expect(roots.nth(1)).toHaveAttribute("data-readonly", "");
    const hidden = part(page, "date-range-field", "hidden-input");
    await expect(hidden.nth(0)).toHaveAttribute("name", "checkin");
    await expect(hidden.nth(1)).toHaveAttribute("name", "checkout");
    await expect(hidden.nth(0)).toHaveAttribute("min", "2026-11-20");
    await expect(hidden.nth(1)).toHaveAttribute("min", "2026-11-20");
    await expect(hidden.nth(0)).not.toHaveAttribute("max");
    await roots.nth(0).locator('[role="spinbutton"]').first().focus();
    await typeKeys(page, "1123202611272026");
    await expect(hidden.nth(0)).toHaveAttribute("max", "2026-11-27");
    await expect(hidden.nth(1)).toHaveAttribute("min", "2026-11-23");
    await expect(hidden.nth(2)).toHaveAttribute("max", "2026-11-22");
});
