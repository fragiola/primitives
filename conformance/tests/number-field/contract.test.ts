import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/number-field.md: anatomy, the spinbutton's attributes, the buttons, the hidden input, the
// state on every part
test("number-field / basic: parts, the spinbutton, the buttons and the hidden input", async ({
    page,
}) => {
    await openScenario(page, "/number-field/basic");
    const root = part(page, "number-field", "root");
    await expect(root).toHaveCount(1);
    const group = part(root, "number-field", "group");
    await expect(group).toHaveAttribute("role", "group");
    const input = part(group, "number-field", "input");
    await expect(input).toHaveAttribute("role", "spinbutton");
    await expect(input).toHaveAttribute("id", "quantity");
    await expect(input).toHaveAttribute("type", "text");
    await expect(input).toHaveAttribute("inputmode", "decimal");
    await expect(input).toHaveAttribute("autocomplete", "off");
    await expect(input).toHaveAttribute("autocorrect", "off");
    await expect(input).toHaveAttribute("spellcheck", "false");
    for (const name of ["increment", "decrement"]) {
        const button = part(group, "number-field", name);
        await expect(button).toHaveAttribute("type", "button");
        await expect(button).toHaveAttribute("tabindex", "-1");
        await expect(button).toHaveAttribute("aria-controls", "quantity");
    }
    const hidden = part(root.locator(".."), "number-field", "hidden-input");
    await expect(hidden).toHaveCount(1);
    await expect(hidden).toHaveAttribute("type", "number");
    await expect(hidden).toHaveAttribute("aria-hidden", "true");
    await expect(hidden).toHaveAttribute("tabindex", "-1");
    await expect(hidden).toHaveAttribute("name", "quantity");
    await expect(hidden).toHaveAttribute("min", "1");
    await expect(hidden).toHaveAttribute("max", "10");
    await expect(hidden).toHaveAttribute("step", "any");
    await expect(hidden).toHaveValue("1");
    // the hidden input follows the root, outside it
    expect(
        await hidden.evaluate(
            (element) =>
                element.previousElementSibling?.getAttribute(
                    "data-primitives-part",
                ) ?? null,
        ),
    ).toBe("number-field-root");

    await input.focus();
    await input.press("ArrowUp");
    await expect(hidden).toHaveValue("2");
    await expectNoFalseStates(parts(page, "number-field"));
});

test("number-field / scrub: the scrub area's structural style and the scrubbing state", async ({
    page,
}) => {
    await page.addInitScript(() => {
        Element.prototype.requestPointerLock = () =>
            Promise.reject(new DOMException("denied", "NotAllowedError"));
    });
    await openScenario(page, "/number-field/scrub");
    const area = part(page, "number-field", "scrub-area");
    const style = (name: string) =>
        area.evaluate(
            (element, property) =>
                (element as HTMLElement).style.getPropertyValue(property),
            name,
        );
    expect(await style("touch-action")).toBe("none");
    expect(await style("user-select")).toBe("none");
    await expect(part(page, "number-field", "scrub-area-cursor")).toHaveCount(
        0,
    );
    const box = await area.boundingBox();
    if (box === null) {
        throw new Error("no scrub area");
    }
    await page.mouse.move(box.x + 4, box.y + box.height / 2);
    await page.mouse.down();
    for (const name of ["root", "scrub-area", "group", "input"]) {
        await expect(part(page, "number-field", name)).toHaveAttribute(
            "data-scrubbing",
            "",
        );
    }
    await page.mouse.up();
    for (const name of ["root", "scrub-area", "group", "input"]) {
        await expect(part(page, "number-field", name)).not.toHaveAttribute(
            "data-scrubbing",
        );
    }
    await expectNoFalseStates(parts(page, "number-field"));
});

test("number-field / field: the field's state and ARIA on the parts", async ({
    page,
}) => {
    await openScenario(page, "/number-field/field");
    const root = part(page, "number-field", "root");
    const input = part(page, "number-field", "input");
    for (const element of [root, part(page, "number-field", "group"), input]) {
        await expect(element).toHaveAttribute("data-required", "");
    }
    await expect(input).toHaveAttribute("aria-required", "true");
    const hidden = part(page, "number-field", "hidden-input");
    await expect(hidden).toHaveAttribute("name", "guests");
    await expect(hidden).toHaveAttribute("required", "");
    await page.getByRole("button", { name: "Submit" }).click();
    for (const element of [root, input]) {
        await expect(element).toHaveAttribute("data-invalid", "");
    }
    await expectNoFalseStates(parts(page, "number-field"));
});
