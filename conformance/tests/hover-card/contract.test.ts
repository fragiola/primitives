import { expect, type Page, test } from "@playwright/test";
import {
    expectNoFalseStates,
    expectOpenState,
    part,
    parts,
} from "../../src/contract.ts";
import { openScenario } from "../../src/scenario.ts";

// spec/hover-card.md: anatomy, the link trigger, a popup with no role

const link = (page: Page, name: string) =>
    page.getByRole("link", { name, exact: true });

test("hover-card / basic: parts, the link, a card with no role", async ({
    page,
}) => {
    await openScenario(page, "/hover-card/basic");
    const trigger = part(page, "hover-card", "trigger");
    expect(await trigger.evaluate((element) => element.tagName)).toBe("A");
    await expect(trigger).toHaveAttribute("href", "#ada");
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    await expect(trigger).not.toHaveAttribute("aria-expanded");
    await expect(trigger).not.toHaveAttribute("aria-describedby");
    await link(page, "@ada").hover();
    const popup = part(page, "hover-card", "popup");
    await expect(popup).toBeVisible({ timeout: 5000 });
    await expect(popup).not.toHaveAttribute("role");
    await expect(popup).toHaveAttribute("tabindex", "-1");
    await expect(popup).toHaveAttribute("id", /.+/);
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(trigger).not.toHaveAttribute("data-open");
    const positioner = part(page, "hover-card", "positioner");
    await expect(positioner).toHaveAttribute("role", "presentation");
    await expect(positioner).toHaveAttribute("data-side", "bottom");
    await expect(positioner).toHaveAttribute("data-align", "center");
    await expect(popup).toHaveAttribute("data-side", "bottom");
    await expectOpenState(popup, true);
    await expect(part(page, "hover-card", "arrow")).toHaveAttribute(
        "aria-hidden",
        "true",
    );
    // the opening never moves focus
    await expect(page.locator("body")).toBeFocused();
    await expectNoFalseStates(parts(page, "hover-card"));
});

test("hover-card / detached: the backdrop, data-popup-open on the active trigger, data-instant on a move", async ({
    page,
}) => {
    await openScenario(page, "/hover-card/detached");
    await link(page, "@ada").hover();
    const popup = part(page, "hover-card", "popup");
    await expect(popup).toBeVisible({ timeout: 5000 });
    await expect(popup).not.toHaveAttribute("data-instant");
    const backdrop = part(page, "hover-card", "backdrop");
    await expect(backdrop).toHaveAttribute("role", "presentation");
    await expectOpenState(backdrop, true);
    await expect(backdrop).toHaveCSS("pointer-events", "none");
    await link(page, "@grace").hover();
    await expect(popup).toHaveText("Profile of Grace");
    await expect(popup).toHaveAttribute("data-instant", "");
    await expect(page.locator("#grace")).toHaveAttribute("data-popup-open", "");
    await expect(page.locator("#ada")).not.toHaveAttribute("data-popup-open");
    await expectNoFalseStates(parts(page, "hover-card"));
});
