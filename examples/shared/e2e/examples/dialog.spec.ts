import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
import {
    collectErrors,
    EMBED_BASE,
    messages,
    openHosted,
    part,
    promoted,
    requireExamples,
    WCAG,
} from "../helpers.ts";

// dialog: the "Edit profile" dialog (spec/dialog.md). Inside the site's frame its overlay is
// promoted over the whole page (contract §5.4): the frame covers the viewport while the dialog is
// open, the example does not move, and the frame goes back once the dialog has fully closed.

/** The promotion messages the embed sent, in order. */
async function promotionOrder(page: Page): Promise<string> {
    return (await messages(page))
        .filter(
            (m) =>
                m.type === "fragiola:example:overlay" ||
                m.type === "fragiola:example:armed",
        )
        .map((m) =>
            m.type === "fragiola:example:armed" ? "armed" : `overlay:${m.open}`,
        )
        .join(" → ");
}

test("opens a modal dialog with focus inside, and closes on Escape", async ({
    page,
}) => {
    const errors = collectErrors(page);
    const frame = await openHosted(page, { id: "dialog" });
    const trigger = frame.getByRole("button", { name: "Edit profile" });
    await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveAttribute(
        "data-primitives-part",
        "dialog-trigger",
    );

    await trigger.click();
    const dialog = frame.getByRole("dialog", { name: "Edit profile" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute(
        "data-primitives-part",
        "dialog-popup",
    );
    await expect(dialog).toHaveAttribute("data-open", "");
    await expect(trigger).toHaveAttribute("data-popup-open", "");
    await expect(frame.getByLabel("Name", { exact: true })).toBeFocused();

    // Tab stays inside the dialog
    await page.keyboard.press("Tab");
    await expect(frame.getByLabel("Username")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(frame.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(frame.getByRole("button", { name: "Save" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(frame.getByLabel("Name", { exact: true })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(trigger).not.toHaveAttribute("data-popup-open");
    expect(errors).toEqual([]);
});

test("its overlay is promoted over the page while it is open", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "dialog" });
    const trigger = frame.getByRole("button", { name: "Edit profile" });
    const before = await trigger.boundingBox();
    expect(await promoted(page)).toBe(false);

    await trigger.click();
    await expect(frame.getByRole("dialog")).toBeVisible();
    expect(await promoted(page)).toBe(true);
    await expect.poll(() => promotionOrder(page)).toBe("overlay:true → armed");
    // the frame covers the viewport, and the example stays where it was
    const box = await page.getByTestId("frame").boundingBox();
    const viewport = page.viewportSize();
    expect(box).toMatchObject({ x: 0, y: 0, ...viewport });
    const during = await trigger.boundingBox();
    expect(during?.x).toBeCloseTo(before?.x ?? Number.NaN, 0);
    expect(during?.y).toBeCloseTo(before?.y ?? Number.NaN, 0);
    // the backdrop covers the whole page, not only the frame's box
    const backdrop = await frame.locator(part("dialog-backdrop")).boundingBox();
    expect(backdrop).toMatchObject({ x: 0, y: 0, ...viewport });

    await frame.getByRole("button", { name: "Save" }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect
        .poll(() => promotionOrder(page))
        .toBe("overlay:true → armed → overlay:false");
    await expect.poll(() => promoted(page)).toBe(false);
    const after = await trigger.boundingBox();
    expect(after?.y).toBeCloseTo(before?.y ?? Number.NaN, 0);
    await expect(trigger).toBeFocused();
});

test("an older site that never says host gets the dialog in place", async ({
    page,
}) => {
    const frame = await openHosted(page, { id: "dialog", legacy: true });
    await frame.getByRole("button", { name: "Edit profile" }).click();
    await expect(frame.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(200);
    expect(await promoted(page)).toBe(false);
    expect(await promotionOrder(page)).toBe("");
    await frame.getByRole("button", { name: "Cancel" }).click();
    await expect(frame.getByRole("dialog")).toHaveCount(0);
});

test("a press on the backdrop closes it", async ({ page }) => {
    const frame = await openHosted(page, { id: "dialog" });
    await frame.getByRole("button", { name: "Edit profile" }).click();
    await expect(frame.getByRole("dialog")).toBeVisible();
    await page.mouse.click(8, 8);
    await expect(frame.getByRole("dialog")).toHaveCount(0);
    await expect.poll(() => promoted(page)).toBe(false);
});

test("axe finds no violation with the dialog open", async ({ page }) => {
    requireExamples("dialog");
    await page.goto(`${EMBED_BASE}?id=dialog`);
    await page.getByRole("button", { name: "Edit profile" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    expect(results.violations).toEqual([]);
});
