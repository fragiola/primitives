import { expect, test } from "@playwright/test";
import {
    axeViolations,
    collectErrors,
    EMBED_BASE,
    openHosted,
    part,
    requireExamples,
} from "../helpers.ts";

// accordion: frequently asked questions (spec/accordion.md). Four questions, "How long does
// shipping take?" open, one at a time, the answers hidden until found while closed. An Accordion
// opens no modal overlay: never promoted.

test("one answer at a time; the arrows move between the questions", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "accordion" });
    const question = (name: string) =>
        frame.getByRole("button", { name, exact: true });
    const shipping = question("How long does shipping take?");
    const returns = question("Can I return an item?");

    await expect(frame.getByRole("heading", { level: 3 })).toHaveCount(4);
    await expect(shipping).toHaveAttribute("aria-expanded", "true");
    await expect(
        frame.getByRole("region", { name: "How long does shipping take?" }),
    ).toBeVisible();

    await returns.click();
    await expect(returns).toHaveAttribute("aria-expanded", "true");
    await expect(shipping).toHaveAttribute("aria-expanded", "false");
    await expect(
        frame.getByRole("region", { name: "Can I return an item?" }),
    ).toContainText("free for thirty days");

    await returns.focus();
    await page.keyboard.press("ArrowDown");
    await expect(question("Is there a warranty?")).toBeFocused();
    await page.keyboard.press("End");
    await expect(question("How do I reach support?")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(shipping).toBeFocused();
    expect(errors).toEqual([]);
});

test("find-in-page opens the answer that matches", async ({ page }) => {
    const frame = await openHosted(page, { id: "accordion" });
    const panels = frame.locator(part("accordion-panel"));
    await expect(panels).toHaveCount(4);
    await expect(panels.nth(2)).toHaveAttribute("hidden", "until-found");
    await frame.locator("body").evaluate(() => {
        location.hash = ":~:text=against%20defects";
    });
    await expect(
        frame.getByRole("button", { name: "Is there a warranty?" }),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
        frame.getByRole("button", { name: "How long does shipping take?" }),
    ).toHaveAttribute("aria-expanded", "false");
});

test("axe finds no violation", async ({ page }) => {
    requireExamples("accordion");
    await page.goto(`${EMBED_BASE}?id=accordion`);
    await expect(page.getByRole("heading").first()).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
});
