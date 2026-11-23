import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/aspect-ratio.md: one part, its structural style, no role and no state attribute
test("aspect ratio / basic: the part and its structural style", async ({
    page,
}) => {
    await openScenario(page, "/aspect-ratio/basic");
    const roots = part(page, "aspect-ratio", "root");
    await expect(roots).toHaveCount(2);
    const style = (index: number, name: string) =>
        roots
            .nth(index)
            .evaluate(
                (element, property) =>
                    (element as HTMLElement).style.getPropertyValue(property),
                name,
            );
    // the browser writes a ratio as `<width> / <height>`
    const ratio = async (index: number) => {
        const [width, height = "1"] = (
            await style(index, "aspect-ratio")
        ).split("/");
        return Number(width) / Number(height);
    };
    expect(await ratio(0)).toBeCloseTo(16 / 9, 4);
    expect(await ratio(1)).toBe(1);
    expect(await style(0, "min-height")).toBe("0px");
    for (const root of await roots.all()) {
        expect(await root.evaluate((element) => element.localName)).toBe("div");
        await expect(root).not.toHaveAttribute("role");
    }
    const dataAttributes = await parts(page, "aspect-ratio").evaluateAll(
        (elements) =>
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
    await expectNoFalseStates(parts(page, "aspect-ratio"));
});
