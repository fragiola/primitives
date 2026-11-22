import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { expectOutput } from "../../src/output.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/avatar.md: the parts, no status attribute, the image rendered only once loaded
test("avatar / basic: the parts and the image's attributes", async ({
    page,
}) => {
    await openScenario(page, "/avatar/basic");
    await expectOutput(page, "ada", "loaded");
    await expectOutput(page, "missing", "error");
    const roots = part(page, "avatar", "root");
    await expect(roots).toHaveCount(3);
    for (const root of await roots.all()) {
        expect(await root.evaluate((element) => element.localName)).toBe(
            "span",
        );
    }
    const ada = roots.nth(0);
    const grace = roots.nth(1);
    const initials = roots.nth(2);
    const image = part(ada, "avatar", "image");
    await expect(image).toHaveCount(1);
    expect(await image.evaluate((element) => element.localName)).toBe("img");
    await expect(image).toHaveAttribute("src", "/avatar/ada.svg");
    await expect(image).toHaveAttribute("alt", "Ada Lovelace");
    await expect(part(ada, "avatar", "fallback")).toHaveCount(0);
    await expect(part(grace, "avatar", "image")).toHaveCount(0);
    const fallback = part(grace, "avatar", "fallback");
    expect(await fallback.evaluate((element) => element.localName)).toBe(
        "span",
    );
    await expect(fallback).toHaveText("GH");
    await expect(part(initials, "avatar", "fallback")).toHaveText("KJ");
    // the parts carry no status attribute (Base UI)
    const attributes = await parts(page, "avatar").evaluateAll((elements) =>
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
    expect(attributes).toEqual([]);
    await expectNoFalseStates(parts(page, "avatar"));
});
