import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/date-field.md: TimeField's parts are DateField's, named by their root
test("time-field / basic: every part carries time-field-*", async ({
    page,
}) => {
    await openScenario(page, "/time-field/basic", { today: true });
    const root = part(page, "time-field", "root");
    await expect(root).toHaveCount(1);
    await expect(part(root, "time-field", "input")).toHaveAttribute(
        "role",
        "group",
    );
    await expect(part(root, "time-field", "segment")).not.toHaveCount(0);
    await expect(parts(page, "date-field")).toHaveCount(0);
    await expect(
        part(root.locator(".."), "time-field", "hidden-input"),
    ).toHaveAttribute("type", "time");
    await expectNoFalseStates(parts(page, "time-field"));
});

test("time-field / min-max: the hidden input's bounds at the field's granularity", async ({
    page,
}) => {
    await openScenario(page, "/time-field/min-max", { today: true });
    const hidden = part(page, "time-field", "hidden-input");
    await expect(hidden).toHaveAttribute("min", "09:00:00");
    await expect(hidden).toHaveAttribute("max", "17:00:00");
    await expect(hidden).toHaveAttribute("step", "any");
});

test("time-field / form: read-only and required", async ({ page }) => {
    await openScenario(page, "/time-field/form", { today: true });
    const roots = part(page, "time-field", "root");
    await expect(roots.nth(0)).toHaveAttribute("data-required", "");
    await expect(roots.nth(1)).toHaveAttribute("data-readonly", "");
    await expect(part(page, "time-field", "hidden-input").nth(1)).toHaveValue(
        "08:00",
    );
    await expectNoFalseStates(parts(page, "time-field"));
});
