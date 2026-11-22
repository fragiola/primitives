import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/accordion.md: anatomy, state attributes, the size variables
test("accordion / basic: parts and states, collapsed and expanded", async ({
    page,
}) => {
    await openScenario(page, "/accordion/basic");
    const root = part(page, "accordion", "root");
    await expect(root).toHaveAttribute("data-orientation", "vertical");
    await expect(root).not.toHaveAttribute("data-disabled");
    const items = part(page, "accordion", "item");
    await expect(items).toHaveCount(4);
    await expect(part(page, "accordion", "header")).toHaveCount(4);
    const triggers = part(page, "accordion", "trigger");
    await expect(triggers).toHaveCount(4);
    for (const item of await items.all()) {
        await expect(item).toHaveAttribute("data-closed", "");
        await expect(item).toHaveAttribute("data-orientation", "vertical");
        await expect(part(item, "accordion", "header")).toHaveAttribute(
            "data-closed",
            "",
        );
    }
    const header = part(items.nth(0), "accordion", "header");
    expect(await header.evaluate((element) => element.tagName)).toBe("H3");
    await expect(triggers.nth(0)).toHaveAttribute("type", "button");
    await expect(items.nth(2)).toHaveAttribute("data-disabled", "");
    await expect(part(items.nth(2), "accordion", "header")).toHaveAttribute(
        "data-disabled",
        "",
    );
    await expect(triggers.nth(2)).toHaveAttribute("data-disabled", "");
    await expectNoFalseStates(parts(page, "accordion"));

    await triggers.nth(0).click();
    await expect(items.nth(0)).toHaveAttribute("data-open", "");
    await expect(items.nth(0)).not.toHaveAttribute("data-closed");
    await expect(triggers.nth(0)).toHaveAttribute("data-panel-open", "");
    const panel = part(items.nth(0), "accordion", "panel");
    await expect(panel).toHaveAttribute("role", "region");
    await expect(panel).toHaveAttribute(
        "aria-labelledby",
        (await triggers.nth(0).getAttribute("id")) as string,
    );
    await expect(panel).toHaveAttribute("data-open", "");
    await expect(panel).toHaveAttribute("data-orientation", "vertical");
    await expectNoFalseStates(parts(page, "accordion"));
});

test("accordion / multiple: open from the start, the size variables at auto", async ({
    page,
}) => {
    await openScenario(page, "/accordion/multiple");
    const panels = part(page, "accordion", "panel");
    await expect(panels).toHaveCount(3);
    const shipping = panels.nth(0);
    await expect(shipping).toHaveAttribute("data-open", "");
    await expect(shipping).not.toHaveAttribute("data-starting-style");
    for (const name of [
        "--accordion-panel-height",
        "--accordion-panel-width",
    ]) {
        expect(
            await shipping.evaluate(
                (element, name) => element.style.getPropertyValue(name),
                name,
            ),
        ).toBe("auto");
    }
    await expect(panels.nth(1)).toHaveAttribute("data-closed", "");
    await expect(panels.nth(1)).toHaveAttribute("hidden", "until-found");
    await expectNoFalseStates(parts(page, "accordion"));
});

test("accordion / horizontal: the orientation on every part", async ({
    page,
}) => {
    await openScenario(page, "/accordion/horizontal");
    await expect(part(page, "accordion", "root")).toHaveAttribute(
        "data-orientation",
        "horizontal",
    );
    await expect(part(page, "accordion", "item").first()).toHaveAttribute(
        "data-orientation",
        "horizontal",
    );
});
