import { expect, test } from "@playwright/test";
import { expectNoFalseStates, part, parts } from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/link.md: the part, its element and its state attributes
test("link / basic: the part, an anchor, with its states", async ({ page }) => {
    await openScenario(page, "/link/basic");
    const links = part(page, "link", "root");
    await expect(links).toHaveCount(3);
    for (const element of await links.all()) {
        expect(await element.evaluate((node) => node.localName)).toBe("a");
        await expect(element).not.toHaveAttribute("role");
        await expect(element).not.toHaveAttribute("tabindex");
    }
    const home = links.nth(0);
    const docs = links.nth(1);
    const archive = links.nth(2);
    await expect(home).toHaveAttribute("data-current", "");
    await expect(home).not.toHaveAttribute("data-disabled");
    await expect(docs).not.toHaveAttribute("data-current");
    await expect(docs).not.toHaveAttribute("aria-disabled");
    await expect(archive).toHaveAttribute("data-disabled", "");
    await expect(archive).not.toHaveAttribute("data-current");
    await expectNoFalseStates(parts(page, "link"));
});

test("link / router: the router's anchor carries the part", async ({
    page,
}) => {
    await openScenario(page, "/link/router");
    const links = part(page, "link", "root");
    await expect(links).toHaveCount(2);
    for (const element of await links.all()) {
        expect(await element.evaluate((node) => node.localName)).toBe("a");
    }
    await expect(links.first()).toHaveAttribute("href", "/settings");
    await expect(links.last()).toHaveAttribute("data-disabled", "");
    await expectNoFalseStates(parts(page, "link"));
});
