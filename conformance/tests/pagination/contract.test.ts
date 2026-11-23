import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/pagination.md: anatomy, elements, the current page and the disabled edges
test("pagination / basic: parts, elements and state attributes", async ({
    page,
}) => {
    await openScenario(page, "/pagination/basic");
    const root = part(page, "pagination", "root");
    await expect(root).toHaveCount(1);
    expect(await root.evaluate((element) => element.localName)).toBe("nav");
    await expect(root).toHaveAttribute("aria-label", "Results pages");
    await expect(root).not.toHaveAttribute("data-disabled");
    await expect(part(root, "pagination", "item")).toHaveCount(5);
    await expect(part(root, "pagination", "ellipsis")).toHaveCount(2);
    for (const name of ["first", "previous", "next", "last"]) {
        const control = part(root, "pagination", name);
        await expect(control).toHaveCount(1);
        expect(await control.evaluate((element) => element.localName)).toBe(
            "button",
        );
        await expect(control).toHaveAttribute("type", "button");
        await expect(control).not.toHaveAttribute("data-disabled");
    }
    const items = part(root, "pagination", "item");
    for (const item of await items.all()) {
        expect(await item.evaluate((element) => element.localName)).toBe(
            "button",
        );
        await expect(item).toHaveAttribute("type", "button");
    }
    const ellipsis = part(root, "pagination", "ellipsis").first();
    expect(await ellipsis.evaluate((element) => element.localName)).toBe(
        "span",
    );
    const currentItem = page.locator(
        '[data-primitives-part="pagination-item"][data-current]',
    );
    await expect(currentItem).toHaveCount(1);
    await expect(currentItem).toHaveText("5");
    await expect(currentItem).toHaveAttribute("aria-current", "page");
    await expect(currentItem).toHaveAttribute("data-current", "");

    await part(root, "pagination", "last").click();
    for (const name of ["next", "last"]) {
        const control = part(root, "pagination", name);
        await expect(control).toHaveAttribute("data-disabled", "");
        await expect(control).toHaveAttribute("disabled", "");
    }
    for (const name of ["first", "previous"]) {
        await expect(part(root, "pagination", name)).not.toHaveAttribute(
            "data-disabled",
        );
    }
    await expectNoFalseStates(parts(page, "pagination"));
});

test("pagination / links: links carry `aria-disabled`, no `type` and no `disabled`", async ({
    page,
}) => {
    await openScenario(page, "/pagination/links");
    const root = part(page, "pagination", "root");
    const previous = part(root, "pagination", "previous");
    expect(await previous.evaluate((element) => element.localName)).toBe("a");
    await expect(previous).toHaveAttribute("aria-disabled", "true");
    await expect(previous).toHaveAttribute("data-disabled", "");
    await expect(previous).not.toHaveAttribute("type");
    await expect(previous).not.toHaveAttribute("disabled");
    await expect(previous).not.toHaveAttribute("role");
    const first = part(root, "pagination", "item").first();
    expect(await first.evaluate((element) => element.localName)).toBe("a");
    await expect(first).toHaveAttribute("href", "#page-1");
    await expect(first).toHaveAttribute("aria-current", "page");
    await expect(first).toHaveAttribute("data-current", "");
    await expect(first).not.toHaveAttribute("type");
    await expect(part(root, "pagination", "item")).toHaveCount(6);
    await expect(part(root, "pagination", "ellipsis")).toHaveCount(1);
    await expectNoFalseStates(parts(page, "pagination"));
});
