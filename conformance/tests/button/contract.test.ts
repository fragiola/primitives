import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/button.md: anatomy, state attributes and ARIA, native or not
test("button / basic: the part, its type, role, tab index and disabled states", async ({
    page,
}) => {
    await openScenario(page, "/button/basic");
    await expect(part(page, "button", "root")).toHaveCount(5);
    const button = (name: string) =>
        page.getByRole("button", { name, exact: true });

    const save = button("Save");
    await expect(save).toHaveAttribute("data-primitives-part", "button-root");
    await expect(save).toHaveAttribute("type", "button");
    await expect(save).not.toHaveAttribute("data-disabled");
    await expect(save).not.toHaveAttribute("aria-disabled");

    const remove = button("Delete");
    await expect(remove).toHaveAttribute("disabled", "");
    await expect(remove).toHaveAttribute("data-disabled", "");
    await expect(remove).not.toHaveAttribute("aria-disabled");

    // focusable while disabled: aria-disabled instead of disabled
    const publishing = button("Publishing");
    await expect(publishing).not.toHaveAttribute("disabled");
    await expect(publishing).toHaveAttribute("aria-disabled", "true");
    await expect(publishing).toHaveAttribute("data-disabled", "");

    // rendered as a span: the role, the tab order, no type
    const archive = button("Archive");
    expect(await archive.evaluate((element) => element.localName)).toBe("span");
    await expect(archive).toHaveAttribute("role", "button");
    await expect(archive).toHaveAttribute("tabindex", "0");
    await expect(archive).not.toHaveAttribute("type");
    await expect(archive).not.toHaveAttribute("aria-disabled");

    const locked = button("Locked");
    expect(await locked.evaluate((element) => element.localName)).toBe("span");
    await expect(locked).toHaveAttribute("role", "button");
    await expect(locked).toHaveAttribute("aria-disabled", "true");
    await expect(locked).toHaveAttribute("tabindex", "-1");
    await expect(locked).toHaveAttribute("data-disabled", "");
    await expectNoFalseStates(parts(page, "button"));
});
