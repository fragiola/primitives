import { expect, type Locator, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

const localName = (locator: Locator) =>
    locator.evaluate((element) => element.localName);

// spec/breadcrumbs.md: the parts, their elements and their attributes
test("breadcrumbs / basic: parts, elements and state attributes", async ({
    page,
}) => {
    await openScenario(page, "/breadcrumbs/basic");
    const root = part(page, "breadcrumbs", "root");
    await expect(root).toHaveCount(1);
    expect(await localName(root)).toBe("nav");
    await expect(root).toHaveAttribute("aria-label", "Breadcrumb");
    const list = part(root, "breadcrumbs", "list");
    expect(await localName(list)).toBe("ol");
    const items = part(list, "breadcrumbs", "item");
    await expect(items).toHaveCount(4);
    for (const item of await items.all()) {
        expect(await localName(item)).toBe("li");
    }
    const separators = part(list, "breadcrumbs", "separator");
    await expect(separators).toHaveCount(3);
    for (const separator of await separators.all()) {
        expect(await localName(separator)).toBe("li");
        await expect(separator).toHaveAttribute("aria-hidden", "true");
        await expect(separator).toHaveText("/");
    }
    // every child of the list is a list item: an Item or a Separator, in turn
    expect(
        await list.evaluate((element) =>
            [...element.children].map((child) =>
                child.getAttribute("data-primitives-part"),
            ),
        ),
    ).toEqual([
        "breadcrumbs-item",
        "breadcrumbs-separator",
        "breadcrumbs-item",
        "breadcrumbs-separator",
        "breadcrumbs-item",
        "breadcrumbs-separator",
        "breadcrumbs-item",
    ]);
    const links = part(list, "breadcrumbs", "link");
    await expect(links).toHaveCount(4);
    for (const link of await links.all()) {
        expect(await localName(link)).toBe("a");
    }
    await expect(links.nth(2)).toHaveAttribute("data-disabled", "");
    await expect(links.nth(3)).toHaveAttribute("data-current", "");
    await expect(links.nth(3)).toHaveAttribute("aria-current", "page");
    await expect(links.nth(0)).not.toHaveAttribute("data-current");
    await expectNoFalseStates(parts(page, "breadcrumbs"));
});

test("breadcrumbs / collapsed: the Current and the Ellipsis", async ({
    page,
}) => {
    await openScenario(page, "/breadcrumbs/collapsed");
    const current = part(page, "breadcrumbs", "current");
    await expect(current).toHaveCount(1);
    expect(await localName(current)).toBe("span");
    await expect(current).toHaveAttribute("aria-current", "page");
    const ellipsis = page.getByRole("button", {
        name: "Show the hidden pages",
    });
    expect(await localName(ellipsis)).toBe("button");
    await expect(ellipsis).toHaveAttribute("type", "button");
    await expect(part(page, "breadcrumbs", "item")).toHaveCount(4);
    await expect(part(page, "breadcrumbs", "link")).toHaveCount(2);
    await expectNoFalseStates(parts(page, "breadcrumbs"));
});
