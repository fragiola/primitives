import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/meter.md: anatomy, the Label's id, the Indicator's structural style, no state attribute
test("meter / basic: parts, the label and the indicator's structural style", async ({
    page,
}) => {
    await openScenario(page, "/meter/basic");
    const roots = part(page, "meter", "root");
    await expect(roots).toHaveCount(2);
    const battery = roots.nth(0);
    await expect(battery).toHaveAttribute("role", "meter");
    for (const name of ["label", "value", "track", "indicator"]) {
        await expect(part(battery, "meter", name)).toHaveCount(1);
    }
    const label = part(battery, "meter", "label");
    const id = await label.getAttribute("id");
    expect(id).toBeTruthy();
    await expect(battery).toHaveAttribute("aria-labelledby", id as string);
    expect(await label.evaluate((element) => element.localName)).toBe("span");
    expect(
        await part(battery, "meter", "track").evaluate(
            (element) => element.localName,
        ),
    ).toBe("div");

    const indicator = part(battery, "meter", "indicator");
    const style = (name: string) =>
        indicator.evaluate(
            (element, property) =>
                (element as HTMLElement).style.getPropertyValue(property),
            name,
        );
    expect(await style("inset-inline-start")).toBe("0px");
    expect(await style("inline-size")).toBe("60%");
    expect(await style("--meter-indicator-size")).toBe("60%");
    expect(
        await part(roots.nth(1), "meter", "indicator").evaluate((element) =>
            (element as HTMLElement).style.getPropertyValue("inline-size"),
        ),
    ).toBe("75%");
    await page.getByRole("button", { name: "Overcharge" }).click();
    expect(await style("inline-size")).toBe("100%");
    // no state attribute of its own (spec/meter.md, "State attributes and ARIA")
    const dataAttributes = await parts(page, "meter").evaluateAll((elements) =>
        elements.flatMap((element) =>
            [...element.attributes]
                .map((attribute) => attribute.name)
                .filter(
                    (name) =>
                        name.startsWith("data-") &&
                        name !== "data-primitives-part",
                ),
        ),
    );
    expect(dataAttributes).toEqual([]);
    await expectNoFalseStates(parts(page, "meter"));
});
